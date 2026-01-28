import { PartialType } from '@nestjs/swagger';
import { CreateAeiDto } from './create-aei.dto';
import { IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAeiDto extends PartialType(CreateAeiDto) {
  @ApiPropertyOptional({
    description: 'Estado activo de la AEI',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
