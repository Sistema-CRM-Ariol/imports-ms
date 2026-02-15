import { IsArray, IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { CreateImportItemDto } from "./create-import-item.dto";
import { ImportOrderStatus } from "../types/import-ordes-status.type";

export class CreateImportDto {


    @IsOptional()
    @IsDateString({}, { message: 'issueDate debe ser una fecha válida en formato ISO 8601' })
    issueDate?: string; // si prefieres que se autogenere, puedes omitirlo del DTO y usar default en el servicio
    
    @IsOptional()
    @IsDateString({}, { message: 'expectedArrival debe ser una fecha válida ISO 8601' })
    expectedArrival?: string | Date;
    
    @IsOptional()
    @IsDateString({}, { message: 'actualArrival debe ser una fecha válida ISO 8601' })
    actualArrival?: string | Date;
    
    @IsUUID('4', { message: 'El ID del proveedor debe ser un UUID válido' })
    @IsNotEmpty({ message: 'El campo providerId es obligatorio' })
    providerId: string;

    @IsNotEmpty({ message: 'El nombre del proveedor es obligatorio' })
    @IsString({ message: 'El nombre del proveedor debe ser un texto' })
    providerName: string;
    
    @IsOptional()
    @IsString({ message: 'incoterm debe ser un texto' })
    incoterm?: string;
    
    @IsEnum(ImportOrderStatus, {
        message: 'El estado debe ser uno de: PENDING, APPROVED, IN_TRANSIT, RECEIVED, CANCELLED',
    })
    @IsOptional()
    status?: ImportOrderStatus | undefined;
    
    @IsUUID('4', { message: 'createdBy debe ser un UUID válido' })
    warehouseId: string;
    
    @IsNotEmpty({ message: 'El nombre del almacén es obligatorio' })
    @IsString({ message: 'El nombre del almacén debe ser un texto' })
    warehouseName: string | null | undefined;
    
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => CreateImportItemDto)
    @IsArray({ message: 'items debe ser un arreglo de ítems' })
    items?: CreateImportItemDto[];
}
