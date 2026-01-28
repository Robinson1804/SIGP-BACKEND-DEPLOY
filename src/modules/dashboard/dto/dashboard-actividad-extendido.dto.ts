/**
 * Dashboard Actividad Extendido DTOs
 *
 * DTOs para endpoints adicionales del dashboard de actividad (Kanban)
 */

// =====================================
// CFD (Cumulative Flow Diagram)
// =====================================

export class CfdDataPointDto {
  fecha: string; // ISO date string
  porHacer: number;
  enProgreso: number;
  enRevision: number;
  finalizado: number;
  total: number;
}

export class CfdResponseDto {
  data: CfdDataPointDto[];
  actividadId: number;
  periodoInicio: string;
  periodoFin: string;
}

// =====================================
// Tendencias de Metricas Kanban
// =====================================

export class TendenciaMetricaDto {
  periodo: string; // Semana, mes, etc.
  periodoLabel: string; // "Sem 1", "Sem 2", etc.
  leadTime: number; // en dias
  cycleTime: number; // en dias
  throughput: number; // tareas completadas
  wipPromedio: number; // Work in Progress promedio
}

export class TendenciasMetricasResponseDto {
  data: TendenciaMetricaDto[];
  actividadId: number;
  promedios: {
    leadTime: number;
    cycleTime: number;
    throughput: number;
  };
  tendencias: {
    leadTime: 'mejorando' | 'empeorando' | 'estable';
    cycleTime: 'mejorando' | 'empeorando' | 'estable';
    throughput: 'mejorando' | 'empeorando' | 'estable';
  };
}

// =====================================
// Tareas por Prioridad
// =====================================

export class TareasPorPrioridadDto {
  must: number;
  should: number;
  could: number;
  wont: number;
  sinPrioridad: number;
}

export class TareasPorPrioridadDetalleDto {
  prioridad: 'Must' | 'Should' | 'Could' | 'Wont' | 'Sin prioridad';
  total: number;
  completadas: number;
  enProgreso: number;
  pendientes: number;
  porcentaje: number;
}

export class TareasPorPrioridadResponseDto {
  resumen: TareasPorPrioridadDto;
  detalle: TareasPorPrioridadDetalleDto[];
  actividadId: number;
}

// =====================================
// Historial de WIP
// =====================================

export class WipHistorialDto {
  fecha: string;
  wip: number;
  limite: number;
  excedido: boolean;
}

export class WipHistorialResponseDto {
  data: WipHistorialDto[];
  limiteActual: number;
  promedioWip: number;
  vecesExcedido: number;
}

// =====================================
// Tareas Bloqueadas / Envejecidas
// =====================================

export class TareaBloqueadaDto {
  id: number;
  codigo: string;
  titulo: string;
  estado: string;
  diasEnEstado: number;
  responsable: string | null;
  prioridad: string | null;
  razonBloqueo?: string;
}

export class TareasBloqueadasResponseDto {
  data: TareaBloqueadaDto[];
  total: number;
  porEstado: {
    enProgreso: number;
    enRevision: number;
  };
}

// =====================================
// Distribucion por Responsable
// =====================================

export class ResponsableCargaDto {
  personalId: number;
  nombre: string;
  tareasPorHacer: number;
  tareasEnProgreso: number;
  tareasEnRevision: number;
  tareasCompletadas: number;
  total: number;
}

export class DistribucionResponsablesResponseDto {
  data: ResponsableCargaDto[];
  sinAsignar: number;
  actividadId: number;
}
