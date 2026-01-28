import { IsInt, IsOptional, IsEnum } from 'class-validator';
import { TipoDependencia } from '../enums/cronograma.enum';

export class CreateDependenciaDto {
  @IsInt()
  tareaOrigenId: number;

  @IsInt()
  tareaDestinoId: number;

  @IsOptional()
  @IsEnum(TipoDependencia)
  tipo?: TipoDependencia;

  @IsOptional()
  @IsInt()
  lag?: number;
}
