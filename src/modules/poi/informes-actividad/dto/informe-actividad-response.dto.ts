import { InformeActividadEstado, PeriodoInforme } from '../enums/informe-actividad.enum';

export class InformeActividadResponseDto {
  id: number;
  actividadId: number;
  codigo: string;
  periodo: PeriodoInforme;
  numeroPeriodo: number;
  anio: number;
  fechaInicio: Date;
  fechaFin: Date;
  totalTareasPendientes: number;
  totalTareasEnProgreso: number;
  totalTareasCompletadas: number;
  estado: InformeActividadEstado;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class InformeActividadDetailResponseDto extends InformeActividadResponseDto {
  tareasPendientes: {
    id: string;
    titulo: string;
    responsable?: string;
    fechaLimite?: string;
  }[] | null;
  tareasEnProgreso: {
    id: string;
    titulo: string;
    responsable?: string;
    porcentajeAvance?: number;
  }[] | null;
  tareasCompletadas: {
    id: string;
    titulo: string;
    responsable?: string;
    fechaCompletado?: string;
  }[] | null;
  logros: string[] | null;
  problemas: {
    descripcion: string;
    accion?: string;
    resuelto: boolean;
  }[] | null;
  proximasAcciones: string[] | null;
  observaciones: string | null;
  aprobadoPor: number | null;
  fechaAprobacion: Date | null;
  actividad?: {
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
