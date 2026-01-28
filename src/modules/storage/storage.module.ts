/**
 * SIGP - Storage Module
 * Módulo para gestión de archivos con MinIO, PostgreSQL y Redis
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

// Entities
import { Archivo } from './entities/archivo.entity';
import { ArchivoFormatoPermitido } from './entities/archivo-formato-permitido.entity';
import { ArchivoColaProcesamiento } from './entities/archivo-cola-procesamiento.entity';

// Services
import { ArchivoService } from './services/archivo.service';
import { MinioService } from './services/minio.service';
import { ArchivoValidationService } from './services/archivo-validation.service';
import { ArchivoCleanupService } from './services/archivo-cleanup.service';

// Controllers
import { ArchivoController } from './controllers/archivo.controller';
import { UploadController } from './controllers/upload.controller';

// Configuration
import { storageConfig } from './config/storage.config';

@Module({
  imports: [
    ConfigModule.forFeature(storageConfig),
    TypeOrmModule.forFeature([
      Archivo,
      ArchivoFormatoPermitido,
      ArchivoColaProcesamiento,
    ]),
  ],
  controllers: [
    ArchivoController,
    UploadController,
  ],
  providers: [
    ArchivoService,
    MinioService,
    ArchivoValidationService,
    ArchivoCleanupService,
  ],
  exports: [
    ArchivoService,
    MinioService,
  ],
})
export class StorageModule {}
