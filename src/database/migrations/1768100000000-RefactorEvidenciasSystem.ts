import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migración para refactorizar el sistema de evidencias
 *
 * SCRUM: HU → Tareas → Evidencias (tabla evidencias_tarea)
 *        Cuando todas las tareas tienen evidencias y estado="Finalizado"
 *        → Se genera PDF consolidado → HU pasa a "En revisión"
 *
 * KANBAN: Tarea → Subtareas → Evidencias (tabla evidencias_subtarea)
 *         Cuando todas las subtareas tienen evidencias y estado="Finalizado"
 *         → Se genera PDF consolidado → Tarea pasa a "En revisión"
 */
export class RefactorEvidenciasSystem1768100000000 implements MigrationInterface {
  name = 'RefactorEvidenciasSystem1768100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Crear tabla evidencias_subtarea (para KANBAN)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS agile.evidencias_subtarea (
        id SERIAL PRIMARY KEY,
        subtarea_id INTEGER NOT NULL REFERENCES agile.subtareas(id) ON DELETE CASCADE,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT,
        url VARCHAR(500) NOT NULL,
        tipo VARCHAR(50),
        tamano_bytes BIGINT,
        subido_por INTEGER NOT NULL REFERENCES public.usuarios(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Crear índice para búsquedas por subtarea
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_evidencias_subtarea_subtarea_id
      ON agile.evidencias_subtarea(subtarea_id);
    `);

    // 3. Eliminar campo evidencia_url de subtareas (ya no se usa)
    await queryRunner.query(`
      ALTER TABLE agile.subtareas
      DROP COLUMN IF EXISTS evidencia_url;
    `);

    // 4. Agregar campo documento_evidencias_url en historias_usuario (para PDF generado SCRUM)
    await queryRunner.query(`
      ALTER TABLE agile.historias_usuario
      ADD COLUMN IF NOT EXISTS documento_evidencias_url TEXT;
    `);

    // 5. Agregar campo documento_evidencias_url en tareas (para PDF generado KANBAN)
    await queryRunner.query(`
      ALTER TABLE agile.tareas
      ADD COLUMN IF NOT EXISTS documento_evidencias_url TEXT;
    `);

    // 6. Comentarios explicativos
    await queryRunner.query(`
      COMMENT ON TABLE agile.evidencias_subtarea IS
      'Evidencias adjuntas a subtareas (KANBAN). Cada subtarea puede tener múltiples archivos.';
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN agile.historias_usuario.documento_evidencias_url IS
      'URL del PDF generado con evidencias de todas las tareas. Se genera cuando todas las tareas están finalizadas con evidencias.';
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN agile.tareas.documento_evidencias_url IS
      'URL del PDF generado con evidencias de todas las subtareas (solo KANBAN). Se genera cuando todas las subtareas están finalizadas con evidencias.';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revertir cambios en orden inverso

    // 1. Eliminar campos documento_evidencias_url
    await queryRunner.query(`
      ALTER TABLE agile.tareas
      DROP COLUMN IF EXISTS documento_evidencias_url;
    `);

    await queryRunner.query(`
      ALTER TABLE agile.historias_usuario
      DROP COLUMN IF EXISTS documento_evidencias_url;
    `);

    // 2. Restaurar campo evidencia_url en subtareas
    await queryRunner.query(`
      ALTER TABLE agile.subtareas
      ADD COLUMN IF NOT EXISTS evidencia_url VARCHAR(500);
    `);

    // 3. Eliminar índice
    await queryRunner.query(`
      DROP INDEX IF EXISTS agile.idx_evidencias_subtarea_subtarea_id;
    `);

    // 4. Eliminar tabla evidencias_subtarea
    await queryRunner.query(`
      DROP TABLE IF EXISTS agile.evidencias_subtarea;
    `);
  }
}
