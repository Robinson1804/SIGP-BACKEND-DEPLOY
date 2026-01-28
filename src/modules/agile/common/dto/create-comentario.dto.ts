import {
  IsString,
  IsInt,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  Min,
} from 'class-validator';
import { EntidadTipoComentario } from '../entities/comentario.entity';

export class CreateComentarioDto {
  @IsEnum(EntidadTipoComentario, {
    message: 'entidadTipo debe ser uno de: HU, TAREA, SUBTAREA',
  })
  @IsNotEmpty({ message: 'entidadTipo es requerido' })
  entidadTipo: EntidadTipoComentario;

  @IsInt({ message: 'entidadId debe ser un numero entero' })
  @Min(1, { message: 'entidadId debe ser mayor a 0' })
  @IsNotEmpty({ message: 'entidadId es requerido' })
  entidadId: number;

  @IsString({ message: 'texto debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'texto es requerido' })
  @MaxLength(5000, { message: 'texto no puede exceder 5000 caracteres' })
  texto: string;

  @IsOptional()
  @IsInt({ message: 'respuestaA debe ser un numero entero' })
  @Min(1, { message: 'respuestaA debe ser mayor a 0' })
  respuestaA?: number;
}
