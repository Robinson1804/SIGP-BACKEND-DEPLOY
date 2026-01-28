import {
  HuPrioridad,
  HuEstimacion,
  HuEstado,
  TipoDependencia,
} from '../enums/historia-usuario.enum';

export class CriterioAceptacionResponseDto {
  id: number;
  descripcion: string;
  completado: boolean;
  orden: number | null;
}

export class HuDependenciaResponseDto {
  id: number;
  dependeDeId: number;
  tipoDependencia: TipoDependencia;
  notas: string | null;
  dependeDe?: {
    id: number;
    codigo: string;
    titulo: string;
    estado: HuEstado;
  };
}

export class HistoriaUsuarioResponseDto {
  id: number;
  proyectoId: number;
  epicaId: number | null;
  sprintId: number | null;
  codigo: string;
  titulo: string;
  rol: string | null;
  quiero: string | null;
  para: string | null;
  prioridad: HuPrioridad;
  estimacion: HuEstimacion | null;
  storyPoints: number | null;
  estado: HuEstado;
  asignadoA: number | null;
  ordenBacklog: number | null;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class HistoriaUsuarioDetailResponseDto extends HistoriaUsuarioResponseDto {
  proyecto?: {
    id: number;
    codigo: string;
    nombre: string;
  };
  epica?: {
    id: number;
    codigo: string;
    nombre: string;
    color: string;
  };
  sprint?: {
    id: number;
    nombre: string;
    estado: string;
  };
  asignado?: {
    id: number;
    nombres: string;
    apellidoPaterno: string;
  };
  creador?: {
    id: number;
    nombres: string;
    apellidoPaterno: string;
  };
  criteriosAceptacion?: CriterioAceptacionResponseDto[];
  dependencias?: HuDependenciaResponseDto[];
}

export class BacklogResponseDto {
  proyecto: {
    id: number;
    nombre: string;
  };
  epicas: {
    id: number;
    codigo: string;
    nombre: string;
    color: string;
  }[];
  sprints: {
    id: number;
    nombre: string;
    estado: string;
    fechaInicio: Date;
    fechaFin: Date;
    storyPoints: number;
    historias: HistoriaUsuarioResponseDto[];
  }[];
  backlog: HistoriaUsuarioResponseDto[];
  metricas: {
    totalHUs: number;
    husEnBacklog: number;
    husEnSprints: number;
    totalStoryPoints: number;
  };
}
