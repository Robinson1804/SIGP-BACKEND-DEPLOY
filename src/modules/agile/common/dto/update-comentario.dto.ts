import { IsString, IsOptional, MaxLength, IsNotEmpty } from 'class-validator';

export class UpdateComentarioDto {
  @IsOptional()
  @IsString({ message: 'texto debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'texto no puede estar vacio' })
  @MaxLength(5000, { message: 'texto no puede exceder 5000 caracteres' })
  texto?: string;
}
