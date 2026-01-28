import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeSprintEstadoToSimple1767900000000 implements MigrationInterface {
  name = 'ChangeSprintEstadoToSimple1767900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, drop the default value
    await queryRunner.query(`
      ALTER TABLE agile.sprints
      ALTER COLUMN estado DROP DEFAULT;
    `);

    // Convert column to VARCHAR to allow text manipulation
    await queryRunner.query(`
      ALTER TABLE agile.sprints
      ALTER COLUMN estado TYPE VARCHAR(50) USING estado::VARCHAR;
    `);

    // Update existing values to new states
    await queryRunner.query(`
      UPDATE agile.sprints
      SET estado = CASE
        WHEN estado = 'Planificado' THEN 'Por hacer'
        WHEN estado = 'Activo' THEN 'En progreso'
        WHEN estado = 'Completado' THEN 'Finalizado'
        ELSE 'Por hacer'
      END;
    `);

    // Drop the old enum type
    await queryRunner.query(`
      DROP TYPE IF EXISTS agile.sprints_estado_enum;
    `);

    // Create new enum type with simple states
    await queryRunner.query(`
      CREATE TYPE agile.sprints_estado_enum AS ENUM ('Por hacer', 'En progreso', 'Finalizado');
    `);

    // Convert column back to enum
    await queryRunner.query(`
      ALTER TABLE agile.sprints
      ALTER COLUMN estado TYPE agile.sprints_estado_enum
      USING estado::agile.sprints_estado_enum;
    `);

    // Set new default
    await queryRunner.query(`
      ALTER TABLE agile.sprints
      ALTER COLUMN estado SET DEFAULT 'Por hacer';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop default
    await queryRunner.query(`
      ALTER TABLE agile.sprints
      ALTER COLUMN estado DROP DEFAULT;
    `);

    // Convert column to varchar
    await queryRunner.query(`
      ALTER TABLE agile.sprints
      ALTER COLUMN estado TYPE VARCHAR(50) USING estado::VARCHAR;
    `);

    // Update values back to original states
    await queryRunner.query(`
      UPDATE agile.sprints
      SET estado = CASE
        WHEN estado = 'Por hacer' THEN 'Planificado'
        WHEN estado = 'En progreso' THEN 'Activo'
        WHEN estado = 'Finalizado' THEN 'Completado'
        ELSE 'Planificado'
      END;
    `);

    // Drop new enum
    await queryRunner.query(`
      DROP TYPE IF EXISTS agile.sprints_estado_enum;
    `);

    // Create old enum type
    await queryRunner.query(`
      CREATE TYPE agile.sprints_estado_enum AS ENUM ('Planificado', 'Activo', 'Completado');
    `);

    // Convert column back to enum
    await queryRunner.query(`
      ALTER TABLE agile.sprints
      ALTER COLUMN estado TYPE agile.sprints_estado_enum
      USING estado::agile.sprints_estado_enum;
    `);

    // Set default
    await queryRunner.query(`
      ALTER TABLE agile.sprints
      ALTER COLUMN estado SET DEFAULT 'Planificado';
    `);
  }
}
