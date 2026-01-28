import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ProyectoEstado } from '../enums/proyecto-estado.enum';

export class CambiarEstadoProyectoDto {
  @IsEnum(ProyectoEstado)
  estado: ProyectoEstado;

  @IsOptional()
  @IsString()
  motivo?: string;
}
