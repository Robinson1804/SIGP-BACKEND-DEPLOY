import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateInformeActividadDto } from './create-informe-actividad.dto';

export class UpdateInformeActividadDto extends PartialType(
  OmitType(CreateInformeActividadDto, ['actividadId', 'codigo', 'periodo', 'numeroPeriodo', 'anio'] as const),
) {}
