import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveEvidenciaUrlFromTareas1768000000000 implements MigrationInterface {
  name = 'RemoveEvidenciaUrlFromTareas1768000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Eliminar la columna evidencia_url de la tabla tareas
    // Ya no se usa porque las evidencias se guardan en la tabla evidencias_tarea
    await queryRunner.query(`
      ALTER TABLE agile.tareas
      DROP COLUMN IF EXISTS evidencia_url;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Restaurar la columna si se hace rollback
    await queryRunner.query(`
      ALTER TABLE agile.tareas
      ADD COLUMN IF NOT EXISTS evidencia_url VARCHAR(500) NULL;
    `);
  }
}
