import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../entities/usuario.entity';
import { Sesion } from '../entities/sesion.entity';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { UpdateProfileDto, ProfileResponseDto } from '../dto/update-profile.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Sesion)
    private readonly sesionRepository: Repository<Sesion>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Validar email unico
    const emailExists = await this.usuarioRepository.findOne({
      where: { email: registerDto.email },
    });

    if (emailExists) {
      throw new ConflictException('Email already registered');
    }

    // Validar username unico
    const usernameExists = await this.usuarioRepository.findOne({
      where: { username: registerDto.username },
    });

    if (usernameExists) {
      throw new ConflictException('Username already taken');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const usuario = this.usuarioRepository.create({
      email: registerDto.email,
      username: registerDto.username,
      nombre: registerDto.nombre,
      apellido: registerDto.apellido,
      rol: registerDto.rol,
      telefono: registerDto.telefono,
      passwordHash: hashedPassword,
    });

    await this.usuarioRepository.save(usuario);

    const loginData = new LoginDto();
    loginData.email = usuario.email;
    loginData.password = registerDto.password;
    return this.login(loginData);
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const identifier = loginDto.email || loginDto.username || '';
    const usuario = await this.validateUser(identifier, loginDto.password);

    if (!usuario) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: usuario.id,
      email: usuario.email,
      username: usuario.username,
      rol: usuario.rol,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret')!,
      expiresIn: this.configService.get<string>('jwt.refreshExpiresIn')! as any,
    });

    // Save session
    const tokenHash = await bcrypt.hash(accessToken, 10);
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    await this.sesionRepository.save({
      usuarioId: usuario.id,
      tokenHash,
      refreshTokenHash,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    // Update last access
    await this.usuarioRepository.update(usuario.id, {
      ultimoAcceso: new Date(),
      intentosFallidos: 0,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 86400,
      user: {
        id: usuario.id,
        email: usuario.email,
        username: usuario.username,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        rol: usuario.rol,
        avatarUrl: usuario.avatarUrl,
      },
    };
  }

  async validateUser(
    emailOrUsername: string,
    password: string,
  ): Promise<Usuario | null> {
    // Buscar por email O username
    const usuario = await this.usuarioRepository.findOne({
      where: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });

    if (!usuario || !usuario.activo) {
      return null;
    }

    // Check if account is locked
    if (usuario.bloqueadoHasta && usuario.bloqueadoHasta > new Date()) {
      throw new UnauthorizedException(
        'Account is locked. Please try again later.',
      );
    }

    const isPasswordValid = await bcrypt.compare(password, usuario.passwordHash);

    if (!isPasswordValid) {
      // Increment failed attempts
      await this.usuarioRepository.update(usuario.id, {
        intentosFallidos: usuario.intentosFallidos + 1,
        bloqueadoHasta:
          usuario.intentosFallidos >= 4
            ? new Date(Date.now() + 15 * 60 * 1000) // Lock for 15 minutes
            : null,
      });
      return null;
    }

    return usuario;
  }

  async refreshToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; expiresIn: number }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      const newAccessToken = this.jwtService.sign({
        sub: payload.sub,
        email: payload.email,
        username: payload.username,
        rol: payload.rol,
      });

      return {
        accessToken: newAccessToken,
        expiresIn: 86400,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async changePassword(
    userId: number,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id: userId },
    });

    if (!usuario) {
      throw new BadRequestException('User not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      usuario.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(
      changePasswordDto.newPassword,
      10,
    );

    await this.usuarioRepository.update(userId, {
      passwordHash: hashedNewPassword,
    });
  }

  async logout(userId: number, token: string): Promise<void> {
    const tokenHash = await bcrypt.hash(token, 10);
    await this.sesionRepository.update(
      { usuarioId: userId, tokenHash },
      { revokedAt: new Date() },
    );
  }

  async getProfile(userId: number): Promise<ProfileResponseDto | null> {
    const usuario = await this.usuarioRepository.findOne({ where: { id: userId } });
    if (!usuario) return null;

    return {
      id: usuario.id,
      email: usuario.email,
      username: usuario.username,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      rol: usuario.rol,
      avatarUrl: usuario.avatarUrl,
      telefono: usuario.telefono,
      ultimoAcceso: usuario.ultimoAcceso,
      createdAt: usuario.createdAt,
    };
  }

  async updateProfile(
    userId: number,
    updateProfileDto: UpdateProfileDto,
  ): Promise<ProfileResponseDto> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id: userId },
    });

    if (!usuario) {
      throw new BadRequestException('User not found');
    }

    // Solo actualizar campos proporcionados
    if (updateProfileDto.nombre !== undefined) {
      usuario.nombre = updateProfileDto.nombre;
    }
    if (updateProfileDto.apellido !== undefined) {
      usuario.apellido = updateProfileDto.apellido;
    }
    if (updateProfileDto.telefono !== undefined) {
      usuario.telefono = updateProfileDto.telefono;
    }

    await this.usuarioRepository.save(usuario);

    return {
      id: usuario.id,
      email: usuario.email,
      username: usuario.username,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      rol: usuario.rol,
      avatarUrl: usuario.avatarUrl,
      telefono: usuario.telefono,
      ultimoAcceso: usuario.ultimoAcceso,
      createdAt: usuario.createdAt,
    };
  }

  async updateAvatar(userId: number, avatarUrl: string): Promise<ProfileResponseDto> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id: userId },
    });

    if (!usuario) {
      throw new BadRequestException('User not found');
    }

    usuario.avatarUrl = avatarUrl;
    await this.usuarioRepository.save(usuario);

    return {
      id: usuario.id,
      email: usuario.email,
      username: usuario.username,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      rol: usuario.rol,
      avatarUrl: usuario.avatarUrl,
      telefono: usuario.telefono,
      ultimoAcceso: usuario.ultimoAcceso,
      createdAt: usuario.createdAt,
    };
  }

  async removeAvatar(userId: number): Promise<ProfileResponseDto> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id: userId },
    });

    if (!usuario) {
      throw new BadRequestException('User not found');
    }

    usuario.avatarUrl = null as any;
    await this.usuarioRepository.save(usuario);

    return {
      id: usuario.id,
      email: usuario.email,
      username: usuario.username,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      rol: usuario.rol,
      avatarUrl: usuario.avatarUrl,
      telefono: usuario.telefono,
      ultimoAcceso: usuario.ultimoAcceso,
      createdAt: usuario.createdAt,
    };
  }
}
