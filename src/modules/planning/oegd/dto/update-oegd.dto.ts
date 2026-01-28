import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateOegdDto } from './create-oegd.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateOegdDto extends PartialType(OmitType(CreateOegdDto, ['ogdId'] as const)) {
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
