import { IsInt, IsOptional } from 'class-validator';

export class AsignarHuDto {
  @IsOptional()
  @IsInt()
  asignadoA?: number; // null para desasignar
}
