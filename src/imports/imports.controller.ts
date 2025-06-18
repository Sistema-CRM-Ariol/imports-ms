import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ImportsService } from './imports.service';
import { CreateImportDto } from './dto/create-import.dto';
import { UpdateImportDto } from './dto/update-import.dto';
import { FilterPaginationDto } from 'src/common/dto/filter-pagination.dto';

@Controller()
export class ImportsController {
  constructor(private readonly importsService: ImportsService) {}

  @MessagePattern('createImport')
  create(@Payload() createImportDto: CreateImportDto) {
    return this.importsService.create(createImportDto);
  }

  @MessagePattern('findAllImports')
  findAll(@Payload() filterPaginationDto: FilterPaginationDto) {
    return this.importsService.findAll(filterPaginationDto);
  }

  @MessagePattern('findOneImport')
  findOne(@Payload() id: string) {
    return this.importsService.findOne(id);
  }

  @MessagePattern('updateImport')
  update(@Payload() payload: {id: string, updateImportDto: UpdateImportDto}) {
    console.log(payload)
    return this.importsService.update(payload.id, payload.updateImportDto);
  }

  @MessagePattern('removeImport')
  remove(@Payload() id: string) {
    return this.importsService.remove(id);
  }
}
