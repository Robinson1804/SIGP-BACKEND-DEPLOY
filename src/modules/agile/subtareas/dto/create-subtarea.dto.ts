import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  IsNumber,
  IsEnum,
  MaxLength,
  IsDateString,
  IsUrl,
} from 'class-validator';
import { TareaEstado, TareaPrioridad } from '../../tareas/enums/tarea.enum';

export class CreateSubtareaDto {
  @IsInt()
  @IsNotEmpty()
  tareaId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  codigo: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nombre: string;

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

  @IsDateString()
  @IsOptional()
  fechaInicio?: string;

  @IsDateString()
  @IsOptional()
  fechaFin?: string;
}
