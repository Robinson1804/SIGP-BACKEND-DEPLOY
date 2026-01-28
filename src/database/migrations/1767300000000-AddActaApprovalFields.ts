import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddActaApprovalFields1767300000000 implements MigrationInterface {
  name = 'AddActaApprovalFields1767300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar campos de aprobación dual para Acta de Constitución
    await queryRunner.query(`
      ALTER TABLE poi.actas
      ADD COLUMN IF NOT EXISTS aprobado_por_pmo BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS fecha_aprobacion_pmo TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS aprobado_por_patrocinador BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS fecha_aprobacion_patrocinador TIMESTAMP WITH TIME ZONE
    `);

    console.log('✅ Campos de aprobación dual agregados a tabla actas');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE poi.actas
      DROP COLUMN IF EXISTS aprobado_por_pmo,
      DROP COLUMN IF EXISTS fecha_aprobacion_pmo,
      DROP COLUMN IF EXISTS aprobado_por_patrocinador,
      DROP COLUMN IF EXISTS fecha_aprobacion_patrocinador
    `);
  }
}
