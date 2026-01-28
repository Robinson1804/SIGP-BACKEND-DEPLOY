import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateOgdDto } from './create-ogd.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateOgdDto extends PartialType(OmitType(CreateOgdDto, ['pgdId'] as const)) {
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
