import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { HabilidadCategoria } from '../enums/habilidad-categoria.enum';

export class UpdateHabilidadDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  nombre?: string;

  @IsEnum(HabilidadCategoria)
  @IsOptional()
  categoria?: HabilidadCategoria;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
