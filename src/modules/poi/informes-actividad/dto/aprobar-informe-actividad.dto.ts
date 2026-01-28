import { IsEnum, IsOptional, IsString } from 'class-validator';
import { InformeActividadEstado } from '../enums/informe-actividad.enum';

export class AprobarInformeActividadDto {
  @IsEnum(InformeActividadEstado)
  estado: InformeActividadEstado;

  @IsOptional()
  @IsString()
  observacion?: string;
}
