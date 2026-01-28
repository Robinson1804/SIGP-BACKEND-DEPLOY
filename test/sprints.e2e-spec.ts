import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../src/modules/auth/entities/usuario.entity';
import { Sprint } from '../src/modules/agile/sprints/entities/sprint.entity';
import { Proyecto } from '../src/modules/poi/proyectos/entities/proyecto.entity';
import { Role } from '../src/common/constants/roles.constant';
import { SprintEstado } from '../src/modules/agile/sprints/enums/sprint.enum';
import { ProyectoEstado } from '../src/modules/poi/proyectos/enums/proyecto-estado.enum';

describe('Sprints (e2e)', () => {
  let app: INestApplication<App>;
  let usuarioRepository: Repository<Usuario>;
  let sprintRepository: Repository<Sprint>;
  let proyectoRepository: Repository<Proyecto>;
  let adminToken: string;
  let scrumMasterToken: string;
  let desarrolladorToken: string;
  let testProyecto: Proyecto;
  let adminUser: Usuario;

  const createUser = async (
    email: string,
    username: string,
    rol: Role,
  ): Promise<Usuario> => {
    const hashedPassword = await bcrypt.hash('Test123!', 10);
    const existingUser = await usuarioRepository.findOne({
      where: [{ email }, { username }],
    });

    if (existingUser) return existingUser;

    return usuarioRepository.save({
      email,
      username,
      passwordHash: hashedPassword,
      nombre: 'Test',
      apellido: 'User',
      rol,
      activo: true,
    });
  };

  const login = async (email: string): Promise<string> => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password: 'Test123!' })
      .expect(200);

    return response.body.accessToken;
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    app.setGlobalPrefix('api/v1');
    await app.init();

    usuarioRepository = moduleFixture.get<Repository<Usuario>>(
      getRepositoryToken(Usuario),
    );
    sprintRepository = moduleFixture.get<Repository<Sprint>>(
      getRepositoryToken(Sprint),
    );
    proyectoRepository = moduleFixture.get<Repository<Proyecto>>(
      getRepositoryToken(Proyecto),
    );

    // Create test users
    adminUser = await createUser('admin-sprint@inei.gob.pe', 'adminsprint', Role.ADMIN);
    await createUser('sm@inei.gob.pe', 'scrummaster', Role.SCRUM_MASTER);
    await createUser('dev-sprint@inei.gob.pe', 'devsprint', Role.DESARROLLADOR);

    // Get tokens
    adminToken = await login('admin-sprint@inei.gob.pe');
    scrumMasterToken = await login('sm@inei.gob.pe');
    desarrolladorToken = await login('dev-sprint@inei.gob.pe');

    // Create test proyecto
    testProyecto = await proyectoRepository.save({
      codigo: 'PRY-SPRINT-E2E',
      nombre: 'Proyecto para Sprints E2E',
      descripcion: 'Proyecto de prueba',
      clasificacion: 'Gestion interna',
      estado: ProyectoEstado.EN_DESARROLLO,
      coordinadorId: adminUser.id,
      activo: true,
      createdBy: adminUser.id,
      updatedBy: adminUser.id,
    });
  });

  afterAll(async () => {
    // Cleanup
    await sprintRepository.delete({ proyectoId: testProyecto.id });
    await proyectoRepository.delete({ id: testProyecto.id });
    await usuarioRepository.delete({ email: 'admin-sprint@inei.gob.pe' });
    await usuarioRepository.delete({ email: 'sm@inei.gob.pe' });
    await usuarioRepository.delete({ email: 'dev-sprint@inei.gob.pe' });
    await app.close();
  });

  describe('POST /api/v1/sprints', () => {
    const createSprintDto = {
      proyectoId: 0, // Will be set in beforeEach
      nombre: 'Sprint E2E Test',
      sprintGoal: 'Completar funcionalidades de prueba',
      fechaInicio: '2024-02-01T00:00:00.000Z',
      fechaFin: '2024-02-15T00:00:00.000Z',
      capacidadEquipo: 40,
    };

    beforeEach(() => {
      createSprintDto.proyectoId = testProyecto.id;
    });

    afterEach(async () => {
      await sprintRepository.delete({ nombre: createSprintDto.nombre });
    });

    it('should create sprint as ADMIN', () => {
      return request(app.getHttpServer())
        .post('/api/v1/sprints')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createSprintDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.nombre).toBe(createSprintDto.nombre);
          expect(res.body.estado).toBe(SprintEstado.PLANIFICADO);
          expect(res.body.proyectoId).toBe(testProyecto.id);
        });
    });

    it('should create sprint as SCRUM_MASTER', () => {
      return request(app.getHttpServer())
        .post('/api/v1/sprints')
        .set('Authorization', `Bearer ${scrumMasterToken}`)
        .send(createSprintDto)
        .expect(201);
    });

    it('should reject creation as DESARROLLADOR', () => {
      return request(app.getHttpServer())
        .post('/api/v1/sprints')
        .set('Authorization', `Bearer ${desarrolladorToken}`)
        .send(createSprintDto)
        .expect(403);
    });

    it('should reject creation without authentication', () => {
      return request(app.getHttpServer())
        .post('/api/v1/sprints')
        .send(createSprintDto)
        .expect(401);
    });

    it('should reject missing required fields', () => {
      return request(app.getHttpServer())
        .post('/api/v1/sprints')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nombre: 'Sprint incompleto',
        })
        .expect(400);
    });
  });

  describe('GET /api/v1/sprints', () => {
    let testSprint: Sprint;

    beforeAll(async () => {
      testSprint = await sprintRepository.save({
        proyectoId: testProyecto.id,
        nombre: 'Sprint GET Test',
        sprintGoal: 'Test objetivo',
        estado: SprintEstado.PLANIFICADO,
        fechaInicio: new Date('2024-03-01'),
        fechaFin: new Date('2024-03-15'),
        capacidadEquipo: 40,
        activo: true,
        createdBy: adminUser.id,
        updatedBy: adminUser.id,
      });
    });

    afterAll(async () => {
      await sprintRepository.delete({ id: testSprint.id });
    });

    it('should return all sprints', () => {
      return request(app.getHttpServer())
        .get('/api/v1/sprints')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });

    it('should filter by proyectoId', () => {
      return request(app.getHttpServer())
        .get('/api/v1/sprints')
        .query({ proyectoId: testProyecto.id })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          res.body.forEach((sprint: any) => {
            expect(sprint.proyectoId).toBe(testProyecto.id);
          });
        });
    });

    it('should filter by estado', () => {
      return request(app.getHttpServer())
        .get('/api/v1/sprints')
        .query({ estado: SprintEstado.PLANIFICADO })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          res.body.forEach((sprint: any) => {
            expect(sprint.estado).toBe(SprintEstado.PLANIFICADO);
          });
        });
    });
  });

  describe('GET /api/v1/sprints/:id', () => {
    let testSprint: Sprint;

    beforeAll(async () => {
      testSprint = await sprintRepository.save({
        proyectoId: testProyecto.id,
        nombre: 'Sprint GET by ID Test',
        sprintGoal: 'Test objetivo',
        estado: SprintEstado.PLANIFICADO,
        fechaInicio: new Date('2024-04-01'),
        fechaFin: new Date('2024-04-15'),
        capacidadEquipo: 40,
        activo: true,
        createdBy: adminUser.id,
        updatedBy: adminUser.id,
      });
    });

    afterAll(async () => {
      await sprintRepository.delete({ id: testSprint.id });
    });

    it('should return sprint by id', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/sprints/${testSprint.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(testSprint.id);
          expect(res.body.nombre).toBe(testSprint.nombre);
        });
    });

    it('should return 404 for non-existent sprint', () => {
      return request(app.getHttpServer())
        .get('/api/v1/sprints/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('PATCH /api/v1/sprints/:id', () => {
    let testSprint: Sprint;

    beforeEach(async () => {
      testSprint = await sprintRepository.save({
        proyectoId: testProyecto.id,
        nombre: 'Sprint PATCH Test',
        sprintGoal: 'Test objetivo',
        estado: SprintEstado.PLANIFICADO,
        fechaInicio: new Date('2024-05-01'),
        fechaFin: new Date('2024-05-15'),
        capacidadEquipo: 40,
        activo: true,
        createdBy: adminUser.id,
        updatedBy: adminUser.id,
      });
    });

    afterEach(async () => {
      await sprintRepository.delete({ id: testSprint.id });
    });

    it('should update sprint as SCRUM_MASTER', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/sprints/${testSprint.id}`)
        .set('Authorization', `Bearer ${scrumMasterToken}`)
        .send({
          nombre: 'Sprint Actualizado',
          sprintGoal: 'Nuevo objetivo',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.nombre).toBe('Sprint Actualizado');
          expect(res.body.sprintGoal).toBe('Nuevo objetivo');
        });
    });

    it('should reject update of completed sprint', async () => {
      testSprint.estado = SprintEstado.COMPLETADO;
      await sprintRepository.save(testSprint);

      return request(app.getHttpServer())
        .patch(`/api/v1/sprints/${testSprint.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nombre: 'Intento Actualización' })
        .expect(400);
    });
  });

  describe('PATCH /api/v1/sprints/:id/iniciar', () => {
    let testSprint: Sprint;

    beforeEach(async () => {
      testSprint = await sprintRepository.save({
        proyectoId: testProyecto.id,
        nombre: 'Sprint INICIAR Test',
        sprintGoal: 'Test objetivo',
        estado: SprintEstado.PLANIFICADO,
        fechaInicio: new Date('2024-06-01'),
        fechaFin: new Date('2024-06-15'),
        capacidadEquipo: 40,
        activo: true,
        createdBy: adminUser.id,
        updatedBy: adminUser.id,
      });
    });

    afterEach(async () => {
      await sprintRepository.delete({ id: testSprint.id });
    });

    it('should start sprint as SCRUM_MASTER', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/sprints/${testSprint.id}/iniciar`)
        .set('Authorization', `Bearer ${scrumMasterToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.estado).toBe(SprintEstado.ACTIVO);
          expect(res.body.fechaInicioReal).toBeDefined();
        });
    });

    it('should reject starting already active sprint', async () => {
      testSprint.estado = SprintEstado.ACTIVO;
      await sprintRepository.save(testSprint);

      return request(app.getHttpServer())
        .patch(`/api/v1/sprints/${testSprint.id}/iniciar`)
        .set('Authorization', `Bearer ${scrumMasterToken}`)
        .expect(400);
    });

    it('should reject starting as DESARROLLADOR', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/sprints/${testSprint.id}/iniciar`)
        .set('Authorization', `Bearer ${desarrolladorToken}`)
        .expect(403);
    });
  });

  describe('PATCH /api/v1/sprints/:id/cerrar', () => {
    let testSprint: Sprint;

    beforeEach(async () => {
      testSprint = await sprintRepository.save({
        proyectoId: testProyecto.id,
        nombre: 'Sprint CERRAR Test',
        sprintGoal: 'Test objetivo',
        estado: SprintEstado.ACTIVO,
        fechaInicio: new Date('2024-07-01'),
        fechaFin: new Date('2024-07-15'),
        capacidadEquipo: 40,
        activo: true,
        createdBy: adminUser.id,
        updatedBy: adminUser.id,
      });
    });

    afterEach(async () => {
      await sprintRepository.delete({ id: testSprint.id });
    });

    it('should close sprint as SCRUM_MASTER', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/sprints/${testSprint.id}/cerrar`)
        .set('Authorization', `Bearer ${scrumMasterToken}`)
        .send({ linkEvidencia: 'https://example.com/evidencia' })
        .expect(200)
        .expect((res) => {
          expect(res.body.estado).toBe(SprintEstado.COMPLETADO);
          expect(res.body.fechaFinReal).toBeDefined();
        });
    });

    it('should reject closing non-active sprint', async () => {
      testSprint.estado = SprintEstado.PLANIFICADO;
      await sprintRepository.save(testSprint);

      return request(app.getHttpServer())
        .patch(`/api/v1/sprints/${testSprint.id}/cerrar`)
        .set('Authorization', `Bearer ${scrumMasterToken}`)
        .send({})
        .expect(400);
    });
  });

  describe('GET /api/v1/sprints/:id/metricas', () => {
    let testSprint: Sprint;

    beforeAll(async () => {
      testSprint = await sprintRepository.save({
        proyectoId: testProyecto.id,
        nombre: 'Sprint METRICAS Test',
        sprintGoal: 'Test objetivo',
        estado: SprintEstado.ACTIVO,
        fechaInicio: new Date('2024-08-01'),
        fechaFin: new Date('2024-08-15'),
        capacidadEquipo: 40,
        activo: true,
        createdBy: adminUser.id,
        updatedBy: adminUser.id,
      });
    });

    afterAll(async () => {
      await sprintRepository.delete({ id: testSprint.id });
    });

    it('should return sprint metrics', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/sprints/${testSprint.id}/metricas`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.sprintId).toBe(testSprint.id);
          expect(res.body.nombre).toBe(testSprint.nombre);
          expect(res.body.diasTotales).toBeDefined();
          expect(res.body.velocidad).toBeDefined();
          expect(res.body.totalHUs).toBeDefined();
        });
    });
  });

  describe('DELETE /api/v1/sprints/:id', () => {
    let testSprint: Sprint;

    beforeEach(async () => {
      testSprint = await sprintRepository.save({
        proyectoId: testProyecto.id,
        nombre: 'Sprint DELETE Test',
        sprintGoal: 'Test objetivo',
        estado: SprintEstado.PLANIFICADO,
        fechaInicio: new Date('2024-09-01'),
        fechaFin: new Date('2024-09-15'),
        capacidadEquipo: 40,
        activo: true,
        createdBy: adminUser.id,
        updatedBy: adminUser.id,
      });
    });

    it('should soft delete sprint as ADMIN', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/sprints/${testSprint.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const deletedSprint = await sprintRepository.findOne({
        where: { id: testSprint.id },
      });
      expect(deletedSprint?.activo).toBe(false);

      await sprintRepository.delete({ id: testSprint.id });
    });

    it('should reject delete of active sprint', async () => {
      testSprint.estado = SprintEstado.ACTIVO;
      await sprintRepository.save(testSprint);

      return request(app.getHttpServer())
        .delete(`/api/v1/sprints/${testSprint.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });

    afterEach(async () => {
      await sprintRepository.delete({ id: testSprint.id });
    });
  });
});
