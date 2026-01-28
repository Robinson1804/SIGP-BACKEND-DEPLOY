/**
 * DTOs de respuesta para ruta crítica y exportación
 */

export class TareaConCPMDto {
  id: number;
  nombre: string;
  fechaInicio: Date;
  fechaFin: Date;
  duracion: number;
  earlyStart: number;
  earlyFinish: number;
  lateStart: number;
  lateFinish: number;
  holgura: number;
  enRutaCritica: boolean;
  tieneConflicto: boolean;
  conflictoDescripcion?: string;
}

export class ResultadoRutaCriticaDto {
  tareasCriticas: number[];
  tareasConConflicto: number[];
  duracionTotal: number;
  fechaFinProyecto: Date;
  detalle: TareaConCPMDto[];
}

export class TareaExportacionDto {
  codigo: string;
  nombre: string;
  fase: string;
  fechaInicio: string;
  fechaFin: string;
  duracion: number;
  porcentajeAvance: number;
  estado: string;
  prioridad: string;
  asignadoA: string;
  dependencias: string;
  esHito: boolean;
}

export class ResumenExportacionDto {
  totalTareas: number;
  tareasCompletadas: number;
  porcentajeGeneral: number;
  porFase: Record<string, { total: number; completadas: number }>;
}

export class CronogramaExportacionDto {
  nombre: string;
  codigo: string;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
  version: number;
}

export class DatosExportacionDto {
  cronograma: CronogramaExportacionDto;
  tareas: TareaExportacionDto[];
  resumen: ResumenExportacionDto;
}
