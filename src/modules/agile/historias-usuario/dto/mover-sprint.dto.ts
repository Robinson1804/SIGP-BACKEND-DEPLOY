import { IsInt, IsOptional } from 'class-validator';

export class MoverSprintDto {
  @IsOptional()
  @IsInt()
  sprintId?: number; // null para mover al backlog
}
