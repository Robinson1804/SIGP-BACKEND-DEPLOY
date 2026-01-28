/**
 * SIGP - Archivo DTOs
 */

import {
  IsEnum,
  IsInt,
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import {
  ArchivoEntidadTipo,
  ArchivoCategoria,
  ArchivoEstado,
} from '../entities/archivo.entity';

/**
 * DTO para filtrar archivos
 */
export class FilterArchivosDto {
  @ApiPropertyOptional({ enum: ArchivoEntidadTipo })
  @IsOptional()
  @IsEnum(ArchivoEntidadTipo)
  entidadTipo?: ArchivoEntidadTipo;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  entidadId?: number;

  @ApiPropertyOptional({ enum: ArchivoCategoria })
  @IsOptional()
  @IsEnum(ArchivoCategoria)
  categoria?: ArchivoCategoria;

  @ApiPropertyOptional({ enum: ArchivoEstado })
  @IsOptional()
  @IsEnum(ArchivoEstado)
  estado?: ArchivoEstado;

  @ApiPropertyOptional({ description: 'Solo versiones actuales', default: true })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  soloVersionActual?: boolean = true;

  @ApiPropertyOptional({ description: 'Incluir eliminados', default: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  incluirEliminados?: boolean = false;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 20;
}

/**
 * DTO de respuesta de archivo
 */
export class ArchivoResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: ArchivoEntidadTipo })
  entidadTipo: ArchivoEntidadTipo;

  @ApiProperty()
  entidadId: number;

  @ApiProperty()
  nombreOriginal: string;

  @ApiProperty()
  extension: string;

  @ApiProperty()
  mimeType: string;

  @ApiProperty()
  tamanoBytes: number;

  @ApiProperty()
  tamanoLegible: string;

  @ApiProperty({ enum: ArchivoCategoria })
  categoria: ArchivoCategoria;

  @ApiProperty({ enum: ArchivoEstado })
  estado: ArchivoEstado;

  @ApiProperty()
  version: number;

  @ApiProperty()
  esVersionActual: boolean;

  @ApiProperty()
  esPublico: boolean;

  @ApiPropertyOptional()
  downloadUrl?: string;

  @ApiProperty()
  metadata: Record<string, any>;

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional()
  creador?: {
    id: number;
    nombreCompleto: string;
  };
}

/**
 * DTO para actualizar metadata de archivo
 */
export class UpdateArchivoMetadataDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  esPublico?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  esObligatorio?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: Record<string, any>;
}

/**
 * DTO para crear nueva versión
 */
export class CreateVersionDto {
  @ApiProperty({ description: 'ID del archivo original' })
  @IsUUID()
  archivoOriginalId: string;

  @ApiPropertyOptional({ description: 'Comentario de la versión' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  comentario?: string;
}

/**
 * DTO de respuesta de lista paginada
 */
export class ArchivoListResponseDto {
  @ApiProperty({ type: [ArchivoResponseDto] })
  data: ArchivoResponseDto[];

  @ApiProperty()
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * DTO para estadísticas de almacenamiento
 */
export class StorageStatsDto {
  @ApiProperty()
  totalArchivos: number;

  @ApiProperty()
  totalBytes: number;

  @ApiProperty()
  totalLegible: string;

  @ApiProperty()
  porCategoria: {
    categoria: ArchivoCategoria;
    cantidad: number;
    bytes: number;
  }[];

  @ApiProperty()
  porEntidad: {
    entidadTipo: ArchivoEntidadTipo;
    cantidad: number;
    bytes: number;
  }[];
}
