import {
  IsString, IsInt, IsOptional, IsArray, MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOegdDto {
  @ApiProperty({ description: 'ID del OGD', example: 1 })
  @IsInt()
  ogdId: number;

  @ApiPropertyOptional({ description: 'Código único (se autogenera)', example: 'OEGD-001', maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  codigo?: string;

  @ApiProperty({ description: 'Nombre del OEGD', maxLength: 300 })
  @IsString()
  @MaxLength(300)
  nombre: string;

  @ApiPropertyOptional({ description: 'Descripción' })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional({ description: 'IDs de AEIs relacionadas', type: [Number] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  aeiIds?: number[];
}
