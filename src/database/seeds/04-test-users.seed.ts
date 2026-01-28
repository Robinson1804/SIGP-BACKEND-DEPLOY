import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Seeder } from './seeder.interface';

/**
 * Seed: Create Test Users
 *
 * Creates 7 test users, one for each role in the system
 * All users have the same password: Password123!
 */
export class TestUsersSeed implements Seeder {
  name = 'TestUsersSeed';
  order = 4;

  private readonly testUsers = [
    {
      email: 'admin@inei.gob.pe',
      username: 'cadmin',
      nombre: 'Carlos',
      apellido: 'Administrador',
      rol: 'ADMIN',
      telefono: '987654321',
    },
    {
      email: 'pmo@inei.gob.pe',
      username: 'mpmo',
      nombre: 'María',
      apellido: 'PMO',
      rol: 'PMO',
      telefono: '987654322',
    },
    {
      email: 'coordinador@inei.gob.pe',
      username: 'lcoordinador',
      nombre: 'Luis',
      apellido: 'Coordinador',
      rol: 'COORDINADOR',
      telefono: '987654323',
    },
    {
      email: 'scrummaster@inei.gob.pe',
      username: 'ascrum',
      nombre: 'Ana',
      apellido: 'Scrum',
      rol: 'SCRUM_MASTER',
      telefono: '987654324',
    },
    {
      email: 'patrocinador@inei.gob.pe',
      username: 'jpatrocinador',
      nombre: 'Jorge',
      apellido: 'Patrocinador',
      rol: 'PATROCINADOR',
      telefono: '987654325',
    },
    {
      email: 'desarrollador@inei.gob.pe',
      username: 'pdesarrollador',
      nombre: 'Pedro',
      apellido: 'Desarrollador',
      rol: 'DESARROLLADOR',
      telefono: '987654326',
    },
    {
      email: 'implementador@inei.gob.pe',
      username: 'limplementador',
      nombre: 'Laura',
      apellido: 'Implementadora',
      rol: 'IMPLEMENTADOR',
      telefono: '987654327',
    },
  ];

  async run(dataSource: DataSource): Promise<void> {
    const queryRunner = dataSource.createQueryRunner();

    try {
      await queryRunner.connect();

      // Hash password (same for all test users)
      const passwordHash = await bcrypt.hash('Password123!', 10);

      console.log('  → Creating test users...');

      for (const user of this.testUsers) {
        // Check if user already exists
        const existingUser = await queryRunner.query(
          `SELECT id FROM public.usuarios WHERE email = $1 OR username = $2`,
          [user.email, user.username],
        );

        if (existingUser.length > 0) {
          console.log(`     • ${user.rol} (${user.email}) already exists, skipping...`);
          continue;
        }

        // Insert test user
        await queryRunner.query(
          `
          INSERT INTO public.usuarios (
            email,
            username,
            password_hash,
            nombre,
            apellido,
            rol,
            telefono,
            activo,
            created_at,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
          `,
          [
            user.email,
            user.username,
            passwordHash,
            user.nombre,
            user.apellido,
            user.rol,
            user.telefono,
            true,
          ],
        );

        console.log(`     ✓ ${user.rol.padEnd(15)} → ${user.email.padEnd(30)} (${user.username})`);
      }

      console.log('\n  → Test users summary:');
      console.log('     Password for all users: Password123!');
      console.log(`     Total users created: ${this.testUsers.length}`);
    } finally {
      await queryRunner.release();
    }
  }

  async revert(dataSource: DataSource): Promise<void> {
    const queryRunner = dataSource.createQueryRunner();

    try {
      await queryRunner.connect();

      for (const user of this.testUsers) {
        await queryRunner.query(
          `DELETE FROM public.usuarios WHERE email = $1`,
          [user.email],
        );
      }

      console.log('  → All test users removed');
    } finally {
      await queryRunner.release();
    }
  }
}
