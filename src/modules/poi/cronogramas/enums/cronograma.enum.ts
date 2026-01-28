export enum CronogramaEstado {
  BORRADOR = 'Borrador',
  EN_REVISION = 'En revisión',
  APROBADO = 'Aprobado',
  RECHAZADO = 'Rechazado',
}

export enum TareaEstado {
  POR_HACER = 'Por hacer',
  EN_PROGRESO = 'En progreso',
  COMPLETADO = 'Completado',
}

export enum TareaPrioridad {
  BAJA = 'Baja',
  MEDIA = 'Media',
  ALTA = 'Alta',
}

/**
 * Fases del ciclo de vida del proyecto para cronograma
 */
export enum FaseCronograma {
  ANALISIS = 'Analisis',
  DISENO = 'Diseno',
  DESARROLLO = 'Desarrollo',
  PRUEBAS = 'Pruebas',
  IMPLEMENTACION = 'Implementacion',
  MANTENIMIENTO = 'Mantenimiento',
}

/**
 * Tipos de dependencia entre tareas del cronograma
 * FS: Finish-to-Start (la tarea B comienza cuando A termina)
 * FF: Finish-to-Finish (B termina cuando A termina)
 * SS: Start-to-Start (B comienza cuando A comienza)
 * SF: Start-to-Finish (B termina cuando A comienza)
 */
export enum TipoDependencia {
  FS = 'FS',
  FF = 'FF',
  SS = 'SS',
  SF = 'SF',
}

/**
 * Opciones de asignación para tareas del cronograma
 * SCRUM_MASTER: Solo el Scrum Master del proyecto
 * DESARROLLADORES: Todos los desarrolladores del proyecto
 * TODO_EQUIPO: Scrum Master + Todos los desarrolladores
 */
export enum AsignadoA {
  SCRUM_MASTER = 'Scrum Master',
  DESARROLLADORES = 'Desarrolladores',
  TODO_EQUIPO = 'Todo el equipo',
}
