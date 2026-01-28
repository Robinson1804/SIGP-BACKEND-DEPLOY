import { DataSource } from 'typeorm';
import { Seeder } from './seeder.interface';

/**
 * Seed: Divisiones (INEI Structure)
 *
 * Creates the organizational structure for INEI's OTIN
 */
export class DivisionesSeed implements Seeder {
  name = 'DivisionesSeed';
  order = 3;

  private divisiones = [
    // OTIN - Main office
    {
      codigo: 'OTIN',
      nombre: 'Oficina Técnica de Informática',
      descripcion: 'Oficina principal de informática del INEI',
      padre: null,
    },
    // Sub-divisiones de OTIN
    {
      codigo: 'OTIN-DES',
      nombre: 'División de Desarrollo de Sistemas',
      descripcion: 'Desarrollo y mantenimiento de sistemas informáticos',
      padre: 'OTIN',
    },
    {
      codigo: 'OTIN-INF',
      nombre: 'División de Infraestructura',
      descripcion: 'Gestión de infraestructura y redes',
      padre: 'OTIN',
    },
    {
      codigo: 'OTIN-SOP',
      nombre: 'División de Soporte Técnico',
      descripcion: 'Soporte técnico a usuarios',
      padre: 'OTIN',
    },
    {
      codigo: 'OTIN-SEG',
      nombre: 'División de Seguridad Informática',
      descripcion: 'Seguridad de la información',
      padre: 'OTIN',
    },
    {
      codigo: 'OTIN-BD',
      nombre: 'División de Base de Datos',
      descripcion: 'Administración de bases de datos',
      padre: 'OTIN',
    },
    // Equipos dentro de Desarrollo
    {
      codigo: 'OTIN-DES-WEB',
      nombre: 'Equipo de Desarrollo Web',
      descripcion: 'Desarrollo de aplicaciones web',
      padre: 'OTIN-DES',
    },
    {
      codigo: 'OTIN-DES-MOV',
      nombre: 'Equipo de Desarrollo Móvil',
      descripcion: 'Desarrollo de aplicaciones móviles',
      padre: 'OTIN-DES',
    },
    {
      codigo: 'OTIN-DES-BI',
      nombre: 'Equipo de Business Intelligence',
      descripcion: 'Desarrollo de soluciones de BI',
      padre: 'OTIN-DES',
    },
  ];

  async run(dataSource: DataSource): Promise<void> {
    const queryRunner = dataSource.createQueryRunner();
    const divisionIdMap: Record<string, number> = {};

    try {
      await queryRunner.connect();

      for (const div of this.divisiones) {
        // Check if division exists
        const existing = await queryRunner.query(
          `SELECT id FROM rrhh.divisiones WHERE codigo = $1`,
          [div.codigo],
        );

        if (existing.length > 0) {
          divisionIdMap[div.codigo] = existing[0].id;
          console.log(`  → División '${div.codigo}' already exists, skipping...`);
          continue;
        }

        // Get parent ID
        const padreId = div.padre ? divisionIdMap[div.padre] : null;

        // Insert division
        const result = await queryRunner.query(
          `
          INSERT INTO rrhh.divisiones (
            codigo,
            nombre,
            descripcion,
            division_padre_id,
            activo,
            created_at,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
          RETURNING id
          `,
          [div.codigo, div.nombre, div.descripcion, padreId, true],
        );

        divisionIdMap[div.codigo] = result[0].id;
        console.log(`  → División '${div.codigo}' created (ID: ${result[0].id})`);
      }
    } finally {
      await queryRunner.release();
    }
  }

  async revert(dataSource: DataSource): Promise<void> {
    const queryRunner = dataSource.createQueryRunner();

    try {
      await queryRunner.connect();

      // Delete in reverse order to respect FK constraints
      const reversedDivisiones = [...this.divisiones].reverse();

      for (const div of reversedDivisiones) {
        await queryRunner.query(
          `DELETE FROM rrhh.divisiones WHERE codigo = $1`,
          [div.codigo],
        );
      }

      console.log('  → Divisiones removed');
    } finally {
      await queryRunner.release();
    }
  }
}
