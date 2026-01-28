import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class ValidarTareaDto {
  @IsBoolean()
  validada: boolean;

  @IsOptional()
  @IsString()
  observacion?: string;
}
