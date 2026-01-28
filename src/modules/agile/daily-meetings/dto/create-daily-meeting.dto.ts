import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
  MaxLength,
  IsDateString,
  IsArray,
  ValidateNested,
  ValidateIf,
  IsUrl,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DailyMeetingTipo } from '../enums/daily-meeting.enum';

export class CreateParticipanteDto {
  @IsInt()
  @IsNotEmpty()
  usuarioId: number;

  @IsBoolean()
  @IsOptional()
  asistio?: boolean;

  @IsString()
  @IsOptional()
  queHiceAyer?: string;

  @IsString()
  @IsOptional()
  queHareHoy?: string;

  @IsString()
  @IsOptional()
  impedimentos?: string;
}

export class CreateDailyMeetingDto {
  @IsEnum(DailyMeetingTipo)
  @IsNotEmpty()
  tipo: DailyMeetingTipo;

  @ValidateIf((o) => o.tipo === DailyMeetingTipo.PROYECTO)
  @IsInt()
  @IsNotEmpty()
  proyectoId?: number;

  @ValidateIf((o) => o.tipo === DailyMeetingTipo.ACTIVIDAD)
  @IsInt()
  @IsNotEmpty()
  actividadId?: number;

  @IsInt()
  @IsOptional()
  sprintId?: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nombre: string;

  @IsDateString()
  @IsNotEmpty()
  fecha: string;

  @IsString()
  @IsOptional()
  horaInicio?: string;

  @IsString()
  @IsOptional()
  horaFin?: string;

  @IsInt()
  @IsOptional()
  facilitadorId?: number;

  @IsString()
  @IsOptional()
  notas?: string;

  @IsUrl()
  @IsOptional()
  @MaxLength(500)
  linkReunion?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateParticipanteDto)
  @IsOptional()
  participantes?: CreateParticipanteDto[];
}
