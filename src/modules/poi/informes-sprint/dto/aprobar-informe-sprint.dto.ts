import { IsEnum, IsOptional, IsString } from 'class-validator';
import { InformeSprintEstado } from '../enums/informe-sprint.enum';

export class AprobarInformeSprintDto {
  @IsEnum(InformeSprintEstado)
  estado: InformeSprintEstado;

  @IsOptional()
  @IsString()
  observacion?: string;
}
