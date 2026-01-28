import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUsernameToUsuarios1734200000000 implements MigrationInterface {
  name = 'AddUsernameToUsuarios1734200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar columna username (nullable inicialmente)
    await queryRunner.query(`
      ALTER TABLE "public"."usuarios"
      ADD COLUMN "username" VARCHAR(100) UNIQUE
    `);

    // Crear indice unico
    await queryRunner.query(`
      CREATE UNIQUE INDEX "idx_usuarios_username"
      ON "public"."usuarios" ("username")
    `);

    // Generar usernames temporales para usuarios existentes (basado en email)
    await queryRunner.query(`
      UPDATE "public"."usuarios"
      SET "username" = SPLIT_PART("email", '@', 1) || '_' || "id"::TEXT
      WHERE "username" IS NULL
    `);

    // Hacer la columna NOT NULL despues de llenar datos
    await queryRunner.query(`
      ALTER TABLE "public"."usuarios"
      ALTER COLUMN "username" SET NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_usuarios_username"`);
    await queryRunner.query(`ALTER TABLE "public"."usuarios" DROP COLUMN "username"`);
  }
}
