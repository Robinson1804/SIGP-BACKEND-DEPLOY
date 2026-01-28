import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Usuario } from '../src/modules/auth/entities/usuario.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from '../src/common/constants/roles.constant';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let usuarioRepository: Repository<Usuario>;

  const testUser = {
    email: 'test@inei.gob.pe',
    username: 'testuser',
    password: 'Test123!',
    nombre: 'Test',
    apellido: 'User',
    rol: Role.DESARROLLADOR,
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

    // Create test user
    const hashedPassword = await bcrypt.hash(testUser.password, 10);
    const existingUser = await usuarioRepository.findOne({
      where: [{ email: testUser.email }, { username: testUser.username }],
    });

    if (!existingUser) {
      await usuarioRepository.save({
        email: testUser.email,
        username: testUser.username,
        passwordHash: hashedPassword,
        nombre: testUser.nombre,
        apellido: testUser.apellido,
        rol: testUser.rol,
        activo: true,
      });
    }
  });

  afterAll(async () => {
    // Cleanup test user
    await usuarioRepository.delete({ email: testUser.email });
    await app.close();
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login with email', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(200)
        .expect((res) => {
          expect(res.body.accessToken).toBeDefined();
          expect(res.body.refreshToken).toBeDefined();
          expect(res.body.user.email).toBe(testUser.email);
          expect(res.body.user.username).toBe(testUser.username);
        });
    });

    it('should login with username', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ username: testUser.username, password: testUser.password })
        .expect(200)
        .expect((res) => {
          expect(res.body.accessToken).toBeDefined();
          expect(res.body.refreshToken).toBeDefined();
          expect(res.body.user.username).toBe(testUser.username);
        });
    });

    it('should reject login without email or username', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ password: testUser.password })
        .expect(400);
    });

    it('should reject login with invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: 'wrongpassword' })
        .expect(401);
    });

    it('should reject login with non-existent username', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ username: 'nonexistentuser', password: testUser.password })
        .expect(401);
    });
  });

  describe('POST /api/v1/auth/register', () => {
    const newUser = {
      email: 'newuser@inei.gob.pe',
      username: 'newuser123',
      password: 'NewUser123!',
      nombre: 'New',
      apellido: 'User',
      rol: Role.DESARROLLADOR,
    };

    afterEach(async () => {
      // Cleanup after each register test
      await usuarioRepository.delete({ email: newUser.email });
    });

    it('should register user with username successfully', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(newUser)
        .expect(201)
        .expect((res) => {
          expect(res.body.accessToken).toBeDefined();
          expect(res.body.user.email).toBe(newUser.email);
          expect(res.body.user.username).toBe(newUser.username);
        });
    });

    it('should reject duplicate email', async () => {
      // First register
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(newUser);

      // Second register with same email
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          ...newUser,
          username: 'differentusername',
        })
        .expect(409);
    });

    it('should reject duplicate username', async () => {
      // First register
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(newUser);

      // Second register with same username
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          ...newUser,
          email: 'different@inei.gob.pe',
        })
        .expect(409);
    });

    it('should reject invalid username format', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          ...newUser,
          username: 'invalid user!@#',
        })
        .expect(400);
    });

    it('should reject username too short', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          ...newUser,
          username: 'ab',
        })
        .expect(400);
    });
  });
});
