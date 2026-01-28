import {
  IsString,
  IsOptional,
  IsInt,
  IsArray,
  IsEnum,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RequerimientoTipo, RequerimientoPrioridad } from '../enums/requerimiento.enum';

class CriterioAceptacionDto {
  @IsString()
  descripcion: string;

  @IsOptional()
  cumplido?: boolean;
}

export class CreateRequerimientoDto {
  @IsInt()
  proyectoId: number;

  @IsString()
  @MaxLength(20)
  codigo: string;

  @IsString()
  @MaxLength(200)
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsEnum(RequerimientoTipo)
  tipo?: RequerimientoTipo;

  @IsOptional()
  @IsEnum(RequerimientoPrioridad)
  prioridad?: RequerimientoPrioridad;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CriterioAceptacionDto)
  criteriosAceptacion?: CriterioAceptacionDto[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  dependencias?: number[];

  @IsOptional()
  @IsString()
  observaciones?: string;
}
