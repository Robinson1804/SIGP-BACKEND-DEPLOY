import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Usuario } from './entities/usuario.entity';
import { Sesion } from './entities/sesion.entity';
import { AuditoriaLog } from './entities/auditoria-log.entity';
import { Configuracion } from './entities/configuracion.entity';
import { Personal } from '../rrhh/personal/entities/personal.entity';
import { AuthService } from './services/auth.service';
import { UsuariosService } from './services/usuarios.service';
import { AuthController } from './controllers/auth.controller';
import { UsuariosController } from './controllers/usuarios.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, Sesion, AuditoriaLog, Configuracion, Personal]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => ({
        secret: config.get<string>('jwt.secret')!,
        signOptions: {
          expiresIn: config.get<string>('jwt.expiresIn')! as any,
        },
      }),
    }),
  ],
  controllers: [AuthController, UsuariosController],
  providers: [AuthService, UsuariosService, JwtStrategy, LocalStrategy],
  exports: [AuthService, UsuariosService],
})
export class AuthModule {}
