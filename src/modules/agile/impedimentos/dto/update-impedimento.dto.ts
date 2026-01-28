import {
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { ImpedimentoPrioridad, ImpedimentoEstado } from '../enums/impedimento.enum';

export class UpdateImpedimentoDto {
  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsInt()
  @IsOptional()
  responsableId?: number;

  @IsEnum(ImpedimentoPrioridad)
  @IsOptional()
  prioridad?: ImpedimentoPrioridad;

  @IsEnum(ImpedimentoEstado)
  @IsOptional()
  estado?: ImpedimentoEstado;

  @IsDateString()
  @IsOptional()
  fechaLimite?: string;

  @IsString()
  @IsOptional()
  resolucion?: string;
}
