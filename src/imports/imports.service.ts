import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateImportDto } from './dto/create-import.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { FilterPaginationDto } from 'src/common/dto/filter-pagination.dto';
import { ClientProxy } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config/services';
import { ImportOrderStatus } from '@prisma/client';

@Injectable()
export class ImportsService {

    private readonly logger = new Logger('ImportsService');

    constructor(
        private readonly prisma: PrismaService,
        @Inject(NATS_SERVICE) private readonly natsClient: ClientProxy,
    ) { }

    // ─── Dashboard Stats ────────────────────────────────────────────
    async getStats() {

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const [
            totalImports,
            inTransit,
            pending,
            delivered,
            cancelled,
            monthItems,
            openPurchaseOrders,
        ] = await Promise.all([
            this.prisma.importOrder.count(),
            this.prisma.importOrder.count({
                where: { status: ImportOrderStatus.Cursando },
            }),
            this.prisma.importOrder.count({
                where: { status: ImportOrderStatus.Pendiente },
            }),
            this.prisma.importOrder.count({
                where: {
                    status: { in: [ImportOrderStatus.Recibido, ImportOrderStatus.Completado] },
                },
            }),
            this.prisma.importOrder.count({
                where: { status: ImportOrderStatus.Cancelado },
            }),
            // Valor total importado en el mes: sumamos priceUnit * quantityOrdered de los items
            this.prisma.importOrderItem.findMany({
                where: {
                    importOrder: {
                        createdAt: { gte: startOfMonth },
                    },
                },
                select: {
                    priceUnit: true,
                    quantityOrdered: true,
                    currency: true,
                },
            }),
            // Órdenes de compra abiertas (no completadas ni canceladas)
            this.prisma.importOrder.count({
                where: {
                    status: {
                        notIn: [ImportOrderStatus.Completado, ImportOrderStatus.Cancelado],
                    },
                },
            }),
        ]);

        // Calcular valor total importado en el mes por moneda
        const totalImportedValueUSD = monthItems
            .filter(item => item.currency === 'USD')
            .reduce((sum, item) => sum + Number(item.priceUnit) * item.quantityOrdered, 0);

        const totalImportedValueBOB = monthItems
            .filter(item => item.currency === 'BOB')
            .reduce((sum, item) => sum + Number(item.priceUnit) * item.quantityOrdered, 0);

        return {
            totalImports,
            inTransit,
            pending,
            delivered,
            cancelled,
            totalImportedValueUSD: parseFloat(totalImportedValueUSD.toFixed(2)),
            totalImportedValueBOB: parseFloat(totalImportedValueBOB.toFixed(2)),
            openPurchaseOrders,
        };
    }

    async create(createImportDto: CreateImportDto) {

        const { items, ...importData } = createImportDto;

        const orderNumber = `IMP-${Date.now()}`;

        const newImport = await this.prisma.importOrder.create({
            data: {
                orderNumber,
                ...importData,
                items: {
                    create: items, // asume que 'items' es un array con shape { productId, quantityOrdered, priceUnit, ... } coincidente con tu modelo Prisma
                },
            }
        });

        return {
            message: 'Orden de importación creada correctamente',
            import: newImport, // opcional retornar data creada
        };
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
            this.prisma.importOrder.count({
                where: whereClause,
            }),
            this.prisma.importOrder.findMany({
                take: limit,
                skip: (page! - 1) * limit!,
                orderBy: { updatedAt: 'desc' },
                where: { ...whereClause, },
                select: {
                    orderNumber: true,
                    issueDate: true,
                    expectedArrival: true,
                    actualArrival: true,
                    providerName: true,
                    warehouseName: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true,
                    incoterm: true,
                    _count: { select: { items: true } },
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

    async findOne(orderNumber: string) {
        const purchaseOrder = await this.prisma.importOrder.findUnique({
            where: { orderNumber },

            include: {
                items: {
                    omit: {
                        importOrderId: true,
                        updatedAt: true,
                    }
                },
            },
        });

        return {
            purchaseOrder,
        }
    }

    async changeStatus(orderNumber: string, newStatus: ImportOrderStatus) {
        const updatedImport = await this.prisma.importOrder.update({
            where: { orderNumber },
            data: { status: newStatus },
            include: {
                items: {
                    select: { productId: true, quantityReceived: true, quantityOrdered: true }
                }
            }
        });

        if( newStatus === ImportOrderStatus.Completado ) {
            this.natsClient.emit('inventories.updateSock', {
                warehouseId: updatedImport.warehouseId,
                items: updatedImport.items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantityReceived ?? item.quantityOrdered, // si no se ha recibido nada, asumimos que se recibe todo lo ordenado
                }))
            });
        }

        return {
            message: 'Estado de importación actualizado correctamente',
            import: updatedImport,
        };
    }

}
