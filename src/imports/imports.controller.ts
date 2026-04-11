import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ImportsService } from './imports.service';
import { CreateImportDto } from './dto/create-import.dto';
import { UpdateImportDto } from './dto/update-import.dto';
import { FilterPaginationDto } from 'src/common/dto/filter-pagination.dto';
import { ImportOrderStatus } from './types/import-ordes-status.type';

@Controller()
export class ImportsController {
    constructor(private readonly importsService: ImportsService) { }

    @MessagePattern('imports.stats')
    getStats() {
        return this.importsService.getStats();
    }

    @MessagePattern('imports.create')
    create(@Payload() createImportDto: CreateImportDto) {
        return this.importsService.create(createImportDto);
    }

    @MessagePattern('imports.findAll')
    findAll(@Payload() filterPaginationDto: FilterPaginationDto) {
        return this.importsService.findAll(filterPaginationDto);
    }

    @MessagePattern('imports.findOne')
    findOne(@Payload() orderNumber: string) {
        return this.importsService.findOne(orderNumber);
    }

    @MessagePattern('imports.changeStatus')
    changeStatus(@Payload() payload: { orderNumber: string; status: ImportOrderStatus }) {
        return this.importsService.changeStatus(payload.orderNumber, payload.status);
    }
}
