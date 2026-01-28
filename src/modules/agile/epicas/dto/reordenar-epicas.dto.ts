import { Type } from 'class-transformer';
import { IsArray, IsInt, ValidateNested, Min } from 'class-validator';

export class EpicaOrdenItemDto {
  @IsInt()
  id: number;

  @IsInt()
  @Min(0)
  orden: number;
}

export class ReordenarEpicasDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EpicaOrdenItemDto)
  epicas: EpicaOrdenItemDto[];
}
