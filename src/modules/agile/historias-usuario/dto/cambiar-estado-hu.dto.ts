import { IsEnum } from 'class-validator';
import { HuEstado } from '../enums/historia-usuario.enum';

export class CambiarEstadoHuDto {
  @IsEnum(HuEstado)
  estado: HuEstado;
}
