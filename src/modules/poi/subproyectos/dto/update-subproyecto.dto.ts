import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateSubproyectoDto } from './create-subproyecto.dto';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { ProyectoEstado } from '../../proyectos/enums/proyecto-estado.enum';

export class UpdateSubproyectoDto extends PartialType(
  OmitType(CreateSubproyectoDto, ['proyectoPadreId', 'codigo'] as const),
) {
  @IsOptional()
  @IsEnum(ProyectoEstado)
  estado?: ProyectoEstado;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
