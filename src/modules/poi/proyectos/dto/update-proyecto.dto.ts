import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateProyectoDto } from './create-proyecto.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateProyectoDto extends PartialType(OmitType(CreateProyectoDto, ['codigo'] as const)) {
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
