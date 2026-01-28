import { IsArray, ValidateNested, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

class OrdenBacklogItemDto {
  @IsInt()
  huId: number;

  @IsInt()
  ordenBacklog: number;
}

export class ReordenarBacklogDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrdenBacklogItemDto)
  orden: OrdenBacklogItemDto[];
}
