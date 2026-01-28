import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateOeiDto } from './create-oei.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateOeiDto extends PartialType(OmitType(CreateOeiDto, ['pgdId'] as const)) {
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
