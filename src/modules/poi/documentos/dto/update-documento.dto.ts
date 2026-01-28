import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateDocumentoDto } from './create-documento.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateDocumentoDto extends PartialType(
  OmitType(CreateDocumentoDto, ['tipoContenedor', 'proyectoId', 'subproyectoId'] as const),
) {
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
