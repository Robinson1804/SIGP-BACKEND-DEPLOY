import { IsNotEmpty, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AsignarPersonalDto {
  @ApiProperty({
    description: 'ID del personal a asignar',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  personalId: number;
}
