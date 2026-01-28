import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGestorIdToActividades1768400000000 implements MigrationInterface {
  name = 'AddGestorIdToActividades1768400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add gestor_id column to poi.actividades
    await queryRunner.query(`
      ALTER TABLE poi.actividades
      ADD COLUMN IF NOT EXISTS gestor_id INTEGER DEFAULT NULL;
    `);

    // 2. Add foreign key constraint referencing public.usuarios
    await queryRunner.query(`
      ALTER TABLE poi.actividades
      ADD CONSTRAINT "FK_actividades_gestor"
      FOREIGN KEY (gestor_id)
      REFERENCES public.usuarios(id)
      ON DELETE SET NULL;
    `);

    // 3. Create index for better query performance
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_actividades_gestor_id"
      ON poi.actividades(gestor_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Drop the index
    await queryRunner.query(`
      DROP INDEX IF EXISTS poi."IDX_actividades_gestor_id";
    `);

    // 2. Drop the foreign key constraint
    await queryRunner.query(`
      ALTER TABLE poi.actividades
      DROP CONSTRAINT IF EXISTS "FK_actividades_gestor";
    `);

    // 3. Drop the gestor_id column
    await queryRunner.query(`
      ALTER TABLE poi.actividades
      DROP COLUMN IF EXISTS gestor_id;
    `);
  }
}
