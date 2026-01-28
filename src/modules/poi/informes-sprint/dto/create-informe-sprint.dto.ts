import {
  IsString,
  IsOptional,
  IsInt,
  IsArray,
  IsDateString,
  IsNumber,
  MaxLength,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

class HistoriaPlanificadaDto {
  @IsString()
  id: string;

  @IsString()
  titulo: string;

  @IsInt()
  puntos: number;

  @IsString()
  estado: string;
}

class HistoriaCompletadaDto {
  @IsString()
  id: string;

  @IsString()
  titulo: string;

  @IsInt()
  puntos: number;
}

class ImpedimentoDto {
  @IsString()
  descripcion: string;

  @IsOptional()
  @IsString()
  resolucion?: string;

  @IsBoolean()
  resuelto: boolean;
}

class RetrospectivaDto {
  @IsArray()
  @IsString({ each: true })
  queFueBien: string[];

  @IsArray()
  @IsString({ each: true })
  queMejorar: string[];

  @IsArray()
  @IsString({ each: true })
  accionesProximoSprint: string[];
}

class BurndownDataPointDto {
  @IsInt()
  dia: number;

  @IsNumber()
  puntosRestantes: number;
}

export class CreateInformeSprintDto {
  @IsInt()
  proyectoId: number;

  @IsString()
  @MaxLength(20)
  codigo: string;

  @IsInt()
  numeroSprint: number;

  @IsDateString()
  fechaInicio: string;

  @IsDateString()
  fechaFin: string;

  @IsOptional()
  @IsString()
  objetivoSprint?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HistoriaPlanificadaDto)
  historiasPlanificadas?: HistoriaPlanificadaDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HistoriaCompletadaDto)
  historiasCompletadas?: HistoriaCompletadaDto[];

  @IsOptional()
  @IsInt()
  puntosPlanificados?: number;

  @IsOptional()
  @IsInt()
  puntosCompletados?: number;

  @IsOptional()
  @IsNumber()
  velocidadSprint?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImpedimentoDto)
  impedimentos?: ImpedimentoDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => RetrospectivaDto)
  retrospectiva?: RetrospectivaDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BurndownDataPointDto)
  burndownData?: BurndownDataPointDto[];

  @IsOptional()
  @IsString()
  observaciones?: string;
}
