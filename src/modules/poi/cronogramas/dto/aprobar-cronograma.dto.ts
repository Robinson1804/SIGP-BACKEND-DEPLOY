import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class AprobarCronogramaDto {
  @IsBoolean()
  aprobado: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  comentario?: string;
}
