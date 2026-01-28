import { IsEnum, IsOptional, IsString } from 'class-validator';
import { DocumentoEstado } from '../enums/documento.enum';

export class AprobarDocumentoDto {
  @IsEnum(DocumentoEstado)
  estado: DocumentoEstado;

  @IsOptional()
  @IsString()
  observacion?: string;
}
