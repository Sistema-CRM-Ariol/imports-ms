import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ImportsService } from './imports.service';
import { CreateImportDto } from './dto/create-import.dto';
import { UpdateImportDto } from './dto/update-import.dto';

@Controller()
export class ImportsController {
  constructor(private readonly importsService: ImportsService) {}

  @MessagePattern('createImport')
  create(@Payload() createImportDto: CreateImportDto) {
    return this.importsService.create(createImportDto);
  }

  @MessagePattern('findAllImports')
  findAll() {
    return this.importsService.findAll();
  }

  @MessagePattern('findOneImport')
  findOne(@Payload() id: string) {
    return this.importsService.findOne(id);
  }

  @MessagePattern('updateImport')
  update(@Payload() updateImportDto: UpdateImportDto) {
    return this.importsService.update(updateImportDto.id, updateImportDto);
  }

  @MessagePattern('removeImport')
  remove(@Payload() id: string) {
    return this.importsService.remove(id);
  }
}
