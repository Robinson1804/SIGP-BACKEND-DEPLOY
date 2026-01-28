import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { Usuario } from '../entities/usuario.entity';
import { Sesion } from '../entities/sesion.entity';
import { LoginDto } from '../dto/login.dto';
import { Role } from '../../../common/constants/roles.constant';

describe('AuthService', () => {
  let service: AuthService;
  let usuarioRepository: jest.Mocked<Repository<Usuario>>;
  let sesionRepository: jest.Mocked<Repository<Sesion>>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  const mockUsuario: Partial<Usuario> = {
    id: 1,
    email: 'jperez@inei.gob.pe',
    username: 'jperez',
    nombre: 'Juan',
    apellido: 'Perez',
    rol: Role.DESARROLLADOR,
    activo: true,
    passwordHash: '',
    intentosFallidos: 0,
    bloqueadoHasta: undefined,
    avatarUrl: undefined,
    telefono: undefined,
    ultimoAcceso: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Helper function to create LoginDto
  const createLoginDto = (
    data: Partial<{ email: string; username: string; password: string }>,
  ): LoginDto => {
    const dto = new LoginDto();
    if (data.email) dto.email = data.email;
    if (data.username) dto.username = data.username;
    if (data.password) dto.password = data.password;
    return dto;
  };

  beforeEach(async () => {
    // Hash password for tests
    const hashedPassword = await bcrypt.hash('password123', 10);
    mockUsuario.passwordHash = hashedPassword;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(Usuario),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Sesion),
          useValue: {
            save: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-token'),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('mock-secret'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usuarioRepository = module.get(getRepositoryToken(Usuario));
    sesionRepository = module.get(getRepositoryToken(Sesion));
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should validate user with username', async () => {
      usuarioRepository.findOne.mockResolvedValue(mockUsuario as Usuario);

      const result = await service.validateUser('jperez', 'password123');

      expect(result).toBeTruthy();
      expect(result?.username).toBe('jperez');
      expect(usuarioRepository.findOne).toHaveBeenCalledWith({
        where: [{ email: 'jperez' }, { username: 'jperez' }],
      });
    });

    it('should validate user with email', async () => {
      usuarioRepository.findOne.mockResolvedValue(mockUsuario as Usuario);

      const result = await service.validateUser(
        'jperez@inei.gob.pe',
        'password123',
      );

      expect(result).toBeTruthy();
      expect(result?.email).toBe('jperez@inei.gob.pe');
      expect(usuarioRepository.findOne).toHaveBeenCalledWith({
        where: [
          { email: 'jperez@inei.gob.pe' },
          { username: 'jperez@inei.gob.pe' },
        ],
      });
    });

    it('should reject login with invalid username', async () => {
      usuarioRepository.findOne.mockResolvedValue(null);

      const result = await service.validateUser('noexiste', 'password123');

      expect(result).toBeNull();
    });

    it('should reject login with invalid password', async () => {
      usuarioRepository.findOne.mockResolvedValue(mockUsuario as Usuario);
      usuarioRepository.update.mockResolvedValue({} as any);

      const result = await service.validateUser('jperez', 'wrongpassword');

      expect(result).toBeNull();
      expect(usuarioRepository.update).toHaveBeenCalledWith(1, {
        intentosFallidos: 1,
        bloqueadoHasta: null,
      });
    });

    it('should reject login for inactive user', async () => {
      const inactiveUser = { ...mockUsuario, activo: false };
      usuarioRepository.findOne.mockResolvedValue(inactiveUser as Usuario);

      const result = await service.validateUser('jperez', 'password123');

      expect(result).toBeNull();
    });

    it('should throw error for locked account', async () => {
      const lockedUser = {
        ...mockUsuario,
        bloqueadoHasta: new Date(Date.now() + 15 * 60 * 1000), // 15 min in future
      };
      usuarioRepository.findOne.mockResolvedValue(lockedUser as Usuario);

      await expect(
        service.validateUser('jperez', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    const registerDto = {
      email: 'nuevo@inei.gob.pe',
      username: 'nuevousuario',
      password: 'Password123!',
      nombre: 'Nuevo',
      apellido: 'Usuario',
      rol: Role.DESARROLLADOR,
    };

    it('should reject duplicate username on register', async () => {
      // First call for email check - not found
      usuarioRepository.findOne.mockResolvedValueOnce(null);
      // Second call for username check - found (duplicate)
      usuarioRepository.findOne.mockResolvedValueOnce({
        username: 'nuevousuario',
      } as Usuario);

      await expect(service.register(registerDto)).rejects.toThrow(
        'Username already taken',
      );
    });

    it('should reject duplicate email on register', async () => {
      // First call for email check - found (duplicate)
      usuarioRepository.findOne.mockResolvedValueOnce({
        email: 'nuevo@inei.gob.pe',
      } as Usuario);

      await expect(service.register(registerDto)).rejects.toThrow(
        'Email already registered',
      );
    });

    it('should register user with username successfully', async () => {
      // Email check - not found
      usuarioRepository.findOne.mockResolvedValueOnce(null);
      // Username check - not found
      usuarioRepository.findOne.mockResolvedValueOnce(null);

      // Create user with proper password hash
      const passwordHash = await bcrypt.hash(registerDto.password, 10);
      const newUser = {
        ...mockUsuario,
        email: registerDto.email,
        username: registerDto.username,
        passwordHash,
      };
      usuarioRepository.create.mockReturnValue(newUser as Usuario);
      usuarioRepository.save.mockResolvedValue(newUser as Usuario);

      // Login after register - find user for validateUser (search by email or username)
      usuarioRepository.findOne.mockResolvedValue(newUser as Usuario);
      // Update for resetFailedAttempts after successful login
      usuarioRepository.update.mockResolvedValue({} as any);
      // Save session
      sesionRepository.save.mockResolvedValue({} as any);

      const result = await service.register(registerDto);

      expect(usuarioRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: registerDto.email,
          username: registerDto.username,
        }),
      );
      expect(result).toHaveProperty('accessToken');
      expect(result.user.username).toBe(registerDto.username);
    });
  });

  describe('login', () => {
    it('should login with email successfully', async () => {
      usuarioRepository.findOne.mockResolvedValue(mockUsuario as Usuario);
      usuarioRepository.update.mockResolvedValue({} as any);
      sesionRepository.save.mockResolvedValue({} as any);

      const loginDto = createLoginDto({
        email: 'jperez@inei.gob.pe',
        password: 'password123',
      });
      const result = await service.login(loginDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe('jperez@inei.gob.pe');
      expect(result.user.username).toBe('jperez');
    });

    it('should login with username successfully', async () => {
      usuarioRepository.findOne.mockResolvedValue(mockUsuario as Usuario);
      usuarioRepository.update.mockResolvedValue({} as any);
      sesionRepository.save.mockResolvedValue({} as any);

      const loginDto = createLoginDto({
        username: 'jperez',
        password: 'password123',
      });
      const result = await service.login(loginDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.username).toBe('jperez');
    });

    it('should throw error with invalid credentials', async () => {
      usuarioRepository.findOne.mockResolvedValue(null);

      const loginDto = createLoginDto({
        email: 'noexiste@inei.gob.pe',
        password: 'password123',
      });

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should include username in JWT payload', async () => {
      usuarioRepository.findOne.mockResolvedValue(mockUsuario as Usuario);
      usuarioRepository.update.mockResolvedValue({} as any);
      sesionRepository.save.mockResolvedValue({} as any);

      const loginDto = createLoginDto({
        username: 'jperez',
        password: 'password123',
      });
      await service.login(loginDto);

      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'jperez',
        }),
      );
    });
  });

  describe('refreshToken', () => {
    it('should include username in refreshed token', async () => {
      jwtService.verify.mockReturnValue({
        sub: 1,
        email: 'jperez@inei.gob.pe',
        username: 'jperez',
        rol: Role.DESARROLLADOR,
      });

      await service.refreshToken('valid-refresh-token');

      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'jperez',
        }),
      );
    });
  });
});
