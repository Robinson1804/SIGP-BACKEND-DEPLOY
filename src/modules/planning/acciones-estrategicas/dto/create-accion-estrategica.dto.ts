import {
  IsString, IsInt, IsOptional, IsNumber, IsArray, IsDateString, ValidateNested, MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MetaAnualDto } from '../../oei/dto/create-oei.dto';

export class CreateAccionEstrategicaDto {
  @ApiProperty({ description: 'ID del OEGD', example: 1 })
  @IsInt()
  oegdId: number;

  @ApiPropertyOptional({ description: 'Código único (se autogenera)', example: 'AE N°1', maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  codigo?: string;

  @ApiProperty({ description: 'Nombre de la acción estratégica', maxLength: 300 })
  @IsString()
  @MaxLength(300)
  nombre: string;

  @ApiPropertyOptional({ description: 'Descripción' })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional({ description: 'Código del indicador', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  indicadorCodigo?: string;

  @ApiPropertyOptional({ description: 'Nombre del indicador', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  indicadorNombre?: string;

  @ApiPropertyOptional({ description: 'Unidad de medida', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  unidadMedida?: string;

  @ApiPropertyOptional({ description: 'Año línea base', example: 2024 })
  @IsOptional()
  @IsInt()
  lineaBaseAnio?: number;

  @ApiPropertyOptional({ description: 'Valor línea base', example: 0 })
  @IsOptional()
  @IsNumber()
  lineaBaseValor?: number;

  @ApiPropertyOptional({ description: 'Metas anuales', type: [MetaAnualDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MetaAnualDto)
  metasAnuales?: MetaAnualDto[];

  @ApiPropertyOptional({ description: 'Área responsable', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  responsableArea?: string;

  @ApiPropertyOptional({ description: 'Fecha de inicio', example: '2025-01-15' })
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @ApiPropertyOptional({ description: 'Fecha de fin', example: '2025-06-30' })
  @IsOptional()
  @IsDateString()
  fechaFin?: string;
}
