import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateHistoriaUsuarioDto } from './create-historia-usuario.dto';

export class UpdateHistoriaUsuarioDto extends PartialType(
  OmitType(CreateHistoriaUsuarioDto, ['proyectoId', 'codigo'] as const),
) {}
