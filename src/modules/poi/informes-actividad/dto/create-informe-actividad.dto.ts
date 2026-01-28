import {
  IsString,
  IsOptional,
  IsInt,
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsBoolean,
  MaxLength,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PeriodoInforme } from '../enums/informe-actividad.enum';

class TareaPendienteDto {
  @IsString()
  id: string;

  @IsString()
  titulo: string;

  @IsOptional()
  @IsString()
  responsable?: string;

  @IsOptional()
  @IsString()
  fechaLimite?: string;
}

class TareaEnProgresoDto {
  @IsString()
  id: string;

  @IsString()
  titulo: string;

  @IsOptional()
  @IsString()
  responsable?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  porcentajeAvance?: number;
}

class TareaCompletadaDto {
  @IsString()
  id: string;

  @IsString()
  titulo: string;

  @IsOptional()
  @IsString()
  responsable?: string;

  @IsOptional()
  @IsString()
  fechaCompletado?: string;
}

class ProblemaDto {
  @IsString()
  descripcion: string;

  @IsOptional()
  @IsString()
  accion?: string;

  @IsBoolean()
  resuelto: boolean;
}

export class CreateInformeActividadDto {
  @IsInt()
  actividadId: number;

  @IsString()
  @MaxLength(20)
  codigo: string;

  @IsEnum(PeriodoInforme)
  periodo: PeriodoInforme;

  @IsInt()
  numeroPeriodo: number;

  @IsInt()
  anio: number;

  @IsDateString()
  fechaInicio: string;

  @IsDateString()
  fechaFin: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TareaPendienteDto)
  tareasPendientes?: TareaPendienteDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TareaEnProgresoDto)
  tareasEnProgreso?: TareaEnProgresoDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TareaCompletadaDto)
  tareasCompletadas?: TareaCompletadaDto[];

  @IsOptional()
  @IsInt()
  totalTareasPendientes?: number;

  @IsOptional()
  @IsInt()
  totalTareasEnProgreso?: number;

  @IsOptional()
  @IsInt()
  totalTareasCompletadas?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  logros?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProblemaDto)
  problemas?: ProblemaDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  proximasAcciones?: string[];

  @IsOptional()
  @IsString()
  observaciones?: string;
}
