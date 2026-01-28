import {
  IsString,
  IsOptional,
  IsInt,
  IsNumber,
  IsDateString,
  MaxLength,
  IsArray,
} from 'class-validator';

export class CreateSubproyectoDto {
  @IsInt()
  proyectoPadreId: number;

  @IsString()
  @MaxLength(20)
  codigo: string;

  @IsString()
  @MaxLength(200)
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsNumber()
  monto?: number;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  anios?: number[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  areasFinancieras?: string[];

  // responsables se manejan via tabla rrhh.asignaciones (tipoAsignacion='Subproyecto')

  @IsOptional()
  @IsInt()
  scrumMasterId?: number;

  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;
}
