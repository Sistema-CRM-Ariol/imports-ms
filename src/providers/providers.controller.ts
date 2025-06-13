import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProvidersService } from './providers.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { FilterPaginationDto } from 'src/common/dto/filter-pagination.dto';

@Controller()
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @MessagePattern('createProvider')
  create(@Payload() createProviderDto: CreateProviderDto) {
    return this.providersService.create(createProviderDto);
  }

  @MessagePattern('findAllProviders')
  findAll(@Payload() filterPaginationDto: FilterPaginationDto) {
    return this.providersService.findAll(filterPaginationDto);
  }

  @MessagePattern('findOneProvider')
  findOne(@Payload() id: string  ) {
    return this.providersService.findOne(id);
  }

  @MessagePattern('updateProvider')
  update(@Payload() payload: { id: string; updateProviderDto: UpdateProviderDto }) {
    return this.providersService.update(payload.id, payload.updateProviderDto);
  }
}
