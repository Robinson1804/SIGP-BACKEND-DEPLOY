export class ActividadInfoDto {
  id: number;
  codigo: string;
  nombre: string;
  estado: string;
  progreso: number;
}

export class MetricasKanbanDto {
  leadTime: number;
  cycleTime: number;
  throughput: number;
}

export class ThroughputSemanalDto {
  semana: string;
  completadas: number;
}

export class EquipoActividadMiembroDto {
  personalId: number;
  nombre: string;
  rol: string;
  dedicacion: number;
}

export class DashboardActividadDto {
  actividad: ActividadInfoDto;
  metricasKanban: MetricasKanbanDto;
  tareasPorEstado: Record<string, number>;
  throughputSemanal: ThroughputSemanalDto[];
  equipo: EquipoActividadMiembroDto[];
}
