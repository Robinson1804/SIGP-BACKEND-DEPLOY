import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { Notificacion } from './entities/notificacion.entity';
import { NotificacionService } from './services/notificacion.service';
import { NotificacionController } from './controllers/notificacion.controller';
import { NotificacionesGateway } from './gateways/notificaciones.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notificacion]),
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
  controllers: [NotificacionController],
  providers: [NotificacionService, NotificacionesGateway],
  exports: [NotificacionService, NotificacionesGateway],
})
export class NotificacionesModule {}
