import {
  IsString, IsInt, IsOptional, IsNumber, IsArray, ValidateNested, MaxLength, IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MetaAnualDto } from '../../oei/dto/create-oei.dto';

export class CreateOgdDto {
  @ApiProperty({ description: 'ID del PGD', example: 1 })
  @IsInt()
  pgdId: number;

  @ApiPropertyOptional({ description: 'Código único (se autogenera)', example: 'OGD N°1', maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  codigo?: string;

  @ApiProperty({ description: 'Nombre del OGD', maxLength: 300 })
  @IsString()
  @MaxLength(300)
  nombre: string;

  @ApiPropertyOptional({ description: 'Descripción' })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional({ description: 'Código del indicador (autogenerado si no se proporciona)', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  indicadorCodigo?: string;

  @ApiProperty({ description: 'Nombre del indicador', maxLength: 500 })
  @IsNotEmpty({ message: 'El nombre del indicador es obligatorio' })
  @IsString()
  @MaxLength(500)
  indicadorNombre: string;

  @ApiProperty({ description: 'Unidad de medida', maxLength: 50 })
  @IsNotEmpty({ message: 'La unidad de medida es obligatoria' })
  @IsString()
  @MaxLength(50)
  unidadMedida: string;

  @ApiProperty({ description: 'Año línea base', example: 2024 })
  @IsNotEmpty({ message: 'El año de la línea base es obligatorio' })
  @IsInt()
  lineaBaseAnio: number;

  @ApiProperty({ description: 'Valor línea base', example: 60 })
  @IsNotEmpty({ message: 'El valor de la línea base es obligatorio' })
  @IsNumber()
  lineaBaseValor: number;

  @ApiPropertyOptional({ description: 'Metas anuales', type: [MetaAnualDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MetaAnualDto)
  metasAnuales?: MetaAnualDto[];

  @ApiPropertyOptional({ description: 'IDs de OEIs relacionados', type: [Number] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  oeiIds?: number[];
}
