import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Seeder } from './seeder.interface';

/**
 * Seed: Create Admin User
 *
 * Creates the default admin user for initial system access
 * Default credentials: admin@sigp.gob.pe / Admin123!
 */
export class AdminUserSeed implements Seeder {
  name = 'AdminUserSeed';
  order = 1;

  async run(dataSource: DataSource): Promise<void> {
    const queryRunner = dataSource.createQueryRunner();

    try {
      await queryRunner.connect();

      // Check if admin already exists (by email or username)
      const existingAdmin = await queryRunner.query(
        `SELECT id FROM public.usuarios WHERE email = $1 OR username = $2`,
        ['admin@sigp.gob.pe', 'admin'],
      );

      if (existingAdmin.length > 0) {
        console.log('  → Admin user already exists, skipping...');
        return;
      }

      // Hash password
      const passwordHash = await bcrypt.hash('Admin123!', 10);

      // Insert admin user
      await queryRunner.query(
        `
        INSERT INTO public.usuarios (
          email,
          username,
          password_hash,
          nombre,
          apellido,
          rol,
          roles_adicionales,
          activo,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        `,
        [
          'admin@sigp.gob.pe',
          'admin',
          passwordHash,
          'Administrador',
          'Sistema',
          'ADMIN',
          '[]',
          true,
        ],
      );

      console.log('  → Admin user created: admin@sigp.gob.pe');
    } finally {
      await queryRunner.release();
    }
  }

  async revert(dataSource: DataSource): Promise<void> {
    const queryRunner = dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.query(
        `DELETE FROM public.usuarios WHERE email = $1`,
        ['admin@sigp.gob.pe'],
      );
      console.log('  → Admin user removed');
    } finally {
      await queryRunner.release();
    }
  }
}
