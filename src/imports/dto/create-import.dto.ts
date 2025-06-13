import { $Enums, Prisma } from "@prisma/client";
import { DecimalJsLike } from "@prisma/client/runtime/library";
import { IsArray, IsDate, IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";
import { PurchaseOrderStatus } from "../types/purchase-order-status.enum";

export class CreateImportDto implements Prisma.PurchaseOrderCreateInput{
    @IsString()
    orderNumber: string;
    
    @IsString()
    version?: string | null | undefined;
    
    @IsString()
    validUntil?: string | Date | null | undefined;
    
    @IsString()
    issueDate?: string | Date | undefined;
    
    @IsString()
    containerInfo?: string | null | undefined;
    
    @IsNumber({ allowNaN: false, allowInfinity: false }, { each: true, message: 'El monto debe ser un numero' })
    @IsArray()
    paymentTerms?: Prisma.PurchaseOrderCreatepaymentTermsInput | Prisma.Decimal[] | DecimalJsLike[] | number[] | string[] | undefined;
    
    @IsEnum(PurchaseOrderStatus, { message: 'El estado debe ser un valor valido' })
    status?: PurchaseOrderStatus | undefined;
    
    @IsString({ message: 'El incoterm debe ser un texto' })
    incoterm?: string | null | undefined;
    
    @IsString({ message: 'El proforma de referencia debe ser un texto' })
    referenceProforma?: string | null | undefined;
    
    @IsString({ message: 'El numero de orden de compra debe ser un texto' })
    @IsOptional()
    deliveryTerms?: string | null | undefined;
    
    @IsDateString()
    @IsOptional()
    expectedArrival?: string | Date | null | undefined;
    
    @IsDateString()
    @IsOptional()
    actualArrival?: string | Date | null | undefined;
    
    @IsUUID(4, { message: 'Error al registrar usuario, uuid no valido' })
    createdBy: string;
    
    items?: Prisma.PurchaseOrderItemCreateNestedManyWithoutPurchaseOrderInput | undefined;

    supplier: Prisma.SupplierCreateNestedOneWithoutPurchaseOrdersInput;
}
