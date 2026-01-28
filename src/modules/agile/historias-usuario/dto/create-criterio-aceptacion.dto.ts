import { IsString, IsInt, IsOptional, IsNotEmpty, IsBoolean } from 'class-validator';

export class CreateCriterioAceptacionDto {
  @IsInt()
  @IsNotEmpty()
  historiaUsuarioId: number;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsOptional()
  @IsBoolean()
  completado?: boolean;

  @IsOptional()
  @IsInt()
  orden?: number;
}
