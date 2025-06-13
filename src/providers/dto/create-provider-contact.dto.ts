// create-provider-contact-nested.dto.ts
import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsEmail,
    IsBoolean,
    Length,
} from 'class-validator';

export class CreateProviderContactDto {
    @IsString({ message: 'El nombre completo del contacto debe ser un texto' })
    @IsNotEmpty({ message: 'El nombre completo del contacto es obligatorio' })
    fullName: string;

    @IsEmail({}, { message: 'El correo electrónico debe tener un formato válido' })
    @IsOptional()
    email?: string;

    @IsString({ message: 'El teléfono debe ser un texto' })
    @IsOptional()
    @Length(4, 20, {
        message: 'El teléfono debe tener entre $constraint1 y $constraint2 caracteres',
    })
    phone?: string;

    @IsString({ message: 'La posición o cargo debe ser un texto' })
    @IsOptional()
    position?: string;
}
