import { PartialType, OmitType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateTareaDto } from './create-tarea.dto';
import { TareaEstado } from '../enums/tarea.enum';

export class UpdateTareaDto extends PartialType(
  OmitType(CreateTareaDto, ['tipo', 'historiaUsuarioId', 'actividadId', 'codigo'] as const),
) {
  @IsOptional()
  @IsEnum(TareaEstado)
  estado?: TareaEstado;
}
