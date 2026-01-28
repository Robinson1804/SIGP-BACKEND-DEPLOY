/**
 * Enums para el sistema de Historial de Cambios
 * Sistema de auditoria automatica para el modulo Agile
 */

/**
 * Tipos de entidades que pueden ser auditadas
 */
export enum HistorialEntidadTipo {
  HISTORIA_USUARIO = 'HistoriaUsuario',
  TAREA = 'Tarea',
  SUBTAREA = 'Subtarea',
  SPRINT = 'Sprint',
  EPICA = 'Epica',
  DAILY_MEETING = 'DailyMeeting',
}

/**
 * Tipos de acciones/cambios que se pueden registrar
 */
export enum HistorialAccion {
  CREACION = 'CREACION',
  ACTUALIZACION = 'ACTUALIZACION',
  ELIMINACION = 'ELIMINACION',
  CAMBIO_ESTADO = 'CAMBIO_ESTADO',
  ASIGNACION = 'ASIGNACION',
  REASIGNACION = 'REASIGNACION',
  MOVIMIENTO = 'MOVIMIENTO',
  INICIO = 'INICIO',
  CIERRE = 'CIERRE',
  VALIDACION = 'VALIDACION',
}

/**
 * Campos que NO deben ser auditados (timestamps internos, etc.)
 */
export const CAMPOS_EXCLUIDOS_AUDITORIA = [
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
];

/**
 * Mapeo de campos a nombres legibles para descripciones
 */
export const CAMPO_NOMBRES_LEGIBLES: Record<string, string> = {
  // Historia de Usuario
  titulo: 'Titulo',
  descripcion: 'Descripcion',
  estado: 'Estado',
  prioridad: 'Prioridad',
  storyPoints: 'Story Points',
  sprintId: 'Sprint',
  epicaId: 'Epica',
  asignadoA: 'Asignado a',
  ordenBacklog: 'Orden en Backlog',
  activo: 'Activo',
  // Tarea
  nombre: 'Nombre',
  horasEstimadas: 'Horas Estimadas',
  horasReales: 'Horas Reales',
  validada: 'Validada',
  validadaPor: 'Validado por',
  documentoEvidenciasUrl: 'Documento de Evidencias',
  // Sprint
  objetivo: 'Objetivo',
  fechaInicio: 'Fecha de Inicio',
  fechaFin: 'Fecha de Fin',
  fechaInicioReal: 'Fecha de Inicio Real',
  fechaFinReal: 'Fecha de Fin Real',
  linkEvidencia: 'Link de Evidencia',
  // Epica
  color: 'Color',
  codigo: 'Codigo',
};
