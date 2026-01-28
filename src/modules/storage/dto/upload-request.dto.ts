/**
 * SIGP - Upload Request DTOs
 */

import {
  IsEnum,
  IsInt,
  IsString,
  IsOptional,
  IsBoolean,
  MaxLength,
  Min,
  Max,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArchivoEntidadTipo, ArchivoCategoria } from '../entities/archivo.entity';

/**
 * DTO para solicitar URL de subida presignada
 */
export class RequestUploadUrlDto {
  @ApiProperty({
    enum: ArchivoEntidadTipo,
    description: 'Tipo de entidad a la que pertenece el archivo',
    example: ArchivoEntidadTipo.PROYECTO,
  })
  @IsEnum(ArchivoEntidadTipo)
  entidadTipo: ArchivoEntidadTipo;

  @ApiProperty({
    description: 'ID de la entidad',
    example: 1,
  })
  @IsInt()
  @Min(1)
  entidadId: number;

  @ApiProperty({
    enum: ArchivoCategoria,
    description: 'Categoría del archivo',
    example: ArchivoCategoria.DOCUMENTO,
  })
  @IsEnum(ArchivoCategoria)
  categoria: ArchivoCategoria;

  @ApiProperty({
    description: 'Nombre original del archivo',
    example: 'arquitectura_sistema.pdf',
  })
  @IsString()
  @MaxLength(255)
  nombreArchivo: string;

  @ApiProperty({
    description: 'Tipo MIME del archivo',
    example: 'application/pdf',
  })
  @IsString()
  @MaxLength(100)
  mimeType: string;

  @ApiProperty({
    description: 'Tamaño del archivo en bytes',
    example: 2048576,
  })
  @IsInt()
  @Min(1)
  @Max(52428800) // 50MB
  tamano: number;

  @ApiPropertyOptional({
    description: 'Metadata adicional del archivo',
    example: { fase: 'Diseño', version: '1.0' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Si el archivo es obligatorio',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  esObligatorio?: boolean;
}

/**
 * DTO para confirmar subida completada
 */
export class ConfirmUploadDto {
  @ApiProperty({
    description: 'ID del archivo (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsString()
  archivoId: string;

  @ApiPropertyOptional({
    description: 'Checksum MD5 calculado por el cliente',
  })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  checksumMd5?: string;
}

/**
 * Respuesta de solicitud de URL de subida
 */
export class UploadUrlResponseDto {
  @ApiProperty({ description: 'URL presignada para subir el archivo' })
  uploadUrl: string;

  @ApiProperty({ description: 'ID del archivo creado' })
  archivoId: string;

  @ApiProperty({ description: 'Object key en MinIO' })
  objectKey: string;

  @ApiProperty({ description: 'Bucket de destino' })
  bucket: string;

  @ApiProperty({ description: 'Segundos hasta que expire la URL' })
  expiresIn: number;

  @ApiProperty({ description: 'Headers requeridos para el PUT' })
  requiredHeaders: Record<string, string>;
}
