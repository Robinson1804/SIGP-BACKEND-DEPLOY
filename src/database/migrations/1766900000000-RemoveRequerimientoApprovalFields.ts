import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveRequerimientoApprovalFields1766900000000
  implements MigrationInterface
{
  name = 'RemoveRequerimientoApprovalFields1766900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Remove approval-related columns from requerimientos table
    await queryRunner.query(`
      ALTER TABLE poi.requerimientos
      DROP COLUMN IF EXISTS solicitante_id,
      DROP COLUMN IF EXISTS fecha_solicitud,
      DROP COLUMN IF EXISTS fecha_aprobacion,
      DROP COLUMN IF EXISTS aprobado_por,
      DROP COLUMN IF EXISTS estado
    `);

    // Drop the enum type if it exists
    await queryRunner.query(`
      DROP TYPE IF EXISTS poi.requerimientos_estado_enum
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate the enum type
    await queryRunner.query(`
      CREATE TYPE poi.requerimientos_estado_enum AS ENUM ('Pendiente', 'Aprobado', 'No Aprobado')
    `);

    // Add columns back
    await queryRunner.query(`
      ALTER TABLE poi.requerimientos
      ADD COLUMN IF NOT EXISTS solicitante_id INTEGER,
      ADD COLUMN IF NOT EXISTS fecha_solicitud DATE,
      ADD COLUMN IF NOT EXISTS fecha_aprobacion DATE,
      ADD COLUMN IF NOT EXISTS aprobado_por INTEGER,
      ADD COLUMN IF NOT EXISTS estado poi.requerimientos_estado_enum DEFAULT 'Pendiente'
    `);
  }
}
