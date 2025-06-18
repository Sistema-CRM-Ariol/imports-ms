import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateImportDto } from './dto/create-import.dto';
import { UpdateImportDto } from './dto/update-import.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { FilterPaginationDto } from 'src/common/dto/filter-pagination.dto';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config/services';
import { firstValueFrom } from 'rxjs';
import { GetProductsByIdsResponse } from 'src/common/interfaces/get-products-by-ids-response.interface';

@Injectable()
export class ImportsService {

  constructor(
    private readonly prisma: PrismaService,
    @Inject(NATS_SERVICE) private readonly natsClient: ClientProxy,
  ) { }

  async create(createImportDto: CreateImportDto) {
    const { items, ...purchaseOrderData } = createImportDto;

    // 1. Validar que providerId exista
    const provider = await this.prisma.provider.findUnique({
      where: { id: purchaseOrderData.providerId },
      select: { id: true, code: true },
    });

    if (!provider) {
      throw new NotFoundException('Proveedor no encontrado');
    }

    const now = new Date();
    const year = now.getFullYear();
    const yearSuffix = String(year).slice(-2);

    const startOfYear = new Date(year, 0, 1);
    const startNextYear = new Date(year + 1, 0, 1);

    try {
      const [existingCount] = await this.prisma.$transaction([
        this.prisma.purchaseOrder.count({
          where: {
            providerId: provider.id,
            issueDate: {
              gte: startOfYear,
              lt: startNextYear,
            },
          },
        }),
      ]);

      const nextSequenceNumber = existingCount + 1;
      const seqStr = String(nextSequenceNumber).padStart(3, '0'); // e.g., "001", "002", ...
      const orderNumber = `${seqStr}-${yearSuffix} ${provider.code}`; // e.g., "001-25 BEL"

      // 4. Crear la orden con el orderNumber calculado
      const purchaseOrder = await this.prisma.purchaseOrder.create({
        data: {
          ...purchaseOrderData,
          orderNumber,
          items: {
            create: items,
          }
        },
        include: {
          items: true,
        },
      });

      return purchaseOrder;
    } catch (error) {

      console.log(error)
      throw new InternalServerErrorException('Error al crear la orden de compra');

    }

  }

  async findAll(filterPaginationDto: FilterPaginationDto) {
    const { page, limit, search } = filterPaginationDto;

    const filters: any[] = [];

    if (search) {
      filters.push({
        OR: [
          { orderNumber: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    // Si existen filtros, los combinamos en un AND; de lo contrario, la consulta no tiene filtro
    const whereClause = filters.length > 0 ? { AND: filters } : {};

    // Ejecutamos la consulta de conteo y búsqueda con el mismo whereClause
    const [totalImports, imports] = await Promise.all([
      this.prisma.purchaseOrder.count({
        where: whereClause,
      }),
      this.prisma.purchaseOrder.findMany({
        take: limit,
        skip: (page! - 1) * limit!,
        orderBy: { updatedAt: 'desc' },
        where: { ...whereClause, },
        select: {
          id: true,
          orderNumber: true,
          issueDate: true,
          expectedArrival: true,
          actualArrival: true,
          provider: {
            select: {
              name: true,
            },
          },
          status: true,
          _count: {
            select: {
              items: true,
            }
          }
        }
      }),
    ]);

    const lastPage = Math.ceil(totalImports / limit!);

    return {
      imports,
      meta: {
        page,
        lastPage,
        total: totalImports,
      },
    };
  }

  async findOne(id: string) {

    const purchaseOrder = await this.prisma.purchaseOrder.findUnique({
      where: { id },

      include: {
        items: true,
        provider: {
          select: {
            name: true,
          },
        },
        
      },
    });
    
    return {
      purchaseOrder,
    }
  
  }

  async update(id: string, updateImportDto: UpdateImportDto) {
    const { items, ...purchaseOrderData } = updateImportDto;


    const updatedOrder = await this.prisma.purchaseOrder.update({
      where: { id },
      data: {
        ...purchaseOrderData,
        items: {
          create: items, // asume que 'items' es un array con shape { productId, quantity, unitPrice, ... } coincidente con tu modelo Prisma
        },
      },
      include: {
        items: true,
      },
    });



    // 2. Verificar el estado de la orden
    if (purchaseOrderData.status === 'RECEIVED') {
      // 3. Actualizar stock del inventario de ese almacén
      const warehouseId = updatedOrder.warehouseId;

      if (!warehouseId) {
        console.error(`Orden ${id} tiene estado RECEIVED pero no tiene warehouseId`);
        throw new RpcException({
          message: 'warehouseId no definido en la orden, no se puede actualizar inventario',
          status: 400,
        });
      }

      for (const item of updatedOrder.items) {
        console.log({ item })

        const { productId, quantityOrdered } = item;

        if (quantityOrdered == null) {
          console.warn(`Item en orden ${id} sin quantity definido: producto ${productId}, se omite ajuste`);
          continue;
        }

        try {
          const response = await firstValueFrom(
            this.natsClient.send('adjustInventory', {
              productId,
              warehouseId,
              quantityOrdered,
            }),
          );
          // Opcional: verificar response.success o similar
          if (!response || response.success === false) {
            console.error(`Falló ajuste en Inventario (respuesta negativa) para productId=${productId}, warehouseId=${warehouseId}`);
            // Decide si lanzar o continuar
            throw new Error('Inventario no ajustado correctamente');
          }
          console.log(`Ajuste de inventario exitoso: productId=${productId}, warehouseId=${warehouseId}, quantity=${quantityOrdered}`);

          await this.prisma.purchaseOrder.update({
            where: { id },
            data: {
              actualArrival: new Date(),
            } // Asumimos que se actualiza la fecha de llegada real al recibir la orden
          });


        } catch (err) {
          console.error(`Error ajustando inventario para productId=${productId}, warehouseId=${warehouseId}`, err);
          // Dependiendo de tu lógica de negocio, podrías:
          // - Lanzar excepción para abortar completamente:
          throw new InternalServerErrorException(`Error al ajustar inventario para productId=${productId}`);
          // - O bien: almacenar en una tabla de “ajustes pendientes” para reintento posterior.
        }
      }
    }

    return {
      message: 'Orden de compra actualizada correctamente',
      order: updatedOrder, // opcional retornar data actualizada
    };
  }

  remove(id: string) {
    return `This action removes a #${id} import`;
  }
}
