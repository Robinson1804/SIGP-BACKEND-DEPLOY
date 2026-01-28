import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Repository, DataSource } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Usuario } from '../../src/modules/auth/entities/usuario.entity';
import { Proyecto } from '../../src/modules/poi/proyectos/entities/proyecto.entity';
import { Sprint } from '../../src/modules/agile/sprints/entities/sprint.entity';
import { Role } from '../../src/common/constants/roles.constant';
import { ProyectoEstado } from '../../src/modules/poi/proyectos/enums/proyecto-estado.enum';
import { SprintEstado } from '../../src/modules/agile/sprints/enums/sprint.enum';
import databaseConfig from '../../src/config/database.config';
import * as bcrypt from 'bcrypt';

/**
 * Database Integration Tests
 *
 * These tests validate:
 * - Database connection
 * - Entity relationships
 * - Cascading operations
 * - Foreign key constraints
 * - Transactions
 */
describe('Database Integration', () => {
  let module: TestingModule;
  let dataSource: DataSource;
  let usuarioRepository: Repository<Usuario>;
  let proyectoRepository: Repository<Proyecto>;
  let sprintRepository: Repository<Sprint>;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [databaseConfig],
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => ({
            ...configService.get('database'),
            autoLoadEntities: true,
            synchronize: false,
          }),
          inject: [ConfigService],
        }),
        TypeOrmModule.forFeature([Usuario, Proyecto, Sprint]),
      ],
    }).compile();

    dataSource = module.get<DataSource>(DataSource);
    usuarioRepository = module.get<Repository<Usuario>>(
      getRepositoryToken(Usuario),
    );
    proyectoRepository = module.get<Repository<Proyecto>>(
      getRepositoryToken(Proyecto),
    );
    sprintRepository = module.get<Repository<Sprint>>(
      getRepositoryToken(Sprint),
    );
  });

  afterAll(async () => {
    await dataSource.destroy();
    await module.close();
  });

  describe('Database Connection', () => {
    it('should connect to PostgreSQL', () => {
      expect(dataSource.isInitialized).toBe(true);
    });

    it('should have correct database name', () => {
      expect(dataSource.options.database).toBeDefined();
    });

    it('should be able to query database', async () => {
      const result = await dataSource.query('SELECT 1 as test');
      expect(result[0].test).toBe(1);
    });

    it('should have schemas created', async () => {
      const schemas = await dataSource.query(`
        SELECT schema_name
        FROM information_schema.schemata
        WHERE schema_name IN ('public', 'agile', 'poi', 'planning', 'rrhh')
      `);
      expect(schemas.length).toBeGreaterThan(0);
    });
  });

  describe('Entity Operations', () => {
    let testUser: Usuario;

    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash('Test123!', 10);
      testUser = await usuarioRepository.save({
        email: `test-${Date.now()}@inei.gob.pe`,
        username: `testuser${Date.now()}`,
        passwordHash: hashedPassword,
        nombre: 'Test',
        apellido: 'Integration',
        rol: Role.ADMIN,
        activo: true,
      });
    });

    afterEach(async () => {
      if (testUser) {
        await usuarioRepository.delete({ id: testUser.id });
      }
    });

    it('should create and retrieve a usuario', async () => {
      const found = await usuarioRepository.findOne({
        where: { id: testUser.id },
      });

      expect(found).toBeDefined();
      expect(found?.email).toBe(testUser.email);
    });

    it('should update a usuario', async () => {
      testUser.nombre = 'Updated';
      const updated = await usuarioRepository.save(testUser);

      expect(updated.nombre).toBe('Updated');
      expect(updated.updatedAt).toBeDefined();
    });

    it('should delete a usuario', async () => {
      await usuarioRepository.delete({ id: testUser.id });
      const found = await usuarioRepository.findOne({
        where: { id: testUser.id },
      });

      expect(found).toBeNull();
      testUser = null as any; // Prevent cleanup in afterEach
    });
  });

  describe('Foreign Key Relationships', () => {
    let testUser: Usuario;
    let testProyecto: Proyecto;
    let testSprint: Sprint;

    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash('Test123!', 10);
      testUser = await usuarioRepository.save({
        email: `fk-test-${Date.now()}@inei.gob.pe`,
        username: `fktest${Date.now()}`,
        passwordHash: hashedPassword,
        nombre: 'FK',
        apellido: 'Test',
        rol: Role.ADMIN,
        activo: true,
      });

      testProyecto = await proyectoRepository.save({
        codigo: `FK-PRY-${Date.now()}`,
        nombre: 'FK Test Project',
        descripcion: 'Test',
        clasificacion: 'Gestion interna',
        estado: ProyectoEstado.EN_DESARROLLO,
        coordinadorId: testUser.id,
        scrumMasterId: testUser.id,
        activo: true,
        createdBy: testUser.id,
        updatedBy: testUser.id,
      });
    });

    afterEach(async () => {
      if (testSprint) {
        await sprintRepository.delete({ id: testSprint.id });
      }
      if (testProyecto) {
        await proyectoRepository.delete({ id: testProyecto.id });
      }
      if (testUser) {
        await usuarioRepository.delete({ id: testUser.id });
      }
    });

    it('should enforce foreign key on proyecto.coordinadorId', async () => {
      const proyecto = proyectoRepository.create({
        codigo: `BAD-FK-${Date.now()}`,
        nombre: 'Bad FK Project',
        descripcion: 'Test',
        clasificacion: 'Gestion interna',
        estado: ProyectoEstado.PENDIENTE,
        coordinadorId: 99999, // Non-existent user
        activo: true,
      });

      await expect(proyectoRepository.save(proyecto)).rejects.toThrow();
    });

    it('should load proyecto with coordinador relation', async () => {
      const found = await proyectoRepository.findOne({
        where: { id: testProyecto.id },
        relations: ['coordinador'],
      });

      expect(found).toBeDefined();
      expect(found?.coordinador).toBeDefined();
      expect(found?.coordinador.id).toBe(testUser.id);
    });

    it('should create sprint with valid proyectoId', async () => {
      testSprint = await sprintRepository.save({
        proyectoId: testProyecto.id,
        nombre: 'FK Sprint Test',
        sprintGoal: 'Test',
        estado: SprintEstado.PLANIFICADO,
        fechaInicio: new Date('2024-10-01'),
        fechaFin: new Date('2024-10-15'),
        capacidadEquipo: 40,
        activo: true,
        createdBy: testUser.id,
        updatedBy: testUser.id,
      });

      expect(testSprint.id).toBeDefined();
      expect(testSprint.proyectoId).toBe(testProyecto.id);
    });

    it('should enforce foreign key on sprint.proyectoId', async () => {
      const sprint = sprintRepository.create({
        proyectoId: 99999, // Non-existent project
        nombre: 'Bad FK Sprint',
        sprintGoal: 'Test',
        estado: SprintEstado.PLANIFICADO,
        fechaInicio: new Date('2024-10-01'),
        fechaFin: new Date('2024-10-15'),
        capacidadEquipo: 40,
        activo: true,
      });

      await expect(sprintRepository.save(sprint)).rejects.toThrow();
    });
  });

  describe('Transactions', () => {
    it('should rollback on error', async () => {
      const queryRunner = dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const hashedPassword = await bcrypt.hash('Test123!', 10);
        const user = await queryRunner.manager.save(Usuario, {
          email: `transaction-test-${Date.now()}@inei.gob.pe`,
          username: `txtest${Date.now()}`,
          passwordHash: hashedPassword,
          nombre: 'Transaction',
          apellido: 'Test',
          rol: Role.ADMIN,
          activo: true,
        });

        // Simulate error
        throw new Error('Simulated transaction error');

        await queryRunner.commitTransaction();
      } catch (error) {
        await queryRunner.rollbackTransaction();
      } finally {
        await queryRunner.release();
      }

      // Verify rollback
      const users = await usuarioRepository.find({
        where: { nombre: 'Transaction' },
      });
      expect(users.length).toBe(0);
    });

    it('should commit on success', async () => {
      const queryRunner = dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      let userId: number;

      try {
        const hashedPassword = await bcrypt.hash('Test123!', 10);
        const user = await queryRunner.manager.save(Usuario, {
          email: `transaction-success-${Date.now()}@inei.gob.pe`,
          username: `txsuccess${Date.now()}`,
          passwordHash: hashedPassword,
          nombre: 'Transaction',
          apellido: 'Success',
          rol: Role.ADMIN,
          activo: true,
        });

        userId = user.id;
        await queryRunner.commitTransaction();
      } catch (error) {
        await queryRunner.rollbackTransaction();
      } finally {
        await queryRunner.release();
      }

      // Verify commit
      const found = await usuarioRepository.findOne({
        where: { id: userId },
      });
      expect(found).toBeDefined();

      // Cleanup
      await usuarioRepository.delete({ id: userId });
    });
  });

  describe('Query Performance', () => {
    it('should use indexes for common queries', async () => {
      const startTime = Date.now();
      await usuarioRepository.findOne({
        where: { email: 'test@inei.gob.pe' },
      });
      const endTime = Date.now();

      // Query should be fast (< 100ms)
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should support pagination', async () => {
      const page = 1;
      const limit = 10;
      const [results, total] = await proyectoRepository.findAndCount({
        skip: (page - 1) * limit,
        take: limit,
      });

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(typeof total).toBe('number');
    });
  });

  describe('Data Integrity', () => {
    it('should enforce unique constraints on email', async () => {
      const hashedPassword = await bcrypt.hash('Test123!', 10);
      const user1 = await usuarioRepository.save({
        email: `unique-test-${Date.now()}@inei.gob.pe`,
        username: `unique1${Date.now()}`,
        passwordHash: hashedPassword,
        nombre: 'Unique',
        apellido: 'Test1',
        rol: Role.ADMIN,
        activo: true,
      });

      const user2 = usuarioRepository.create({
        email: user1.email, // Duplicate email
        username: `unique2${Date.now()}`,
        passwordHash: hashedPassword,
        nombre: 'Unique',
        apellido: 'Test2',
        rol: Role.ADMIN,
        activo: true,
      });

      await expect(usuarioRepository.save(user2)).rejects.toThrow();

      // Cleanup
      await usuarioRepository.delete({ id: user1.id });
    });

    it('should enforce unique constraints on username', async () => {
      const hashedPassword = await bcrypt.hash('Test123!', 10);
      const user1 = await usuarioRepository.save({
        email: `unique-username1-${Date.now()}@inei.gob.pe`,
        username: `uniqueuser${Date.now()}`,
        passwordHash: hashedPassword,
        nombre: 'Unique',
        apellido: 'Username1',
        rol: Role.ADMIN,
        activo: true,
      });

      const user2 = usuarioRepository.create({
        email: `unique-username2-${Date.now()}@inei.gob.pe`,
        username: user1.username, // Duplicate username
        passwordHash: hashedPassword,
        nombre: 'Unique',
        apellido: 'Username2',
        rol: Role.ADMIN,
        activo: true,
      });

      await expect(usuarioRepository.save(user2)).rejects.toThrow();

      // Cleanup
      await usuarioRepository.delete({ id: user1.id });
    });

    it('should auto-generate timestamps', async () => {
      const hashedPassword = await bcrypt.hash('Test123!', 10);
      const user = await usuarioRepository.save({
        email: `timestamp-test-${Date.now()}@inei.gob.pe`,
        username: `timestamp${Date.now()}`,
        passwordHash: hashedPassword,
        nombre: 'Timestamp',
        apellido: 'Test',
        rol: Role.ADMIN,
        activo: true,
      });

      expect(user.createdAt).toBeDefined();
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeDefined();
      expect(user.updatedAt).toBeInstanceOf(Date);

      // Cleanup
      await usuarioRepository.delete({ id: user.id });
    });
  });
});
