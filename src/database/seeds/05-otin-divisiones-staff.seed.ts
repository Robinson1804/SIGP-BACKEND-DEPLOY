import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Seeder } from './seeder.interface';
import { Role } from '../../common/constants/roles.constant';

/**
 * Seed: OTIN Divisions with Coordinators and Scrum Masters
 *
 * Creates the 8 divisions and assigns coordinators/scrum masters
 * According to SIGP organizational structure (Image 19)
 */
export class OTINDivisionesStaffSeed implements Seeder {
  name = 'OTINDivisionesStaffSeed';
  order = 5;

  private divisiones = [
    { codigo: '01-DATOS', nombre: 'Ingenieria de Datos', descripcion: 'Division de Ingenieria de Datos' },
    { codigo: '02-PROCESOS', nombre: 'Procesos y Calidad', descripcion: 'Division de Procesos y Calidad' },
    { codigo: '03-ADM_PROYECTOS', nombre: 'Administracion de Proyectos', descripcion: 'Division de Administracion de Proyectos' },
    { codigo: '04-SEGURIDAD', nombre: 'Seguridad IA y SDMX', descripcion: 'Division de Seguridad IA y SDMX' },
    { codigo: '05-MONITOREO', nombre: 'Monitoreo de Encuestas', descripcion: 'Division de Monitoreo de Encuestas' },
    { codigo: '06-GEOMATICA', nombre: 'Geomatica', descripcion: 'Division de Geomatica' },
    { codigo: '07-INFRAESTRUCTURA', nombre: 'Infraestructura', descripcion: 'Division de Infraestructura' },
    { codigo: '08-SISTEMAS', nombre: 'Sistemas Administrativos', descripcion: 'Division de Sistemas Administrativos' },
  ];

  // Personal: nombre, apellido, email, division_codigo, esCoordinador, esScrumMaster
  private personal = [
    { nombres: 'BERTHA', apellidos: 'ARCONDO', email: 'bertha.arcondo@inei.gob.pe', division: '01-DATOS', esCoordinador: true, esScrumMaster: true },
    { nombres: 'ARLETT', apellidos: 'AGUERO', email: 'arlett.aguero@inei.gob.pe', division: '02-PROCESOS', esCoordinador: true, esScrumMaster: true },
    { nombres: 'EDUARDO', apellidos: 'CORILLA', email: 'eduardo.corilla@inei.gob.pe', division: '03-ADM_PROYECTOS', esCoordinador: true, esScrumMaster: true },
    { nombres: 'ROSMERY', apellidos: 'CONDORY', email: 'rosmery.condory@inei.gob.pe', division: '03-ADM_PROYECTOS', esCoordinador: false, esScrumMaster: true },
    { nombres: 'FLOR', apellidos: 'HUAYHUA', email: 'flor.huayhua@inei.gob.pe', division: '04-SEGURIDAD', esCoordinador: true, esScrumMaster: true },
    { nombres: 'KARINA', apellidos: 'SARAVIA', email: 'karina.saravia@inei.gob.pe', division: '05-MONITOREO', esCoordinador: true, esScrumMaster: true },
    { nombres: 'YIMMY', apellidos: 'ROJAS', email: 'yimmy.rojas@inei.gob.pe', division: '06-GEOMATICA', esCoordinador: true, esScrumMaster: true },
    { nombres: 'MICHAEL', apellidos: 'MALAGA', email: 'michael.malaga@inei.gob.pe', division: '07-INFRAESTRUCTURA', esCoordinador: true, esScrumMaster: true },
    { nombres: 'JUAN', apellidos: 'PADILLA', email: 'juan.padilla@inei.gob.pe', division: '07-INFRAESTRUCTURA', esCoordinador: false, esScrumMaster: true },
    { nombres: 'FERNANDO', apellidos: 'ENCARNACION', email: 'fernando.encarnacion@inei.gob.pe', division: '07-INFRAESTRUCTURA', esCoordinador: false, esScrumMaster: true },
    { nombres: 'JUAN', apellidos: 'GENEROSO', email: 'juan.generoso@inei.gob.pe', division: '07-INFRAESTRUCTURA', esCoordinador: false, esScrumMaster: true },
    { nombres: 'FLOR', apellidos: 'CUBAS', email: 'flor.cubas@inei.gob.pe', division: '08-SISTEMAS', esCoordinador: true, esScrumMaster: true },
  ];

  async run(dataSource: DataSource): Promise<void> {
    const queryRunner = dataSource.createQueryRunner();
    const divisionIdMap: Record<string, number> = {};
    const personalIdMap: Record<string, number> = {};

    try {
      await queryRunner.connect();

      // Get OTIN division as parent (if exists)
      const otinResult = await queryRunner.query(
        `SELECT id FROM rrhh.divisiones WHERE codigo = 'OTIN'`,
      );
      const otinId = otinResult.length > 0 ? otinResult[0].id : null;

      // 1. Create divisions
      console.log('\n  Creating OTIN divisions...');
      for (const div of this.divisiones) {
        const existing = await queryRunner.query(
          `SELECT id FROM rrhh.divisiones WHERE codigo = $1`,
          [div.codigo],
        );

        if (existing.length > 0) {
          divisionIdMap[div.codigo] = existing[0].id;
          console.log(`  → Division '${div.codigo}' already exists (ID: ${existing[0].id})`);
          continue;
        }

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
          [div.codigo, div.nombre, div.descripcion, otinId, true],
        );

        divisionIdMap[div.codigo] = result[0].id;
        console.log(`  → Division '${div.codigo}' created (ID: ${result[0].id})`);
      }

      // 2. Create personal and users
      console.log('\n  Creating personal and users...');
      const hashedPassword = await bcrypt.hash('Password123!', 10);

      for (const person of this.personal) {
        const divisionId = divisionIdMap[person.division];

        // Check if personal exists by email
        const existingPersonal = await queryRunner.query(
          `SELECT id, usuario_id FROM rrhh.personal WHERE email = $1`,
          [person.email],
        );

        let personalId: number;
        let usuarioId: number | null = null;

        if (existingPersonal.length > 0) {
          personalId = existingPersonal[0].id;
          usuarioId = existingPersonal[0].usuario_id;
          console.log(`  → Personal '${person.nombres} ${person.apellidos}' already exists (ID: ${personalId})`);
        } else {
          // Generate unique employee code
          const codigoEmpleado = `EMP-${person.apellidos.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;

          // Create personal
          const personalResult = await queryRunner.query(
            `
            INSERT INTO rrhh.personal (
              codigo_empleado,
              nombres,
              apellidos,
              email,
              division_id,
              modalidad,
              horas_semanales,
              disponible,
              activo,
              created_at,
              updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
            RETURNING id
            `,
            [
              codigoEmpleado,
              person.nombres,
              person.apellidos,
              person.email,
              divisionId,
              'Nombrado',
              40,
              true,
              true,
            ],
          );

          personalId = personalResult[0].id;
          console.log(`  → Personal '${person.nombres} ${person.apellidos}' created (ID: ${personalId})`);
        }

        personalIdMap[person.email] = personalId;

        // Determine role (COORDINADOR > SCRUM_MASTER)
        const role = person.esCoordinador ? Role.COORDINADOR : Role.SCRUM_MASTER;
        const rolesAdicionales = person.esCoordinador && person.esScrumMaster
          ? JSON.stringify([Role.SCRUM_MASTER])
          : '[]';

        // Create user if not exists
        if (!usuarioId) {
          const existingUser = await queryRunner.query(
            `SELECT id FROM public.usuarios WHERE email = $1`,
            [person.email],
          );

          if (existingUser.length > 0) {
            usuarioId = existingUser[0].id;
            console.log(`  → User for '${person.email}' already exists (ID: ${usuarioId})`);
          } else {
            // Generate username
            const username = `${person.nombres.charAt(0).toLowerCase()}${person.apellidos.toLowerCase().replace(/[^a-z]/g, '')}`;

            const userResult = await queryRunner.query(
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
              RETURNING id
              `,
              [
                person.email,
                username,
                hashedPassword,
                person.nombres,
                person.apellidos,
                role,
                rolesAdicionales,
                true,
              ],
            );

            usuarioId = userResult[0].id;
            console.log(`  → User '${username}' created with role ${role} (ID: ${usuarioId})`);
          }

          // Link user to personal
          await queryRunner.query(
            `UPDATE rrhh.personal SET usuario_id = $1 WHERE id = $2`,
            [usuarioId, personalId],
          );
        }
      }

      // 3. Assign coordinators to divisions
      console.log('\n  Assigning coordinators...');
      for (const person of this.personal.filter(p => p.esCoordinador)) {
        const divisionId = divisionIdMap[person.division];
        const personalId = personalIdMap[person.email];

        await queryRunner.query(
          `UPDATE rrhh.divisiones SET coordinador_id = $1 WHERE id = $2`,
          [personalId, divisionId],
        );

        console.log(`  → Assigned '${person.nombres} ${person.apellidos}' as coordinator of '${person.division}'`);
      }

      // 4. Assign scrum masters to divisions
      console.log('\n  Assigning scrum masters...');
      for (const person of this.personal.filter(p => p.esScrumMaster)) {
        const divisionId = divisionIdMap[person.division];
        const personalId = personalIdMap[person.email];

        // Check if already assigned
        const existing = await queryRunner.query(
          `SELECT 1 FROM rrhh.division_scrum_masters WHERE division_id = $1 AND personal_id = $2`,
          [divisionId, personalId],
        );

        if (existing.length > 0) {
          console.log(`  → '${person.nombres} ${person.apellidos}' already assigned as SM to '${person.division}'`);
          continue;
        }

        await queryRunner.query(
          `
          INSERT INTO rrhh.division_scrum_masters (
            division_id,
            personal_id,
            fecha_asignacion,
            activo,
            created_at
          ) VALUES ($1, $2, CURRENT_DATE, true, NOW())
          `,
          [divisionId, personalId],
        );

        console.log(`  → Assigned '${person.nombres} ${person.apellidos}' as SM of '${person.division}'`);
      }

      console.log('\n  OTIN divisions and staff seed completed!');
    } finally {
      await queryRunner.release();
    }
  }

  async revert(dataSource: DataSource): Promise<void> {
    const queryRunner = dataSource.createQueryRunner();

    try {
      await queryRunner.connect();

      // Remove scrum master assignments
      for (const div of this.divisiones) {
        await queryRunner.query(
          `DELETE FROM rrhh.division_scrum_masters WHERE division_id IN (
            SELECT id FROM rrhh.divisiones WHERE codigo = $1
          )`,
          [div.codigo],
        );
      }

      // Remove coordinator assignments
      for (const div of this.divisiones) {
        await queryRunner.query(
          `UPDATE rrhh.divisiones SET coordinador_id = NULL WHERE codigo = $1`,
          [div.codigo],
        );
      }

      // Remove users created for this personal
      for (const person of this.personal) {
        await queryRunner.query(
          `DELETE FROM public.usuarios WHERE email = $1`,
          [person.email],
        );
      }

      // Remove personal
      for (const person of this.personal) {
        await queryRunner.query(
          `DELETE FROM rrhh.personal WHERE email = $1`,
          [person.email],
        );
      }

      // Remove divisions
      for (const div of this.divisiones.reverse()) {
        await queryRunner.query(
          `DELETE FROM rrhh.divisiones WHERE codigo = $1`,
          [div.codigo],
        );
      }

      console.log('  → OTIN divisions and staff removed');
    } finally {
      await queryRunner.release();
    }
  }
}
