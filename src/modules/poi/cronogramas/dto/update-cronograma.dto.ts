import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateCronogramaDto } from './create-cronograma.dto';

export class UpdateCronogramaDto extends PartialType(
  OmitType(CreateCronogramaDto, ['proyectoId'] as const),
) {}
