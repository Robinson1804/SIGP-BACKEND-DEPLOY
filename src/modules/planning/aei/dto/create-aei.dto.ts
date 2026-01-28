import {
  IsString,
  IsInt,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  MaxLength,
  Min,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MetaAnualDto {
  @ApiProperty({
    description: 'Año de la meta',
    example: 2025,
    minimum: 2000,
  })
  @IsInt()
  @Min(2000)
  anio: number;

  @ApiProperty({
    description: 'Valor de la meta para el año',
    example: 100,
  })
  @IsNumber()
  meta: number;

  @ApiPropertyOptional({
    description: 'Valor logrado hasta el momento',
    example: 45.5,
  })
  @IsOptional()
  @IsNumber()
  logrado?: number;
}

export class CreateAeiDto {
  @ApiProperty({
    description: 'ID del OEI al que pertenece esta AEI',
    example: 1,
  })
  @IsInt()
  oeiId: number;

  @ApiPropertyOptional({
    description: 'Código único de la AEI (se autogenera si no se proporciona)',
    example: 'AEI.01.01',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  codigo?: string;

  @ApiProperty({
    description: 'Nombre de la Acción Estratégica Institucional',
    example: 'Censos y encuestas de calidad',
    maxLength: 300,
  })
  @IsString()
  @MaxLength(300)
  nombre: string;

  @ApiPropertyOptional({
    description: 'Descripción detallada de la AEI',
    example: 'Realizar censos y encuestas que cumplan con estándares de calidad',
  })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional({
    description: 'Código del indicador (autogenerado si no se proporciona)',
    example: 'IND-AEI-001',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  indicadorCodigo?: string;

  @ApiProperty({
    description: 'Nombre del indicador de medición',
    example: 'Porcentaje de censos y encuestas ejecutados',
    maxLength: 500,
  })
  @IsNotEmpty({ message: 'El nombre del indicador es obligatorio' })
  @IsString()
  @MaxLength(500)
  indicadorNombre: string;

  @ApiProperty({
    description: 'Unidad de medida del indicador',
    example: 'Porcentaje',
    maxLength: 50,
  })
  @IsNotEmpty({ message: 'La unidad de medida es obligatoria' })
  @IsString()
  @MaxLength(50)
  unidadMedida: string;

  @ApiProperty({
    description: 'Año de la línea base',
    example: 2024,
  })
  @IsNotEmpty({ message: 'El año de la línea base es obligatorio' })
  @IsInt()
  lineaBaseAnio: number;

  @ApiProperty({
    description: 'Valor de la línea base',
    example: 85.5,
  })
  @IsNotEmpty({ message: 'El valor de la línea base es obligatorio' })
  @IsNumber()
  lineaBaseValor: number;

  @ApiPropertyOptional({
    description: 'Metas anuales de la AEI',
    type: [MetaAnualDto],
    example: [
      { anio: 2025, meta: 90 },
      { anio: 2026, meta: 95 },
      { anio: 2027, meta: 100 },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MetaAnualDto)
  metasAnuales?: MetaAnualDto[];
}
