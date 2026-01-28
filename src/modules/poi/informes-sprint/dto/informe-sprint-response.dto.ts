import { InformeSprintEstado } from '../enums/informe-sprint.enum';

export class InformeSprintResponseDto {
  id: number;
  proyectoId: number;
  codigo: string;
  numeroSprint: number;
  fechaInicio: Date;
  fechaFin: Date;
  objetivoSprint: string | null;
  puntosPlanificados: number | null;
  puntosCompletados: number | null;
  velocidadSprint: number | null;
  estado: InformeSprintEstado;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class InformeSprintDetailResponseDto extends InformeSprintResponseDto {
  historiasPlanificadas: {
    id: string;
    titulo: string;
    puntos: number;
    estado: string;
  }[] | null;
  historiasCompletadas: {
    id: string;
    titulo: string;
    puntos: number;
  }[] | null;
  impedimentos: {
    descripcion: string;
    resolucion?: string;
    resuelto: boolean;
  }[] | null;
  retrospectiva: {
    queFueBien: string[];
    queMejorar: string[];
    accionesProximoSprint: string[];
  } | null;
  burndownData: {
    dia: number;
    puntosRestantes: number;
  }[] | null;
  observaciones: string | null;
  aprobadoPor: number | null;
  fechaAprobacion: Date | null;
  proyecto?: {
    id: number;
    codigo: string;
    nombre: string;
  };
  aprobador?: {
    id: number;
    nombres: string;
    apellidoPaterno: string;
  };
}
