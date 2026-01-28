import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { HabilidadCategoria } from '../enums/habilidad-categoria.enum';

export class CreateHabilidadDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @IsEnum(HabilidadCategoria)
  @IsNotEmpty()
  categoria: HabilidadCategoria;

  @IsString()
  @IsOptional()
  descripcion?: string;
}
