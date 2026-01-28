import { IsString, IsInt, IsOptional, IsEnum, Min, Max, MaxLength, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PgdEstado } from '../entities/pgd.entity';

export class CreatePgdDto {
  @ApiPropertyOptional({
    description: 'Nombre del PGD (se auto-genera si no se proporciona: "PGD XXXX - XXXX")',
    example: 'PGD 2025 - 2028',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  nombre?: string;

  @ApiPropertyOptional({
    description: 'Descripcion detallada del PGD',
    example: 'Plan estrategico que define los objetivos institucionales para el periodo 2025-2028',
  })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({
    description: 'Año de inicio del plan',
    example: 2025,
    minimum: 2000,
    maximum: 2100,
  })
  @IsInt()
  @Min(2000)
  @Max(2100)
  anioInicio: number;

  @ApiProperty({
    description: 'Año de fin del plan',
    example: 2028,
    minimum: 2000,
    maximum: 2100,
  })
  @IsInt()
  @Min(2000)
  @Max(2100)
  anioFin: number;

  @ApiPropertyOptional({
    description: 'Estado del PGD',
    enum: PgdEstado,
    example: PgdEstado.BORRADOR,
    default: PgdEstado.BORRADOR,
  })
  @IsOptional()
  @IsEnum(PgdEstado)
  estado?: PgdEstado;
}
