import { Prisma } from "@prisma/client";
import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";
import { CreateProviderContactDto } from "./create-provider-contact.dto";


export class CreateProviderDto {
  @IsString({ message: 'El código del proveedor debe ser un texto' })
  @IsNotEmpty({ message: 'El código del proveedor es obligatorio' })
  code: string;

  @IsString({ message: 'El nombre del proveedor debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre del proveedor es obligatorio' })
  name: string;

  @IsString({ message: 'El país de origen debe ser un texto' })
  @IsOptional()
  country?: string;

  @IsString({ message: 'El NIT o identificación fiscal debe ser un texto' })
  @IsOptional()
  taxId?: string;

  @IsString({ message: 'La dirección debe ser un texto' })
  @IsOptional()
  address?: string;

  @IsArray({ message: 'Los contactos deben enviarse como un arreglo' })
  @ValidateNested({ each: true })
  @Type(() => CreateProviderContactDto)
  @IsOptional()
  contacts?: CreateProviderContactDto[];
}
