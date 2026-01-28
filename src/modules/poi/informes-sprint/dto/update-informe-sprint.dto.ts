import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateInformeSprintDto } from './create-informe-sprint.dto';

export class UpdateInformeSprintDto extends PartialType(
  OmitType(CreateInformeSprintDto, ['proyectoId', 'codigo', 'numeroSprint'] as const),
) {}
