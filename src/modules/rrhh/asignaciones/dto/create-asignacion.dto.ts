import {
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsEnum,
  IsNumber,
  IsString,
  IsDateString,
  MaxLength,
  Min,
  Max,
  ValidateIf,
} from 'class-validator';
import { TipoAsignacion } from '../enums/tipo-asignacion.enum';

export class CreateAsignacionDto {
  @IsInt()
  @IsNotEmpty()
  personalId: number;

  @IsEnum(TipoAsignacion)
  @IsNotEmpty()
  tipoAsignacion: TipoAsignacion;

  @ValidateIf((o) => o.tipoAsignacion === TipoAsignacion.PROYECTO)
  @IsInt()
  @IsNotEmpty()
  proyectoId?: number;

  @ValidateIf((o) => o.tipoAsignacion === TipoAsignacion.ACTIVIDAD)
  @IsInt()
  @IsNotEmpty()
  actividadId?: number;

  @ValidateIf((o) => o.tipoAsignacion === TipoAsignacion.SUBPROYECTO)
  @IsInt()
  @IsNotEmpty()
  subproyectoId?: number;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  rolEquipo?: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(100)
  porcentajeDedicacion: number;

  @IsDateString()
  @IsNotEmpty()
  fechaInicio: string;

  @IsDateString()
  @IsOptional()
  fechaFin?: string;
}
