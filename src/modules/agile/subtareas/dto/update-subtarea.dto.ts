import {
  IsString,
  IsOptional,
  IsInt,
  IsNumber,
  IsEnum,
  MaxLength,
  IsDateString,
} from 'class-validator';
import { TareaEstado, TareaPrioridad } from '../../tareas/enums/tarea.enum';

export class UpdateSubtareaDto {
  @IsString()
  @IsOptional()
  @MaxLength(20)
  codigo?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  nombre?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsEnum(TareaEstado)
  @IsOptional()
  estado?: TareaEstado;

  @IsEnum(TareaPrioridad)
  @IsOptional()
  prioridad?: TareaPrioridad;

  @IsInt()
  @IsOptional()
  responsableId?: number;

  @IsNumber()
  @IsOptional()
  horasEstimadas?: number;

  @IsNumber()
  @IsOptional()
  horasReales?: number;

  @IsDateString()
  @IsOptional()
  fechaInicio?: string;

  @IsDateString()
  @IsOptional()
  fechaFin?: string;

  @IsString()
  @IsOptional()
  evidenciaUrl?: string;
}
