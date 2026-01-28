import { PartialType, OmitType } from '@nestjs/mapped-types';
import { IsOptional, IsDateString, IsNumber, IsEnum, Min, Max } from 'class-validator';
import { CreateTareaCronogramaDto } from './create-tarea-cronograma.dto';
import { TareaEstado } from '../enums/cronograma.enum';

export class UpdateTareaCronogramaDto extends PartialType(
  OmitType(CreateTareaCronogramaDto, ['cronogramaId', 'codigo'] as const),
) {
  @IsOptional()
  @IsEnum(TareaEstado)
  estado?: TareaEstado;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  porcentajeAvance?: number;

  @IsOptional()
  @IsDateString()
  fechaInicioReal?: string;

  @IsOptional()
  @IsDateString()
  fechaFinReal?: string;
}
