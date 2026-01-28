import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateActividadDto } from './create-actividad.dto';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { ActividadEstado } from '../enums/actividad-estado.enum';

export class UpdateActividadDto extends PartialType(OmitType(CreateActividadDto, ['codigo'] as const)) {
  @IsOptional()
  @IsEnum(ActividadEstado)
  estado?: ActividadEstado;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
