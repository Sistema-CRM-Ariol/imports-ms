import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateImportDto } from './dto/create-import.dto';
import { UpdateImportDto } from './dto/update-import.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { FilterPaginationDto } from 'src/common/dto/filter-pagination.dto';
import { ClientProxy } from '@nestjs/microservices';
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

    // const products = await firstValueFrom<GetProductsByIdsResponse[]>(
    //   this.natsClient.send('findProductsByIds', items?.map(item => item.productId)
    //   ));

    // const productItems = items?.map(item => {
    //   // Buscar el producto en el array obtenido por NATS
    //   const prod = products.find(p => p.id === item.productId);
    //   if (!prod) {
    //     // Si no se encuentra el producto, lanzar excepción
    //     throw new NotFoundException(`Producto con id ${item.productId} no encontrado`);
    //   }
    //   // Retornar objeto para Prisma. Ajusta los campos según tu schema de Prisma:
    //   return {
    //     productName: prod.name,
    //     ...item
    //   };
    // });

    // 2. Calcular secuencia de orden para este proveedor en el año en curso
    const now = new Date();
    const year = now.getFullYear();
    const yearSuffix = String(year).slice(-2); // últimos dos dígitos del año, e.g., "25"

    // Rango para el año actual: desde 1 de enero a 1 de enero del siguiente año
    const startOfYear = new Date(year, 0, 1);
    const startNextYear = new Date(year + 1, 0, 1);

    // 3. Ejecutar conteo dentro de transacción simple
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

  findOne(id: string) {
    return `This action returns a #${id} import`;
  }

  update(id: string, updateImportDto: UpdateImportDto) {
    return `This action updates a #${id} import`;
  }

  remove(id: string) {
    return `This action removes a #${id} import`;
  }
}
