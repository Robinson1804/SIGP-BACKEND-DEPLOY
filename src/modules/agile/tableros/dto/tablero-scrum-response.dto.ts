import { SprintEstado } from '../../sprints/enums/sprint.enum';
import { HuEstado, HuPrioridad, HuEstimacion } from '../../historias-usuario/enums/historia-usuario.enum';
import { TareaEstado, TareaPrioridad } from '../../tareas/enums/tarea.enum';

export class TareaTableroDto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  estado: TareaEstado;
  prioridad: TareaPrioridad;
  asignadoA: number | null;
  asignado?: {
    id: number;
    nombre: string;
    avatar?: string;
  };
  horasEstimadas: number;
  horasReales: number;
  // evidenciaUrl eliminado - usar endpoint GET /tareas/:id/evidencias
  validada: boolean;
}

export class HistoriaUsuarioTableroDto {
  id: number;
  codigo: string;
  titulo: string;
  rol: string | null;
  quiero: string | null;
  para: string | null;
  prioridad: HuPrioridad | null;
  estimacion: HuEstimacion | null;
  storyPoints: number | null;
  estado: HuEstado;
  // asignadoA ahora es un array de IDs de responsables
  asignadoA: number[];
  tareas: TareaTableroDto[];
  tareasCompletadas: number;
  tareasTotal: number;
  progreso: number;
}

export class ColumnaTableroScrumDto {
  estado: HuEstado;
  nombre: string;
  historias: HistoriaUsuarioTableroDto[];
  totalHistorias: number;
  totalStoryPoints: number;
}

export class TableroScrumResponseDto {
  sprint: {
    id: number;
    nombre: string;
    sprintGoal: string;
    estado: SprintEstado;
    fechaInicio: string | null;
    fechaFin: string | null;
    capacidadEquipo: number;
  };
  columnas: ColumnaTableroScrumDto[];
  estadisticas: {
    totalHistorias: number;
    historiasCompletadas: number;
    totalStoryPoints: number;
    storyPointsCompletados: number;
    progreso: number;
    velocidad: number;
  };
}
