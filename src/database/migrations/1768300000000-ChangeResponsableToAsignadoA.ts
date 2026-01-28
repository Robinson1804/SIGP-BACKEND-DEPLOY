import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeResponsableToAsignadoA1768300000000 implements MigrationInterface {
  name = 'ChangeResponsableToAsignadoA1768300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create the new enum type for asignado_a
    await queryRunner.query(`
      CREATE TYPE poi.tareas_cronograma_asignado_a_enum AS ENUM (
        'Scrum Master',
        'Desarrolladores',
        'Todo el equipo'
      );
    `);

    // 2. Drop the foreign key constraint on responsable_id
    await queryRunner.query(`
      ALTER TABLE poi.tareas_cronograma
      DROP CONSTRAINT IF EXISTS "FK_tareas_cronograma_responsable";
    `);

    // 3. Drop the responsable_id column
    await queryRunner.query(`
      ALTER TABLE poi.tareas_cronograma
      DROP COLUMN IF EXISTS responsable_id;
    `);

    // 4. Add the new asignado_a column with enum type
    await queryRunner.query(`
      ALTER TABLE poi.tareas_cronograma
      ADD COLUMN asignado_a poi.tareas_cronograma_asignado_a_enum DEFAULT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Drop the asignado_a column
    await queryRunner.query(`
      ALTER TABLE poi.tareas_cronograma
      DROP COLUMN IF EXISTS asignado_a;
    `);

    // 2. Drop the enum type
    await queryRunner.query(`
      DROP TYPE IF EXISTS poi.tareas_cronograma_asignado_a_enum;
    `);

    // 3. Re-add the responsable_id column
    await queryRunner.query(`
      ALTER TABLE poi.tareas_cronograma
      ADD COLUMN responsable_id INTEGER DEFAULT NULL;
    `);

    // 4. Re-add the foreign key constraint
    await queryRunner.query(`
      ALTER TABLE poi.tareas_cronograma
      ADD CONSTRAINT "FK_tareas_cronograma_responsable"
      FOREIGN KEY (responsable_id)
      REFERENCES rrhh.personal(id)
      ON DELETE SET NULL;
    `);
  }
}
