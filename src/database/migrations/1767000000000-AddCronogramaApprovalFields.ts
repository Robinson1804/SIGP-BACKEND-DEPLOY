import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCronogramaApprovalFields1767000000000 implements MigrationInterface {
  name = 'AddCronogramaApprovalFields1767000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add missing enum values for cronograma states (Pendiente, Aprobado, Rechazado)
    await queryRunner.query(`
      DO $$
      BEGIN
        -- Add 'Pendiente' if not exists
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'cronogramas_estado_enum'::regtype AND enumlabel = 'Pendiente') THEN
          ALTER TYPE cronogramas_estado_enum ADD VALUE 'Pendiente';
        END IF;
        -- Add 'Aprobado' if not exists
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'cronogramas_estado_enum'::regtype AND enumlabel = 'Aprobado') THEN
          ALTER TYPE cronogramas_estado_enum ADD VALUE 'Aprobado';
        END IF;
        -- Add 'Rechazado' if not exists
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'cronogramas_estado_enum'::regtype AND enumlabel = 'Rechazado') THEN
          ALTER TYPE cronogramas_estado_enum ADD VALUE 'Rechazado';
        END IF;
      END $$;
    `);

    console.log('✅ Added missing enum values to cronogramas_estado_enum');

    // Add dual approval fields to cronogramas table
    await queryRunner.query(`
      ALTER TABLE poi.cronogramas
      ADD COLUMN IF NOT EXISTS aprobado_por_pmo BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS aprobado_por_patrocinador BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS fecha_aprobacion_pmo TIMESTAMP NULL,
      ADD COLUMN IF NOT EXISTS fecha_aprobacion_patrocinador TIMESTAMP NULL,
      ADD COLUMN IF NOT EXISTS comentario_rechazo TEXT NULL
    `);

    console.log('✅ Added cronograma approval fields');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE poi.cronogramas
      DROP COLUMN IF EXISTS aprobado_por_pmo,
      DROP COLUMN IF EXISTS aprobado_por_patrocinador,
      DROP COLUMN IF EXISTS fecha_aprobacion_pmo,
      DROP COLUMN IF EXISTS fecha_aprobacion_patrocinador,
      DROP COLUMN IF EXISTS comentario_rechazo
    `);

    console.log('⬇️ Removed cronograma approval fields');
    // Note: PostgreSQL doesn't support removing enum values easily
  }
}
