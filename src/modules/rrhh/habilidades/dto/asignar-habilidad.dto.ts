import {
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { NivelHabilidad } from '../enums/nivel-habilidad.enum';

export class AsignarHabilidadDto {
  @IsInt()
  @IsNotEmpty()
  habilidadId: number;

  @IsEnum(NivelHabilidad)
  @IsNotEmpty()
  nivel: NivelHabilidad;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(50)
  aniosExperiencia?: number;

  @IsBoolean()
  @IsOptional()
  certificado?: boolean;
}

export class UpdatePersonalHabilidadDto {
  @IsEnum(NivelHabilidad)
  @IsOptional()
  nivel?: NivelHabilidad;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(50)
  aniosExperiencia?: number;

  @IsBoolean()
  @IsOptional()
  certificado?: boolean;
}
