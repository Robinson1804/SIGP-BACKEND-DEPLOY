import { TareaEstado, TareaPrioridad } from '../../tareas/enums/tarea.enum';

export class SubtareaTableroDto {
  id: number;
  codigo: string;
  nombre: string;
  estado: TareaEstado;
  prioridad: TareaPrioridad;
  responsableId: number;
  responsable?: {
    id: number;
    nombre: string;
    avatar?: string;
  };
  horasEstimadas: number;
  horasReales: number;
}

export class TareaKanbanTableroDto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  estado: TareaEstado;
  prioridad: TareaPrioridad;
  asignadoA: number;
  asignado?: {
    id: number;
    nombre: string;
    avatar?: string;
  };
  horasEstimadas: number;
  horasReales: number;
  // evidenciaUrl eliminado - usar endpoint GET /tareas/:id/evidencias
  subtareas: SubtareaTableroDto[];
  subtareasCompletadas: number;
  subtareasTotal: number;
  progreso: number;
}

export class ColumnaTableroKanbanDto {
  estado: TareaEstado;
  nombre: string;
  tareas: TareaKanbanTableroDto[];
  totalTareas: number;
  limiteWIP?: number;
}

export class TableroKanbanResponseDto {
  actividad: {
    id: number;
    codigo: string;
    nombre: string;
    descripcion: string;
    fechaInicio: Date | null;
    fechaFin: Date | null;
  };
  columnas: ColumnaTableroKanbanDto[];
  estadisticas: {
    totalTareas: number;
    tareasCompletadas: number;
    tareasEnProgreso: number;
    tareasPendientes: number;
    horasEstimadas: number;
    horasReales: number;
    progreso: number;
    throughput: number;
    leadTime: number;
  };
}
