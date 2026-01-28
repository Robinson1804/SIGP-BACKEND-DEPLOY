import {
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
  IsDateString,
  IsNumber,
  IsArray,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { TareaTipo, TareaPrioridad } from '../enums/tarea.enum';

export class CreateTareaDto {
  @IsEnum(TareaTipo)
  tipo: TareaTipo;

  @ValidateIf((o) => o.tipo === TareaTipo.SCRUM)
  @IsInt()
  historiaUsuarioId?: number;

  @ValidateIf((o) => o.tipo === TareaTipo.KANBAN)
  @IsInt()
  actividadId?: number;

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
  @IsEnum(TareaPrioridad)
  prioridad?: TareaPrioridad;

  @IsOptional()
  @ValidateIf((o, value) => value !== null)
  @IsInt()
  asignadoA?: number | null;

  /**
   * Array de IDs de usuarios a asignar a la tarea.
   * Estos se guardan en la tabla tarea_asignados.
   * Máximo 5 responsables.
   */
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  asignadosIds?: number[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  horasEstimadas?: number;

  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;
}
