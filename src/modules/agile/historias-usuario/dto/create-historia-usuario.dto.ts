import {
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
  IsArray,
  IsBoolean,
  MaxLength,
  ValidateNested,
  Min,
  Max,
  IsDateString,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { HuPrioridad, HuEstimacion, HuEstado } from '../enums/historia-usuario.enum';

class CriterioAceptacionDto {
  @IsString()
  descripcion: string;

  @IsOptional()
  @IsBoolean()
  completado?: boolean;

  @IsOptional()
  @IsInt()
  orden?: number;
}

export class CreateHistoriaUsuarioDto {
  @IsInt()
  proyectoId: number;

  @IsOptional()
  @ValidateIf((o) => o.epicaId !== null)
  @IsInt()
  epicaId?: number | null;

  @IsOptional()
  @ValidateIf((o) => o.sprintId !== null)
  @IsInt()
  sprintId?: number | null;

  @IsString()
  @MaxLength(20)
  codigo: string;

  @IsString()
  @MaxLength(200)
  titulo: string;

  @IsOptional()
  @IsEnum(HuEstado)
  estado?: HuEstado;

  @IsOptional()
  @ValidateIf((o) => o.rol !== null)
  @IsString()
  rol?: string | null;

  @IsOptional()
  @ValidateIf((o) => o.quiero !== null)
  @IsString()
  quiero?: string | null;

  @IsOptional()
  @ValidateIf((o) => o.para !== null)
  @IsString()
  para?: string | null;

  @IsOptional()
  @ValidateIf((o) => o.prioridad !== null)
  @IsEnum(HuPrioridad)
  prioridad?: HuPrioridad | null;

  @IsOptional()
  @IsEnum(HuEstimacion)
  estimacion?: HuEstimacion;

  @IsOptional()
  @ValidateIf((o) => o.storyPoints !== null)
  @IsInt()
  @Min(1)
  @Max(100)
  storyPoints?: number | null;

  // asignadoA ahora es un array de IDs de responsables
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  asignadoA?: number[];

  // Campo de compatibilidad (deprecated, usar asignadoA)
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  responsables?: number[];

  @IsOptional()
  @IsInt()
  ordenBacklog?: number;

  @IsOptional()
  @IsInt()
  requerimientoId?: number;

  @IsOptional()
  @ValidateIf((o) => o.fechaInicio !== null)
  @IsDateString()
  fechaInicio?: string | null;

  @IsOptional()
  @ValidateIf((o) => o.fechaFin !== null)
  @IsDateString()
  fechaFin?: string | null;

  @IsOptional()
  @IsString()
  imagenUrl?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CriterioAceptacionDto)
  criteriosAceptacion?: CriterioAceptacionDto[];
}
