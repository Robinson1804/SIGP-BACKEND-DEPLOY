import { IsEnum, IsOptional, IsNumber, Min } from 'class-validator';
import { TareaEstado } from '../enums/tarea.enum';

export class CambiarEstadoTareaDto {
  @IsEnum(TareaEstado)
  estado: TareaEstado;

  @IsOptional()
  @IsNumber()
  @Min(0)
  horasReales?: number;

  // evidenciaUrl eliminado - usar endpoint POST /tareas/:id/evidencias
}
