import { EpicaPrioridad } from '../enums/epica.enum';

export class EpicaResponseDto {
  id: number;
  proyectoId: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  color: string;
  prioridad: EpicaPrioridad;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class EpicaDetailResponseDto extends EpicaResponseDto {
  proyecto?: {
    id: number;
    codigo: string;
    nombre: string;
  };
}

export class EpicaEstadisticasResponseDto {
  epicaId: number;
  totalHUs: number;
  husCompletadas: number;
  husEnProgreso: number;
  husPendientes: number;
  totalStoryPoints: number;
  storyPointsCompletados: number;
  porcentajeAvance: number;
}
