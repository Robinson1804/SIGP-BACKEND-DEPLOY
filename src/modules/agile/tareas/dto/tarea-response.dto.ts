import { TareaTipo, TareaEstado, TareaPrioridad } from '../enums/tarea.enum';

export class TareaResponseDto {
  id: number;
  tipo: TareaTipo;
  historiaUsuarioId: number | null;
  actividadId: number | null;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  estado: TareaEstado;
  prioridad: TareaPrioridad;
  asignadoA: number | null;
  horasEstimadas: number | null;
  horasReales: number | null;
  // evidenciaUrl eliminado - usar endpoint GET /tareas/:id/evidencias
  validada: boolean;
  validadaPor: number | null;
  fechaValidacion: Date | null;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  observaciones: string | null;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class TareaDetailResponseDto extends TareaResponseDto {
  historiaUsuario?: {
    id: number;
    codigo: string;
    titulo: string;
  };
  actividad?: {
    id: number;
    codigo: string;
    nombre: string;
  };
  asignado?: {
    id: number;
    nombres: string;
    apellidoPaterno: string;
  };
  validador?: {
    id: number;
    nombres: string;
    apellidoPaterno: string;
  };
}
