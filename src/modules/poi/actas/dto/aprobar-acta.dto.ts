import { IsEnum, IsOptional, IsString, IsBoolean } from 'class-validator';
import { ActaEstado } from '../enums/acta.enum';

export class AprobarActaDto {
  @IsBoolean()
  aprobado: boolean;

  @IsOptional()
  @IsString()
  comentario?: string;
}

export class SubirDocumentoFirmadoDto {
  @IsString()
  documentoFirmadoUrl: string;
}
