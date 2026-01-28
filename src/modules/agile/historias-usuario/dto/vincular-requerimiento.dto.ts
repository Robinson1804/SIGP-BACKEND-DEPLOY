import { IsInt, IsOptional, IsString } from 'class-validator';

export class VincularRequerimientoDto {
  @IsInt()
  requerimientoId: number;

  @IsOptional()
  @IsString()
  notas?: string;
}
