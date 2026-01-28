import {
  IsString,
  IsOptional,
  IsInt,
  IsDateString,
  IsArray,
  IsEnum,
  IsBoolean,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TareaPrioridad, AsignadoA } from '../enums/cronograma.enum';

export class CreateTareaCronogramaDto {
  @Type(() => Number)
  @IsInt()
  cronogramaId: number;

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

  @IsDateString()
  fechaInicio: string;

  @IsDateString()
  fechaFin: string;

  @IsOptional()
  @IsEnum(TareaPrioridad)
  prioridad?: TareaPrioridad;

  @IsOptional()
  @IsEnum(AsignadoA)
  asignadoA?: AsignadoA;

  @IsOptional()
  @ValidateIf((o) => o.tareaPadreId !== null)
  @Type(() => Number)
  @IsInt()
  tareaPadreId?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  orden?: number;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  dependencias?: number[];

  @IsOptional()
  @IsString()
  notas?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  fase?: string;

  @IsOptional()
  @IsBoolean()
  esHito?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  color?: string;
}
