import { IsArray, IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";
import { PurchaseOrderStatus } from "../types/purchase-order-status.enum";
import { Type } from "class-transformer";
import { CreatePurchaseOrderItemDto } from "./create-purchase-order-item.dto";

export class CreateImportDto{
    @IsString({ message: 'El número de orden debe ser un texto' })
    @IsNotEmpty({ message: 'El número de orden es obligatorio' })
    @IsOptional()
    orderNumber?: string;

    @IsString({ message: 'La versión debe ser un texto' })
    @IsOptional()
    version?: string;

    @IsOptional()
    @IsDateString({}, { message: 'issueDate debe ser una fecha válida en formato ISO 8601' })
    issueDate?: string; // si prefieres que se autogenere, puedes omitirlo del DTO y usar default en el servicio

    @IsUUID('4', { message: 'El ID del proveedor debe ser un UUID válido' })
    @IsNotEmpty({ message: 'El campo providerId es obligatorio' })
    providerId: string;

    @IsEnum(PurchaseOrderStatus, {
        message: 'El estado debe ser uno de: PENDING, APPROVED, IN_TRANSIT, RECEIVED, CANCELLED',
    })
    @IsOptional()
    status?: PurchaseOrderStatus;

    @IsOptional()
    @IsString({ message: 'incoterm debe ser un texto' })
    incoterm?: string;

    @IsOptional()
    @IsDateString({}, { message: 'expectedArrival debe ser una fecha válida ISO 8601' })
    expectedArrival?: string;

    @IsOptional()
    @IsDateString({}, { message: 'actualArrival debe ser una fecha válida ISO 8601' })
    actualArrival?: string;

    @IsUUID('4', { message: 'createdBy debe ser un UUID válido' })
    @IsOptional()
    createdBy: string;

    @IsUUID('4', { message: 'El almacén debe ser un UUID válido' })
    warehouseId: string;


    @IsArray({ message: 'items debe ser un arreglo de ítems' })
    @ValidateNested({ each: true })
    @Type(() => CreatePurchaseOrderItemDto)
    @IsOptional()
    items?: CreatePurchaseOrderItemDto[];
}
