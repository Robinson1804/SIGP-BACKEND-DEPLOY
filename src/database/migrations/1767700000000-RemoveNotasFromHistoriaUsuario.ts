import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveNotasFromHistoriaUsuario1767700000000
  implements MigrationInterface
{
  name = 'RemoveNotasFromHistoriaUsuario1767700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop the notas column from historias_usuario table
    await queryRunner.query(`
      ALTER TABLE agile.historias_usuario
      DROP COLUMN IF EXISTS notas;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Re-add the notas column if needed
    await queryRunner.query(`
      ALTER TABLE agile.historias_usuario
      ADD COLUMN notas TEXT NULL;
    `);
  }
}
