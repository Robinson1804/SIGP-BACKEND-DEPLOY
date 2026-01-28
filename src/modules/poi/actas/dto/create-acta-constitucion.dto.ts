import {
  IsString,
  IsOptional,
  IsInt,
  IsArray,
  IsDateString,
  IsNumber,
  MaxLength,
} from 'class-validator';

export class CreateActaConstitucionDto {
  @IsInt()
  proyectoId: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  codigo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  nombre?: string;

  @IsOptional()
  @IsDateString()
  fecha?: string;

  @IsOptional()
  @IsString()
  objetivoSmart?: string;

  // Nuevos campos
  @IsOptional()
  @IsString()
  justificacion?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  alcance?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fueraDeAlcance?: string[];

  @IsOptional()
  @IsArray()
  entregables?: {
    nombre: string;
    descripcion?: string;
    fechaEstimada?: string;
  }[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  supuestos?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  restricciones?: string[];

  @IsOptional()
  @IsArray()
  riesgos?: {
    descripcion: string;
    probabilidad?: 'Alta' | 'Media' | 'Baja';
    impacto?: 'Alto' | 'Medio' | 'Bajo';
    mitigacion?: string;
  }[];

  @IsOptional()
  @IsNumber()
  presupuestoEstimado?: number;

  @IsOptional()
  @IsArray()
  cronogramaHitos?: {
    nombre: string;
    fechaEstimada: string;
    descripcion?: string;
  }[];

  @IsOptional()
  @IsArray()
  equipoProyecto?: {
    rol: string;
    nombre: string;
    responsabilidad?: string;
    usuarioId?: number;
  }[];

  @IsOptional()
  @IsString()
  @MaxLength(500)
  archivoUrl?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
