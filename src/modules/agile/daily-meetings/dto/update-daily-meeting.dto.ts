import {
  IsString,
  IsOptional,
  IsInt,
  MaxLength,
  IsDateString,
  IsUrl,
} from 'class-validator';

export class UpdateDailyMeetingDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  nombre?: string;

  @IsDateString()
  @IsOptional()
  fecha?: string;

  @IsString()
  @IsOptional()
  horaInicio?: string;

  @IsString()
  @IsOptional()
  horaFin?: string;

  @IsInt()
  @IsOptional()
  facilitadorId?: number;

  @IsInt()
  @IsOptional()
  sprintId?: number;

  @IsString()
  @IsOptional()
  notas?: string;

  @IsUrl()
  @IsOptional()
  @MaxLength(500)
  linkReunion?: string;
}
