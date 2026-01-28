import {
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
  IsBoolean,
  IsUrl,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { DocumentoFase, TipoContenedor } from '../enums/documento.enum';

export class CreateDocumentoDto {
  @IsEnum(TipoContenedor)
  tipoContenedor: TipoContenedor;

  @ValidateIf((o) => o.tipoContenedor === TipoContenedor.PROYECTO)
  @IsInt()
  proyectoId?: number;

  @ValidateIf((o) => o.tipoContenedor === TipoContenedor.SUBPROYECTO)
  @IsInt()
  subproyectoId?: number;

  @IsEnum(DocumentoFase)
  fase: DocumentoFase;

  @IsString()
  @MaxLength(200)
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  link?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  archivoUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  archivoNombre?: string;

  @IsOptional()
  @IsInt()
  archivoTamano?: number;

  @IsOptional()
  @IsString()
  archivoId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  tipoArchivo?: string;

  @IsOptional()
  @IsBoolean()
  esObligatorio?: boolean;
}
