/**
 * Dashboard Gerencial DTOs
 *
 * DTOs para endpoints de vision ejecutiva del dashboard
 */

// =====================================
// KPIs con Variación
// =====================================

export class KpiConVariacionDto {
  valor: number;
  variacion: number; // porcentaje vs periodo anterior
  tendencia: 'up' | 'down' | 'stable';
  detalles: {
    enCurso?: number;
    finalizados?: number;
    atrasados?: number;
    pendientes?: number;
  };
}

export class KpisGerencialesDto {
  proyectos: KpiConVariacionDto;
  actividades: KpiConVariacionDto;
  sprintsActivos: KpiConVariacionDto;
  tareasDelDia: KpiConVariacionDto;
}

// =====================================
// Proyectos Activos
// =====================================

export class ProyectoActivoDto {
  id: number;
  codigo: string;
  nombre: string;
  sprintActual: {
    id: number;
    nombre: string;
  } | null;
  storyPointsCompletados: number;
  storyPointsTotal: number;
  porcentajeAvance: number;
  estado: string;
  salud: 'verde' | 'amarillo' | 'rojo';
  proximaFecha: string | null;
  coordinadorNombre: string | null;
}

export class ProyectosActivosResponseDto {
  data: ProyectoActivoDto[];
  total: number;
  page: number;
  limit: number;
}

// =====================================
// Actividades Activas
// =====================================

export class ActividadActivaDto {
  id: number;
  codigo: string;
  nombre: string;
  tareasTotal: number;
  tareasCompletadasMes: number;
  leadTimePromedio: number;
  throughputSemanal: number;
  coordinadorNombre: string | null;
  estado: string;
  progreso: number;
}

export class ActividadesActivasResponseDto {
  data: ActividadActivaDto[];
  total: number;
  page: number;
  limit: number;
}

// =====================================
// Timeline de Sprints (Gantt)
// =====================================

export class SprintTimelineDto {
  id: number;
  nombre: string;
  proyectoId: number;
  proyectoNombre: string;
  proyectoCodigo: string;
  fechaInicio: string;
  fechaFin: string;
  estado: 'Por hacer' | 'En progreso' | 'Finalizado';
  progreso: number;
  storyPointsCompletados: number;
  storyPointsTotal: number;
}

export class SprintsTimelineResponseDto {
  data: SprintTimelineDto[];
  rangoInicio: string;
  rangoFin: string;
}

// =====================================
// Salud de Proyectos Detallada
// =====================================

export class ProyectoSaludDetalleDto {
  id: number;
  codigo: string;
  nombre: string;
  salud: 'verde' | 'amarillo' | 'rojo';
  razon: string;
}

export class SaludProyectosDetalladaDto {
  verde: ProyectoSaludDetalleDto[];
  amarillo: ProyectoSaludDetalleDto[];
  rojo: ProyectoSaludDetalleDto[];
  resumen: {
    verde: number;
    amarillo: number;
    rojo: number;
  };
}
