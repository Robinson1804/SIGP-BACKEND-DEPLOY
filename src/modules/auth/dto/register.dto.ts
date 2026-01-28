import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsEnum,
  IsOptional,
  IsNotEmpty,
  Matches,
} from 'class-validator';
import { Role } from '../../../common/constants/roles.constant';

export class RegisterDto {
  @ApiProperty({ example: 'usuario@inei.gob.pe' })
  @IsEmail({}, { message: 'Email debe ser valido' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'jperez',
    description: 'Nombre de usuario unico (3-100 caracteres, solo letras, numeros y guiones)',
  })
  @IsString()
  @MinLength(3, { message: 'Username debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'Username no puede exceder 100 caracteres' })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Username solo puede contener letras, numeros, guiones y guiones bajos',
  })
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Juan' })
  @IsString()
  nombre: string;

  @ApiProperty({ example: 'Perez' })
  @IsString()
  apellido: string;

  @ApiProperty({ enum: Role, example: Role.DESARROLLADOR })
  @IsEnum(Role)
  rol: Role;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  telefono?: string;
}
