import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { ImpedimentoPrioridad } from '../enums/impedimento.enum';

export class CreateImpedimentoDto {
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsInt()
  @IsNotEmpty()
  proyectoId: number;

  @IsInt()
  @IsOptional()
  sprintId?: number;

  @IsInt()
  @IsOptional()
  actividadId?: number;

  @IsInt()
  @IsOptional()
  dailyMeetingId?: number;

  @IsInt()
  @IsNotEmpty()
  reportadoPorId: number;

  @IsInt()
  @IsOptional()
  responsableId?: number;

  @IsEnum(ImpedimentoPrioridad)
  @IsOptional()
  prioridad?: ImpedimentoPrioridad;

  @IsDateString()
  @IsOptional()
  fechaReporte?: string;

  @IsDateString()
  @IsOptional()
  fechaLimite?: string;
}
