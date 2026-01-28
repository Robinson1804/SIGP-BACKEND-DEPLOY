import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateEpicaDto } from './create-epica.dto';

export class UpdateEpicaDto extends PartialType(
  OmitType(CreateEpicaDto, ['proyectoId', 'codigo'] as const),
) {}
