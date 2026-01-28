import { IsOptional, IsString, MaxLength, IsIn } from 'class-validator';

export class CerrarSprintDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  linkEvidencia?: string;

  @IsOptional()
  @IsIn(['mover_siguiente', 'devolver_backlog'])
  accionHUsPendientes?: 'mover_siguiente' | 'devolver_backlog';
}
