import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateAccionEstrategicaDto } from './create-accion-estrategica.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateAccionEstrategicaDto extends PartialType(
  OmitType(CreateAccionEstrategicaDto, ['oegdId'] as const),
) {
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
