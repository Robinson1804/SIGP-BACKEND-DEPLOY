import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../src/modules/auth/entities/usuario.entity';
import { Proyecto } from '../src/modules/poi/proyectos/entities/proyecto.entity';
import { Role } from '../src/common/constants/roles.constant';
import { ProyectoEstado } from '../src/modules/poi/proyectos/enums/proyecto-estado.enum';

describe('Proyectos (e2e)', () => {
  let app: INestApplication<App>;
  let usuarioRepository: Repository<Usuario>;
  let proyectoRepository: Repository<Proyecto>;
  let adminToken: string;
  let pmoToken: string;
  let desarrolladorToken: string;
  let adminUser: Usuario;
  let pmoUser: Usuario;

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
    proyectoRepository = moduleFixture.get<Repository<Proyecto>>(
      getRepositoryToken(Proyecto),
    );

    // Create test users
    adminUser = await createUser('admin@inei.gob.pe', 'admin', Role.ADMIN);
    pmoUser = await createUser('pmo@inei.gob.pe', 'pmo', Role.PMO);
    await createUser('dev@inei.gob.pe', 'dev', Role.DESARROLLADOR);

    // Get tokens
    adminToken = await login('admin@inei.gob.pe');
    pmoToken = await login('pmo@inei.gob.pe');
    desarrolladorToken = await login('dev@inei.gob.pe');
  });

  afterAll(async () => {
    // Cleanup
    await proyectoRepository.delete({});
    await usuarioRepository.delete({ email: 'admin@inei.gob.pe' });
    await usuarioRepository.delete({ email: 'pmo@inei.gob.pe' });
    await usuarioRepository.delete({ email: 'dev@inei.gob.pe' });
    await app.close();
  });

  describe('POST /api/v1/proyectos', () => {
    const createProyectoDto = {
      codigo: 'PRY-E2E-001',
      nombre: 'Proyecto E2E Test',
      descripcion: 'Proyecto de prueba E2E',
      clasificacion: 'Gestion interna',
      accionEstrategicaId: 1,
      coordinadorId: 1,
      scrumMasterId: 1,
      patrocinadorId: 1,
      coordinacion: 'Dirección de TI',
      areasFinancieras: ['1000'],
      montoAnual: 100000,
      anios: [2024],
      fechaInicio: '2024-01-01T00:00:00.000Z',
      fechaFin: '2024-12-31T00:00:00.000Z',
    };

    afterEach(async () => {
      await proyectoRepository.delete({ codigo: createProyectoDto.codigo });
    });

    it('should create proyecto as ADMIN', () => {
      return request(app.getHttpServer())
        .post('/api/v1/proyectos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createProyectoDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.codigo).toBe(createProyectoDto.codigo);
          expect(res.body.nombre).toBe(createProyectoDto.nombre);
          expect(res.body.estado).toBe(ProyectoEstado.PENDIENTE);
        });
    });

    it('should create proyecto as PMO', () => {
      return request(app.getHttpServer())
        .post('/api/v1/proyectos')
        .set('Authorization', `Bearer ${pmoToken}`)
        .send(createProyectoDto)
        .expect(201);
    });

    it('should reject creation as DESARROLLADOR (forbidden)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/proyectos')
        .set('Authorization', `Bearer ${desarrolladorToken}`)
        .send(createProyectoDto)
        .expect(403);
    });

    it('should reject creation without authentication', () => {
      return request(app.getHttpServer())
        .post('/api/v1/proyectos')
        .send(createProyectoDto)
        .expect(401);
    });

    it('should reject duplicate codigo', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/proyectos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createProyectoDto)
        .expect(201);

      return request(app.getHttpServer())
        .post('/api/v1/proyectos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createProyectoDto)
        .expect(409);
    });

    it('should reject invalid dates (fechaFin before fechaInicio)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/proyectos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ...createProyectoDto,
          fechaInicio: '2024-12-31T00:00:00.000Z',
          fechaFin: '2024-01-01T00:00:00.000Z',
        })
        .expect(400);
    });

    it('should reject missing required fields', () => {
      return request(app.getHttpServer())
        .post('/api/v1/proyectos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nombre: 'Proyecto sin código',
        })
        .expect(400);
    });
  });

  describe('GET /api/v1/proyectos', () => {
    let testProyecto: Proyecto;

    beforeAll(async () => {
      testProyecto = await proyectoRepository.save({
        codigo: 'PRY-E2E-GET-001',
        nombre: 'Proyecto para GET',
        descripcion: 'Test',
        clasificacion: 'Gestion interna',
        estado: ProyectoEstado.EN_DESARROLLO,
        coordinadorId: adminUser.id,
        scrumMasterId: pmoUser.id,
        activo: true,
        createdBy: adminUser.id,
        updatedBy: adminUser.id,
      });
    });

    afterAll(async () => {
      await proyectoRepository.delete({ id: testProyecto.id });
    });

    it('should return all proyectos', () => {
      return request(app.getHttpServer())
        .get('/api/v1/proyectos')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });

    it('should filter by estado', () => {
      return request(app.getHttpServer())
        .get('/api/v1/proyectos')
        .query({ estado: ProyectoEstado.EN_DESARROLLO })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          res.body.forEach((proyecto: any) => {
            expect(proyecto.estado).toBe(ProyectoEstado.EN_DESARROLLO);
          });
        });
    });

    it('should filter by activo', () => {
      return request(app.getHttpServer())
        .get('/api/v1/proyectos')
        .query({ activo: true })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          res.body.forEach((proyecto: any) => {
            expect(proyecto.activo).toBe(true);
          });
        });
    });
  });

  describe('GET /api/v1/proyectos/:id', () => {
    let testProyecto: Proyecto;

    beforeAll(async () => {
      testProyecto = await proyectoRepository.save({
        codigo: 'PRY-E2E-GETID-001',
        nombre: 'Proyecto para GET by ID',
        descripcion: 'Test',
        clasificacion: 'Gestion interna',
        estado: ProyectoEstado.EN_DESARROLLO,
        coordinadorId: adminUser.id,
        activo: true,
        createdBy: adminUser.id,
        updatedBy: adminUser.id,
      });
    });

    afterAll(async () => {
      await proyectoRepository.delete({ id: testProyecto.id });
    });

    it('should return proyecto by id', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/proyectos/${testProyecto.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(testProyecto.id);
          expect(res.body.codigo).toBe(testProyecto.codigo);
        });
    });

    it('should return 404 for non-existent proyecto', () => {
      return request(app.getHttpServer())
        .get('/api/v1/proyectos/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('PATCH /api/v1/proyectos/:id', () => {
    let testProyecto: Proyecto;

    beforeEach(async () => {
      testProyecto = await proyectoRepository.save({
        codigo: 'PRY-E2E-PATCH-001',
        nombre: 'Proyecto para PATCH',
        descripcion: 'Test',
        clasificacion: 'Gestion interna',
        estado: ProyectoEstado.EN_DESARROLLO,
        coordinadorId: adminUser.id,
        activo: true,
        createdBy: adminUser.id,
        updatedBy: adminUser.id,
      });
    });

    afterEach(async () => {
      await proyectoRepository.delete({ id: testProyecto.id });
    });

    it('should update proyecto as ADMIN', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/proyectos/${testProyecto.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nombre: 'Proyecto Actualizado',
          descripcion: 'Nueva descripción',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.nombre).toBe('Proyecto Actualizado');
          expect(res.body.descripcion).toBe('Nueva descripción');
        });
    });

    it('should reject update as DESARROLLADOR', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/proyectos/${testProyecto.id}`)
        .set('Authorization', `Bearer ${desarrolladorToken}`)
        .send({ nombre: 'Intento Actualización' })
        .expect(403);
    });
  });

  describe('DELETE /api/v1/proyectos/:id', () => {
    let testProyecto: Proyecto;

    beforeEach(async () => {
      testProyecto = await proyectoRepository.save({
        codigo: 'PRY-E2E-DELETE-001',
        nombre: 'Proyecto para DELETE',
        descripcion: 'Test',
        clasificacion: 'Gestion interna',
        estado: ProyectoEstado.PENDIENTE,
        coordinadorId: adminUser.id,
        activo: true,
        createdBy: adminUser.id,
        updatedBy: adminUser.id,
      });
    });

    it('should soft delete proyecto as ADMIN', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/proyectos/${testProyecto.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const deletedProyecto = await proyectoRepository.findOne({
        where: { id: testProyecto.id },
      });
      expect(deletedProyecto?.activo).toBe(false);

      await proyectoRepository.delete({ id: testProyecto.id });
    });

    it('should reject delete as DESARROLLADOR', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/proyectos/${testProyecto.id}`)
        .set('Authorization', `Bearer ${desarrolladorToken}`)
        .expect(403);
    });

    afterEach(async () => {
      await proyectoRepository.delete({ id: testProyecto.id });
    });
  });
});
