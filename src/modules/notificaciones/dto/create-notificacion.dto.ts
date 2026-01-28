import {
  IsEnum,
  IsString,
  IsInt,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { TipoNotificacion } from '../enums/tipo-notificacion.enum';

export class CreateNotificacionDto {
  @IsEnum(TipoNotificacion)
  tipo: TipoNotificacion;

  @IsString()
  @MaxLength(200)
  titulo: string;

  @IsString()
  descripcion: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  entidadTipo?: string;

  @IsOptional()
  @IsInt()
  entidadId?: number;

  @IsOptional()
  @IsInt()
  proyectoId?: number;

  @IsInt()
  destinatarioId: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  urlAccion?: string;
}
