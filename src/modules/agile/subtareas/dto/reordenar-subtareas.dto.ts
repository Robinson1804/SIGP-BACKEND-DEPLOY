import { IsArray, ArrayMinSize, IsNumber } from 'class-validator';

export class ReordenarSubtareasDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  orden: number[];
}
