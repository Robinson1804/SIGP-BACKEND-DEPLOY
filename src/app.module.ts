import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { RedisModule } from '@nestjs-modules/ioredis';

// Config imports
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import redisConfig from './config/redis.config';
import appConfig from './config/app.config';

// Module imports
import { CommonModule } from './common/common.module';
import { AuthModule } from './modules/auth/auth.module';
import { PlanningModule } from './modules/planning/planning.module';
import { PoiModule } from './modules/poi/poi.module';
import { AgileModule } from './modules/agile/agile.module';
import { RrhhModule } from './modules/rrhh/rrhh.module';
import { NotificacionesModule } from './modules/notificaciones/notificaciones.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { StorageModule } from './modules/storage/storage.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, redisConfig, appConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // TypeORM
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('database.host'),
        port: config.get('database.port'),
        username: config.get('database.username'),
        password: config.get('database.password'),
        database: config.get('database.database'),
        autoLoadEntities: true,
        synchronize: config.get('database.synchronize'),
        logging: config.get('database.logging'),
        ssl: config.get('database.ssl'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
      }),
    }),

    // Schedule (for cron jobs)
    ScheduleModule.forRoot(),

    // Redis
    RedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'single',
        options: {
          host: config.get('redis.host'),
          port: config.get('redis.port'),
          password: config.get('redis.password') || undefined,
          db: config.get('redis.db'),
          keyPrefix: config.get('redis.keyPrefix'),
        },
      }),
    }),

    // Application modules
    CommonModule,
    AuthModule,
    PlanningModule,
    PoiModule,
    AgileModule,
    RrhhModule,
    NotificacionesModule,
    DashboardModule,
    StorageModule,
  ],
})
export class AppModule {}
