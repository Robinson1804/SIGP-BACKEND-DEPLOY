import { IsString, IsOptional, MaxLength, IsNumber } from 'class-validator';

export class CreateEvidenciaTareaDto {
  @IsString()
  @MaxLength(100)
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsString()
  @MaxLength(500)
  url: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  tipo?: string;

  @IsOptional()
  @IsNumber()
  tamanoBytes?: number;
}
