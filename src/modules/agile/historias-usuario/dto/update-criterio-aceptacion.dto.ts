import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateCriterioAceptacionDto } from './create-criterio-aceptacion.dto';

export class UpdateCriterioAceptacionDto extends PartialType(
  OmitType(CreateCriterioAceptacionDto, ['historiaUsuarioId'] as const),
) {}
