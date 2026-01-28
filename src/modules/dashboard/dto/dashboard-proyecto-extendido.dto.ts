/**
 * Dashboard Proyecto Extendido DTOs
 *
 * DTOs para endpoints adicionales del dashboard de proyecto (Scrum)
 */

// =====================================
// Feed de Actividad Reciente
// =====================================

export type TipoEvento =
  | 'tarea_completada'
  | 'tarea_creada'
  | 'hu_movida'
  | 'hu_completada'
  | 'sprint_iniciado'
  | 'sprint_completado'
  | 'documento_aprobado'
  | 'comentario';

export class EventoActividadDto {
  id: number;
  tipo: TipoEvento;
  titulo: string;
  descripcion: string;
  usuarioId: number | null;
  usuarioNombre: string | null;
  timestamp: string | Date | null;
  entidadTipo: 'Tarea' | 'HistoriaUsuario' | 'Sprint' | 'Documento';
  entidadId: number;
  metadata?: Record<string, any>;
}

export class ActividadRecienteResponseDto {
  data: EventoActividadDto[];
  total: number;
}

// =====================================
// Carga del Equipo
// =====================================

export class CargaDesarrolladorDto {
  personalId: number;
  nombre: string;
  rol: string;
  avatar?: string;
  tareasAsignadas: number;
  tareasEnProgreso: number;
  tareasCompletadas: number;
  storyPointsAsignados: number;
  storyPointsCompletados: number;
  porcentajeCarga: number; // 0-100
}

export class CargaEquipoResponseDto {
  data: CargaDesarrolladorDto[];
  promedioTareasCompletadas: number;
  totalStoryPoints: number;
}

// =====================================
// Resumen de Sprint Actual
// =====================================

export class ResumenSprintDto {
  id: number;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  diasRestantes: number;
  estado: string;
  progreso: number;
  historiasUsuario: {
    total: number;
    completadas: number;
    enProgreso: number;
    pendientes: number;
  };
  storyPoints: {
    total: number;
    completados: number;
  };
  burndownIdeal: number[];
  burndownReal: number[];
}

// =====================================
// Impedimentos Activos
// =====================================

export class ImpedimentoDto {
  id: number;
  descripcion: string;
  reportadoPor: string;
  fechaReporte: Date;
  estado: 'activo' | 'resuelto';
  prioridad: 'alta' | 'media' | 'baja';
  entidadAfectada?: {
    tipo: string;
    id: number;
    nombre: string;
  };
}

export class ImpedimentosResponseDto {
  data: ImpedimentoDto[];
  total: number;
  activos: number;
}
