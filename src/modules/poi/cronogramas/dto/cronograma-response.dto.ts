import { CronogramaEstado, TareaEstado, TareaPrioridad, AsignadoA } from '../enums/cronograma.enum';

export class CronogramaResponseDto {
  id: number;
  proyectoId: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  version: number | null;
  fechaInicio: Date;
  fechaFin: Date;
  estado: CronogramaEstado;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class CronogramaDetailResponseDto extends CronogramaResponseDto {
  proyecto?: {
    id: number;
    codigo: string;
    nombre: string;
  };
  tareas?: TareaCronogramaResponseDto[];
}

export class TareaCronogramaResponseDto {
  id: number;
  cronogramaId: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  fechaInicio: Date;
  fechaFin: Date;
  fechaInicioReal: Date | null;
  fechaFinReal: Date | null;
  estado: TareaEstado;
  prioridad: TareaPrioridad;
  porcentajeAvance: number;
  asignadoA: AsignadoA | null;
  tareaPadreId: number | null;
  orden: number | null;
  dependencias: number[] | null;
  notas: string | null;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class TareaCronogramaDetailResponseDto extends TareaCronogramaResponseDto {
  tareaPadre?: {
    id: number;
    codigo: string;
    nombre: string;
  };
}
