import {
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
  IsArray,
  IsNumber,
  Matches,
  MaxLength,
  ArrayMinSize,
  ValidateNested,
  IsNotEmpty,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProyectoEstado, Clasificacion } from '../enums/proyecto-estado.enum';

// DTO para costos anuales
export class CostoAnualDto {
  @IsInt()
  anio: number;

  @IsNumber()
  monto: number;
}

export class CreateProyectoDto {
  // Codigo es autogenerado, no se envía desde el frontend
  @IsOptional()
  @IsString()
  @MaxLength(20)
  codigo?: string;

  @IsString()
  @MaxLength(200)
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsEnum(Clasificacion)
  clasificacion?: Clasificacion;

  @IsOptional()
  @IsInt()
  accionEstrategicaId?: number;

  @IsOptional()
  @IsInt()
  coordinadorId?: number;

  @IsOptional()
  @IsInt()
  scrumMasterId?: number;

  @IsOptional()
  @IsInt()
  patrocinadorId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  coordinacion?: string;

  // Área responsable del proyecto (ej: OTIN, OGD, etc.)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  areaResponsable?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  areasFinancieras?: string[];

  @IsOptional()
  @IsNumber()
  montoAnual?: number;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @ArrayMinSize(1)
  anios?: number[];

  // Costos estimados por año [{anio, monto}]
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CostoAnualDto)
  costosAnuales?: CostoAnualDto[];

  // Alcance del proyecto (lista de items)
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  alcances?: string[];

  // Problemática identificada
  @IsOptional()
  @IsString()
  problematica?: string;

  // Beneficiarios del proyecto
  @IsOptional()
  @IsString()
  beneficiarios?: string;

  // Beneficios del proyecto (lista de items)
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  beneficios?: string[];

  @IsOptional()
  @ValidateIf((o) => o.fechaInicio !== null)
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'fechaInicio debe tener formato YYYY-MM-DD',
  })
  fechaInicio?: string | null;

  @IsOptional()
  @ValidateIf((o) => o.fechaFin !== null)
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'fechaFin debe tener formato YYYY-MM-DD',
  })
  fechaFin?: string | null;
}
