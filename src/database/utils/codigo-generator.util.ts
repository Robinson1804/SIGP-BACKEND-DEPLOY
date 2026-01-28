import { DataSource, EntityManager } from 'typeorm';

/**
 * Code prefix mappings
 */
export const CODE_PREFIXES = {
  // Planning
  PGD: { prefix: 'PGD', sequence: 'planning.seq_pgd_codigo', padding: 4 },
  OEI: { prefix: 'OEI', sequence: 'planning.seq_oei_codigo', padding: 4 },
  OGD: { prefix: 'OGD', sequence: 'planning.seq_ogd_codigo', padding: 4 },
  OEGD: { prefix: 'OEGD', sequence: 'planning.seq_oegd_codigo', padding: 4 },
  AE: { prefix: 'AE', sequence: 'planning.seq_ae_codigo', padding: 4 },

  // POI
  PROYECTO: { prefix: 'PRY', sequence: 'poi.seq_proyecto_codigo', padding: 4 },
  ACTIVIDAD: { prefix: 'ACT', sequence: 'poi.seq_actividad_codigo', padding: 4 },
  SUBPROYECTO: { prefix: 'SPR', sequence: 'poi.seq_subproyecto_codigo', padding: 4 },
  DOCUMENTO: { prefix: 'DOC', sequence: 'poi.seq_documento_codigo', padding: 4 },
  ACTA: { prefix: 'ACTA', sequence: 'poi.seq_acta_codigo', padding: 4 },
  REQUERIMIENTO: { prefix: 'REQ', sequence: 'poi.seq_requerimiento_codigo', padding: 4 },

  // Agile
  EPICA: { prefix: 'EP', sequence: 'agile.seq_epica_codigo', padding: 4 },
  SPRINT: { prefix: 'SPR', sequence: 'agile.seq_sprint_numero', padding: 3 },
  HISTORIA_USUARIO: { prefix: 'US', sequence: 'agile.seq_hu_codigo', padding: 4 },
  TAREA: { prefix: 'TSK', sequence: 'agile.seq_tarea_codigo', padding: 5 },
  SUBTAREA: { prefix: 'SUB', sequence: 'agile.seq_subtarea_codigo', padding: 5 },
  DAILY: { prefix: 'DLY', sequence: 'agile.seq_daily_codigo', padding: 4 },
} as const;

export type CodeType = keyof typeof CODE_PREFIXES;

/**
 * Generate a sequential code
 *
 * @param dataSource - TypeORM DataSource or EntityManager
 * @param codeType - Type of code to generate
 * @returns Generated code (e.g., 'PRY-0001')
 */
export async function generateCodigo(
  dataSource: DataSource | EntityManager,
  codeType: CodeType,
): Promise<string> {
  const config = CODE_PREFIXES[codeType];

  if (!config) {
    throw new Error(`Unknown code type: ${codeType}`);
  }

  const manager = dataSource instanceof DataSource
    ? dataSource.manager
    : dataSource;

  // Get next value from sequence
  const result = await manager.query(
    `SELECT nextval('${config.sequence}') as next_val`,
  );

  const nextVal = result[0].next_val;

  // Format code with padding
  const paddedNumber = String(nextVal).padStart(config.padding, '0');

  return `${config.prefix}-${paddedNumber}`;
}

/**
 * Generate a sequential code for a specific project (scoped)
 *
 * @param dataSource - TypeORM DataSource or EntityManager
 * @param codeType - Type of code to generate
 * @param projectCode - Project code for scoping
 * @returns Generated code (e.g., 'PRY-0001-TSK-00001')
 */
export async function generateScopedCodigo(
  dataSource: DataSource | EntityManager,
  codeType: CodeType,
  projectCode: string,
): Promise<string> {
  const baseCodigo = await generateCodigo(dataSource, codeType);
  return `${projectCode}-${baseCodigo}`;
}

/**
 * Reset a sequence (useful for testing)
 *
 * @param dataSource - TypeORM DataSource
 * @param codeType - Type of code sequence to reset
 * @param startValue - Value to reset to (default: 1)
 */
export async function resetSequence(
  dataSource: DataSource,
  codeType: CodeType,
  startValue: number = 1,
): Promise<void> {
  const config = CODE_PREFIXES[codeType];

  if (!config) {
    throw new Error(`Unknown code type: ${codeType}`);
  }

  await dataSource.query(
    `ALTER SEQUENCE ${config.sequence} RESTART WITH ${startValue}`,
  );
}

/**
 * Get current sequence value (without incrementing)
 *
 * @param dataSource - TypeORM DataSource
 * @param codeType - Type of code sequence
 * @returns Current sequence value
 */
export async function getCurrentSequenceValue(
  dataSource: DataSource,
  codeType: CodeType,
): Promise<number> {
  const config = CODE_PREFIXES[codeType];

  if (!config) {
    throw new Error(`Unknown code type: ${codeType}`);
  }

  const result = await dataSource.query(
    `SELECT last_value FROM ${config.sequence}`,
  );

  return result[0].last_value;
}
