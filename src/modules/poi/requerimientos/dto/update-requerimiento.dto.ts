import { PartialType, OmitType } from '@nestjs/mapped-types';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { CreateRequerimientoDto } from './create-requerimiento.dto';

export class UpdateRequerimientoDto extends PartialType(
  OmitType(CreateRequerimientoDto, ['proyectoId'] as const),
) {
  /**
   * Código del requerimiento (REQ-001, REQ-002, etc.)
   * Normalmente autogenerado, pero puede ser actualizado por admin
   */
  @IsOptional()
  @IsString()
  @MaxLength(20)
  codigo?: string;
}
