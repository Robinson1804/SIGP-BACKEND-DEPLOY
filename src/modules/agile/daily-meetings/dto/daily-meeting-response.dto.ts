import { DailyMeetingTipo } from '../enums/daily-meeting.enum';

export class ParticipanteResponseDto {
  id: number;
  usuarioId: number;
  usuario?: {
    id: number;
    nombre: string;
    email: string;
  };
  queHiceAyer: string;
  queHareHoy: string;
  impedimentos: string;
  asistio: boolean;
}

export class DailyMeetingResponseDto {
  id: number;
  tipo: DailyMeetingTipo;
  proyectoId: number;
  actividadId: number;
  sprintId: number;
  nombre: string;
  fecha: Date;
  horaInicio: string;
  horaFin: string;
  facilitadorId: number;
  facilitador?: {
    id: number;
    nombre: string;
    email: string;
  };
  notas: string;
  linkReunion: string;
  participantes: ParticipanteResponseDto[];
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class DailyMeetingResumenDto {
  totalParticipantes: number;
  asistieron: number;
  noAsistieron: number;
  conImpedimentos: number;
  impedimentos: string[];
}
