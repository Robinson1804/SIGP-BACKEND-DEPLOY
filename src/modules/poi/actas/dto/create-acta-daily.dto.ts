import {
  IsString,
  IsOptional,
  IsInt,
  IsArray,
  IsDateString,
  MaxLength,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ParticipanteDailyDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsInt()
  personalId?: number;

  @IsString()
  @MaxLength(200)
  nombre: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  cargo?: string;

  @IsString()
  ayer: string;

  @IsString()
  hoy: string;

  @IsString()
  impedimentos: string;
}

export class CreateActaDailyDto {
  @IsInt()
  proyectoId: number;

  @IsString()
  @MaxLength(200)
  nombre: string;

  @IsDateString()
  fecha: string;

  @IsOptional()
  @IsString()
  horaInicio?: string;

  @IsOptional()
  @IsString()
  horaFin?: string;

  @IsOptional()
  @IsInt()
  sprintId?: number;

  @IsOptional()
  @IsInt()
  moderadorId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  sprintNombre?: string;

  @IsOptional()
  @IsInt()
  duracionMinutos?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParticipanteDailyDto)
  @ArrayMinSize(1, { message: 'Debe haber al menos un participante' })
  participantesDaily: ParticipanteDailyDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  impedimentosGenerales?: string[];

  @IsOptional()
  @IsString()
  notasAdicionales?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
