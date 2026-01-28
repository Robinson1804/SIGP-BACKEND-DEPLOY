import {
  IsString,
  IsOptional,
  IsInt,
  IsDateString,
  MaxLength,
} from 'class-validator';

export class CreateCronogramaDto {
  @IsOptional()
  @IsInt()
  proyectoId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  codigo?: string;

  @IsString()
  @MaxLength(200)
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsInt()
  version?: number;

  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;
}
