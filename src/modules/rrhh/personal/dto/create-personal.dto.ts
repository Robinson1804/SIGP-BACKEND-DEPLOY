import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
  IsNumber,
  IsEmail,
  IsDateString,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { Modalidad } from '../enums/modalidad.enum';

export class CreatePersonalDto {
  @IsInt()
  @IsOptional()
  usuarioId?: number;

  @IsInt()
  @IsOptional()
  divisionId?: number;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  codigoEmpleado?: string;

  @IsString()
  @IsOptional()
  @MaxLength(15)
  dni?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombres: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  apellidos: string;

  @IsEmail()
  @IsOptional()
  @MaxLength(150)
  email?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  telefono?: string;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  cargo?: string;

  @IsDateString()
  @IsOptional()
  fechaIngreso?: string;

  @IsEnum(Modalidad)
  @IsOptional()
  modalidad?: Modalidad;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(168)
  horasSemanales?: number;
}
