import { IsInt, IsEnum, IsOptional, IsString } from 'class-validator';
import { TipoDependencia } from '../enums/historia-usuario.enum';

export class AgregarDependenciaDto {
  @IsInt()
  dependeDeId: number;

  @IsEnum(TipoDependencia)
  tipoDependencia: TipoDependencia;

  @IsOptional()
  @IsString()
  notas?: string;
}
