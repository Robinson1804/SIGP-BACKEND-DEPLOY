import { IsArray, ValidateNested, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

class CriterioOrdenDto {
  @IsInt()
  criterioId: number;

  @IsInt()
  nuevoOrden: number;
}

export class ReordenarCriteriosDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CriterioOrdenDto)
  criterios: CriterioOrdenDto[];
}
