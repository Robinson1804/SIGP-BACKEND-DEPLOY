import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddKanbanFeatures1766400000000 implements MigrationInterface {
  name = 'AddKanbanFeatures1766400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Crear tabla tarea_asignados para múltiples asignados en tareas Kanban
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS agile.tarea_asignados (
        id SERIAL PRIMARY KEY,
        tarea_id INTEGER NOT NULL REFERENCES agile.tareas(id) ON DELETE CASCADE,
        usuario_id INTEGER NOT NULL REFERENCES public.usuarios(id),
        rol VARCHAR(50) DEFAULT 'IMPLEMENTADOR',
        asignado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        asignado_por INTEGER REFERENCES public.usuarios(id),
        activo BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(tarea_id, usuario_id)
      )
    `);

    // Índices para tarea_asignados
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_tarea_asignados_tarea
      ON agile.tarea_asignados(tarea_id)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_tarea_asignados_usuario
      ON agile.tarea_asignados(usuario_id)
    `);

    // 2. Agregar campos de timestamps para métricas precisas en tareas
    await queryRunner.query(`
      ALTER TABLE agile.tareas
      ADD COLUMN IF NOT EXISTS fecha_inicio_progreso TIMESTAMP WITH TIME ZONE
    `);
    await queryRunner.query(`
      ALTER TABLE agile.tareas
      ADD COLUMN IF NOT EXISTS fecha_completado TIMESTAMP WITH TIME ZONE
    `);

    // 3. Agregar campo orden para subtareas (reordenamiento drag & drop)
    await queryRunner.query(`
      ALTER TABLE agile.subtareas
      ADD COLUMN IF NOT EXISTS orden INTEGER DEFAULT 0
    `);

    // 4. Crear tabla para configuración de columnas del tablero (WIP limits)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS agile.columnas_tablero (
        id SERIAL PRIMARY KEY,
        actividad_id INTEGER REFERENCES poi.actividades(id) ON DELETE CASCADE,
        proyecto_id INTEGER REFERENCES poi.proyectos(id) ON DELETE CASCADE,
        nombre VARCHAR(50) NOT NULL,
        estado VARCHAR(30) NOT NULL,
        orden INTEGER NOT NULL DEFAULT 0,
        wip_limit INTEGER,
        color VARCHAR(20),
        activo BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CHECK (actividad_id IS NOT NULL OR proyecto_id IS NOT NULL)
      )
    `);

    // Índices para columnas_tablero
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_columnas_tablero_actividad
      ON agile.columnas_tablero(actividad_id)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_columnas_tablero_proyecto
      ON agile.columnas_tablero(proyecto_id)
    `);

    // 5. Trigger para actualizar fecha_inicio_progreso automáticamente
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION agile.update_tarea_timestamps()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Si cambia a "En progreso" y no tiene fecha_inicio_progreso
        IF NEW.estado = 'En progreso' AND OLD.estado != 'En progreso' AND NEW.fecha_inicio_progreso IS NULL THEN
          NEW.fecha_inicio_progreso = NOW();
        END IF;

        -- Si cambia a "Finalizado"
        IF NEW.estado = 'Finalizado' AND OLD.estado != 'Finalizado' THEN
          NEW.fecha_completado = NOW();
        END IF;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryRunner.query(`
      DROP TRIGGER IF EXISTS trg_tarea_timestamps ON agile.tareas
    `);

    await queryRunner.query(`
      CREATE TRIGGER trg_tarea_timestamps
      BEFORE UPDATE ON agile.tareas
      FOR EACH ROW
      EXECUTE FUNCTION agile.update_tarea_timestamps()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar trigger
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_tarea_timestamps ON agile.tareas`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS agile.update_tarea_timestamps()`);

    // Eliminar tabla columnas_tablero
    await queryRunner.query(`DROP TABLE IF EXISTS agile.columnas_tablero`);

    // Eliminar campo orden de subtareas
    await queryRunner.query(`ALTER TABLE agile.subtareas DROP COLUMN IF EXISTS orden`);

    // Eliminar campos de timestamps de tareas
    await queryRunner.query(`ALTER TABLE agile.tareas DROP COLUMN IF EXISTS fecha_inicio_progreso`);
    await queryRunner.query(`ALTER TABLE agile.tareas DROP COLUMN IF EXISTS fecha_completado`);

    // Eliminar tabla tarea_asignados
    await queryRunner.query(`DROP TABLE IF EXISTS agile.tarea_asignados`);
  }
}
