import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: Create PostgreSQL Schemas
 *
 * Creates all schemas used in SIGP:
 * - planning: Strategic planning (PGD → OEI → OGD → OEGD → AE)
 * - poi: Operational planning (Proyectos, Actividades)
 * - agile: Agile methodologies (Sprints, HUs, Tareas)
 * - rrhh: Human resources (Personal, Asignaciones)
 * - notificaciones: Notification system
 * - storage: File storage
 */
export class CreateSchemas1734153600000 implements MigrationInterface {
  name = 'CreateSchemas1734153600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create schemas
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS planning`);
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS poi`);
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS agile`);
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS rrhh`);
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS notificaciones`);
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS storage`);

    // Add comments
    await queryRunner.query(
      `COMMENT ON SCHEMA planning IS 'Planificación estratégica: PGD, OEI, OGD, OEGD, Acciones Estratégicas'`,
    );
    await queryRunner.query(
      `COMMENT ON SCHEMA poi IS 'Plan Operativo Informático: Proyectos, Actividades, Documentos, Informes'`,
    );
    await queryRunner.query(
      `COMMENT ON SCHEMA agile IS 'Gestión ágil: Sprints, Historias de Usuario, Tareas, Tableros'`,
    );
    await queryRunner.query(
      `COMMENT ON SCHEMA rrhh IS 'Recursos Humanos: Personal, Divisiones, Habilidades, Asignaciones'`,
    );
    await queryRunner.query(
      `COMMENT ON SCHEMA notificaciones IS 'Sistema de notificaciones y preferencias'`,
    );
    await queryRunner.query(
      `COMMENT ON SCHEMA storage IS 'Almacenamiento de archivos y documentos'`,
    );

    // Create extensions
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "unaccent"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pg_trgm"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "btree_gist"`);

    // Create sequences for código generation
    // Planning sequences
    await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS planning.seq_pgd_codigo START 1`);
    await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS planning.seq_oei_codigo START 1`);
    await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS planning.seq_ogd_codigo START 1`);
    await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS planning.seq_oegd_codigo START 1`);
    await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS planning.seq_ae_codigo START 1`);

    // POI sequences
    await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS poi.seq_proyecto_codigo START 1`);
    await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS poi.seq_actividad_codigo START 1`);
    await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS poi.seq_subproyecto_codigo START 1`);
    await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS poi.seq_documento_codigo START 1`);
    await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS poi.seq_acta_codigo START 1`);
    await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS poi.seq_requerimiento_codigo START 1`);

    // Agile sequences
    await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS agile.seq_epica_codigo START 1`);
    await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS agile.seq_sprint_numero START 1`);
    await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS agile.seq_hu_codigo START 1`);
    await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS agile.seq_tarea_codigo START 1`);
    await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS agile.seq_subtarea_codigo START 1`);
    await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS agile.seq_daily_codigo START 1`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop sequences
    await queryRunner.query(`DROP SEQUENCE IF EXISTS agile.seq_daily_codigo`);
    await queryRunner.query(`DROP SEQUENCE IF EXISTS agile.seq_subtarea_codigo`);
    await queryRunner.query(`DROP SEQUENCE IF EXISTS agile.seq_tarea_codigo`);
    await queryRunner.query(`DROP SEQUENCE IF EXISTS agile.seq_hu_codigo`);
    await queryRunner.query(`DROP SEQUENCE IF EXISTS agile.seq_sprint_numero`);
    await queryRunner.query(`DROP SEQUENCE IF EXISTS agile.seq_epica_codigo`);

    await queryRunner.query(`DROP SEQUENCE IF EXISTS poi.seq_requerimiento_codigo`);
    await queryRunner.query(`DROP SEQUENCE IF EXISTS poi.seq_acta_codigo`);
    await queryRunner.query(`DROP SEQUENCE IF EXISTS poi.seq_documento_codigo`);
    await queryRunner.query(`DROP SEQUENCE IF EXISTS poi.seq_subproyecto_codigo`);
    await queryRunner.query(`DROP SEQUENCE IF EXISTS poi.seq_actividad_codigo`);
    await queryRunner.query(`DROP SEQUENCE IF EXISTS poi.seq_proyecto_codigo`);

    await queryRunner.query(`DROP SEQUENCE IF EXISTS planning.seq_ae_codigo`);
    await queryRunner.query(`DROP SEQUENCE IF EXISTS planning.seq_oegd_codigo`);
    await queryRunner.query(`DROP SEQUENCE IF EXISTS planning.seq_ogd_codigo`);
    await queryRunner.query(`DROP SEQUENCE IF EXISTS planning.seq_oei_codigo`);
    await queryRunner.query(`DROP SEQUENCE IF EXISTS planning.seq_pgd_codigo`);

    // Drop schemas (CASCADE will drop all tables in schemas)
    await queryRunner.query(`DROP SCHEMA IF EXISTS storage CASCADE`);
    await queryRunner.query(`DROP SCHEMA IF EXISTS notificaciones CASCADE`);
    await queryRunner.query(`DROP SCHEMA IF EXISTS rrhh CASCADE`);
    await queryRunner.query(`DROP SCHEMA IF EXISTS agile CASCADE`);
    await queryRunner.query(`DROP SCHEMA IF EXISTS poi CASCADE`);
    await queryRunner.query(`DROP SCHEMA IF EXISTS planning CASCADE`);
  }
}
