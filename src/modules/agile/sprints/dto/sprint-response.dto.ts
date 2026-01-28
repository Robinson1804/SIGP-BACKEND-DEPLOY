import { SprintEstado } from '../enums/sprint.enum';

export class SprintResponseDto {
  id: number;
  proyectoId: number;
  nombre: string;
  sprintGoal: string | null;
  fechaInicio: Date;
  fechaFin: Date;
  capacidadEquipo: number | null;
  estado: SprintEstado;
  linkEvidencia: string | null;
  fechaInicioReal: Date | null;
  fechaFinReal: Date | null;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class SprintDetailResponseDto extends SprintResponseDto {
  proyecto?: {
    id: number;
    codigo: string;
    nombre: string;
  };
  metricas?: {
    totalHUs: number;
    husCompletadas: number;
    totalStoryPoints: number;
    storyPointsCompletados: number;
    porcentajeAvance: number;
  };
}

export class BurndownDataPointDto {
  fecha: string;
  spRestantes: number;
  spIdeal: number;
}

export class BurndownResponseDto {
  sprintId: number;
  totalStoryPoints: number;
  dias: BurndownDataPointDto[];
}

export class SprintMetricasResponseDto {
  sprintId: number;
  nombre: string;
  diasTotales: number;
  diasTranscurridos: number;
  diasRestantes: number;
  totalHUs: number;
  husCompletadas: number;
  husEnProgreso: number;
  husPendientes: number;
  totalStoryPoints: number;
  storyPointsCompletados: number;
  storyPointsEnProgreso: number;
  storyPointsPendientes: number;
  velocidad: number;
  porcentajeAvanceHUs: number;
  porcentajeAvanceSP: number;
}

export class VelocidadProyectoResponseDto {
  proyectoId: number;
  velocidadPromedio: number;
  velocidadUltimoSprint: number;
  sprintsAnalizados: number;
  historial: {
    sprintId: number;
    nombre: string;
    storyPointsCompletados: number;
    fechaFin: Date;
  }[];
}
