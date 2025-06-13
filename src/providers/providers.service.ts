import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { FilterPaginationDto } from 'src/common/dto/filter-pagination.dto';
import { RpcException } from '@nestjs/microservices';
import { providersSeeder } from './seed/providers.seeder';


@Injectable()
export class ProvidersService {

  constructor(
    private readonly prisma: PrismaService
  ) { }

  async create(createProviderDto: CreateProviderDto) {

    const { contacts, ...restProvider } = createProviderDto;

    try {

      await this.prisma.provider.create({
        data: {
          ...restProvider,
          contacts: {
            create: contacts
          }
        }
      })

      return {
        message: 'Proveedor creado exitosamente',
      };

    } catch (error) {
      console.log(error);
      if(  error.code === 'P2002' && error.meta?.target?.includes('code') ) {
        throw new RpcException({
          status: 400,
          message: 'El código del proveedor ya existe',
        });
      }
    }
  }

  async findAll(filterPaginationDto: FilterPaginationDto) {
    const { page, limit, search } = filterPaginationDto;

    const filters: any[] = [];

    if (search) {
      filters.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    // Si existen filtros, los combinamos en un AND; de lo contrario, la consulta no tiene filtro
    const whereClause = filters.length > 0 ? { AND: filters } : {};

    // Ejecutamos la consulta de conteo y búsqueda con el mismo whereClause
    const [totalProviders, providers] = await Promise.all([
      this.prisma.provider.count({
        where: whereClause,
      }),
      this.prisma.provider.findMany({
        take: limit,
        skip: (page! - 1) * limit!,
        orderBy: { updatedAt: 'desc' },
        where: { ...whereClause, },
      }),
    ]);

    const lastPage = Math.ceil(totalProviders / limit!);

    return {
      providers,
      meta: {
        page,
        lastPage,
        total: totalProviders,
      },
    };
  }

  async findOne(id: string) {
    try {
      const provider = await this.prisma.provider.findFirstOrThrow({
        where: { id },
        include: {
          contacts: {
            omit: {
              createdAt: true,
              updatedAt: true,
              providerId: true,
            }
          },
        },
      });

      return provider;
      
    } catch (error) {
      console.log(error)
      if (error.code === 'P2025') {
        throw new RpcException({
          status: 404,
          message: 'Proveedor no encontrado',
        });
      } else {
        throw new RpcException({
          status: 500,
          message: 'Error al buscar el proveedor',
        });
      }
    }
  }

  update(id: string, updateProviderDto: UpdateProviderDto) {
    const { contacts, ...restProvider } = updateProviderDto;

    return this.prisma.$transaction(async (prisma) => {
      try {
        // Actualizar el proveedor
        const updatedProvider = await prisma.provider.update({
          where: { id },
          data: {
            ...restProvider,
            contacts: {
              deleteMany: {},
              create: contacts,
            },
          },
          include: {
            contacts: true,
          },
        });

        return updatedProvider;

      } catch (error) {
        console.log(error);
        if (error.code === 'P2025') {
          throw new RpcException({
            status: 404,
            message: 'Proveedor no encontrado',
          });
        } else {
          throw new RpcException({
            status: 500,
            message: 'Error al actualizar el proveedor',
          });
        }
      }
    });
  }

  async seed() {
    try {      
      await this.prisma.providerContact.deleteMany({});
      await this.prisma.provider.deleteMany({});
  
      const providerSeederPromise = providersSeeder.map(async (provider) => {
        this.create(provider)
      })

      await Promise.all(providerSeederPromise);

      return {
        message: 'Proveedores sembrados exitosamente',
      };
    } catch (error) {
      console.log(error);
      throw new RpcException({
        status: 400,
        message: 'Error al sembrar los proveedores',
      });
    }
  }
}
