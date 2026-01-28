import { PartialType } from '@nestjs/mapped-types';
import { CreatePgdDto } from './create-pgd.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdatePgdDto extends PartialType(CreatePgdDto) {
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
