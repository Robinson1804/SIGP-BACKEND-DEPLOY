export class KpisProyectosDto {
  total: number;
  enCurso: number;
  atrasados: number;
  completados: number;
}

export class KpisActividadesDto {
  total: number;
  enEjecucion: number;
  suspendidas: number;
}

export class KpisSprintsDto {
  activos: number;
  velocidadPromedio: number;
}

export class KpisTareasDto {
  total: number;
  enProgreso: number;
  bloqueadas: number;
}

export class KpisDto {
  proyectos: KpisProyectosDto;
  actividades: KpisActividadesDto;
  sprints: KpisSprintsDto;
  tareas: KpisTareasDto;
}

export class SaludProyectosDto {
  verde: number;
  amarillo: number;
  rojo: number;
}

export class AlertaDto {
  tipo: string;
  mensaje: string;
  entidadTipo: string;
  entidadId: number;
  urgencia: 'alta' | 'media' | 'baja';
}

export class RecursoSobrecargaDto {
  personalId: number;
  nombre: string;
  porcentajeDedicacion: number;
}

export class DashboardGeneralDto {
  kpis: KpisDto;
  saludProyectos: SaludProyectosDto;
  alertas: AlertaDto[];
  recursosConSobrecarga: RecursoSobrecargaDto[];
}
