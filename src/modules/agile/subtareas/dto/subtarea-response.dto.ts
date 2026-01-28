import { TareaEstado, TareaPrioridad } from '../../tareas/enums/tarea.enum';

export class EvidenciaSubtareaResponseDto {
  id: number;
  subtareaId: number;
  nombre: string;
  descripcion: string | null;
  url: string;
  tipo: string | null;
  tamanoBytes: number | null;
  subidoPor: number;
  createdAt: Date;
  usuario?: {
    id: number;
    nombre: string;
    apellido: string;
  };
}

export class SubtareaResponseDto {
  id: number;
  tareaId: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  estado: TareaEstado;
  prioridad: TareaPrioridad;
  responsableId: number;
  responsable?: {
    id: number;
    nombre: string;
    email: string;
  };
  horasEstimadas: number;
  horasReales: number;
  evidencias?: EvidenciaSubtareaResponseDto[];
  fechaInicio: Date;
  fechaFin: Date;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}
