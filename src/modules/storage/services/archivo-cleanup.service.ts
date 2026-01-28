/**
 * SIGP - Archivo Cleanup Service
 * Servicio para limpieza de archivos huérfanos y expirados
 */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

import { MinioService } from './minio.service';
import { Archivo, ArchivoEstado } from '../entities/archivo.entity';
import {
  ArchivoColaProcesamiento,
  EstadoCola,
} from '../entities/archivo-cola-procesamiento.entity';

@Injectable()
export class ArchivoCleanupService {
  private readonly logger = new Logger(ArchivoCleanupService.name);

  // Días de retención antes de eliminar físicamente
  private readonly RETENTION_DAYS = 30;

  // Días para considerar uploads pendientes como huérfanos
  private readonly PENDING_UPLOAD_HOURS = 24;

  constructor(
    @InjectRepository(Archivo)
    private archivoRepository: Repository<Archivo>,

    @InjectRepository(ArchivoColaProcesamiento)
    private colaRepository: Repository<ArchivoColaProcesamiento>,

    @InjectRedis()
    private redis: Redis,

    private minioService: MinioService,
  ) {}

  /**
   * Ejecutar limpieza de archivos eliminados (diariamente a las 2 AM)
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupDeletedFiles(): Promise<void> {
    this.logger.log('Iniciando limpieza de archivos eliminados...');

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.RETENTION_DAYS);

    try {
      // Buscar archivos eliminados hace más de RETENTION_DAYS días
      const archivosEliminados = await this.archivoRepository.find({
        where: {
          estado: ArchivoEstado.ELIMINADO,
          deletedAt: LessThan(cutoffDate),
        },
      });

      this.logger.log(`Encontrados ${archivosEliminados.length} archivos para eliminar físicamente`);

      let eliminados = 0;
      let errores = 0;

      for (const archivo of archivosEliminados) {
        try {
          // Eliminar de MinIO
          await this.minioService.removeObject(archivo.bucket, archivo.objectKey);

          // Eliminar registro de BD (hard delete)
          await this.archivoRepository.delete(archivo.id);

          eliminados++;
        } catch (error) {
          this.logger.error(`Error eliminando archivo ${archivo.id}:`, error);
          errores++;
        }
      }

      // Limpiar set de Redis
      await this.redis.del('archivos:pendiente_eliminar');

      this.logger.log(
        `Limpieza completada: ${eliminados} eliminados, ${errores} errores`,
      );
    } catch (error) {
      this.logger.error('Error en limpieza de archivos:', error);
    }
  }

  /**
   * Limpiar uploads pendientes/huérfanos (cada 6 horas)
   */
  @Cron(CronExpression.EVERY_6_HOURS)
  async cleanupPendingUploads(): Promise<void> {
    this.logger.log('Limpiando uploads pendientes huérfanos...');

    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - this.PENDING_UPLOAD_HOURS);

    try {
      // Buscar archivos en estado pendiente creados hace más de X horas
      const archivosHuerfanos = await this.archivoRepository.find({
        where: {
          estado: ArchivoEstado.PENDIENTE,
          createdAt: LessThan(cutoffDate),
        },
      });

      this.logger.log(`Encontrados ${archivosHuerfanos.length} uploads huérfanos`);

      for (const archivo of archivosHuerfanos) {
        try {
          // Verificar si existe en MinIO
          const exists = await this.minioService.objectExists(
            archivo.bucket,
            archivo.objectKey,
          );

          if (exists) {
            // Si existe pero nunca se confirmó, eliminar
            await this.minioService.removeObject(archivo.bucket, archivo.objectKey);
          }

          // Eliminar registro de BD
          await this.archivoRepository.delete(archivo.id);

          // Limpiar tracking de Redis
          await this.redis.del(`upload:pending:${archivo.id}`);
        } catch (error) {
          this.logger.error(`Error limpiando upload huérfano ${archivo.id}:`, error);
        }
      }
    } catch (error) {
      this.logger.error('Error en limpieza de uploads pendientes:', error);
    }
  }

  /**
   * Invalidar URLs de descarga expiradas (cada hora)
   */
  @Cron(CronExpression.EVERY_HOUR)
  async invalidateExpiredUrls(): Promise<void> {
    try {
      const result = await this.archivoRepository
        .createQueryBuilder()
        .update(Archivo)
        .set({
          urlDescargaCache: null,
          urlDescargaExpira: null,
        })
        .where('urlDescargaExpira < :now', { now: new Date() })
        .execute();

      if (result.affected && result.affected > 0) {
        this.logger.debug(`${result.affected} URLs de descarga invalidadas`);
      }
    } catch (error) {
      this.logger.error('Error invalidando URLs expiradas:', error);
    }
  }

  /**
   * Reintentar tareas de procesamiento fallidas (cada 30 minutos)
   */
  @Cron(CronExpression.EVERY_30_MINUTES)
  async retryFailedProcessing(): Promise<void> {
    try {
      const tareasFallidas = await this.colaRepository.find({
        where: {
          estado: EstadoCola.ERROR,
        },
      });

      const tareasParaReintentar = tareasFallidas.filter(
        (t) => t.intentos < t.maxIntentos,
      );

      if (tareasParaReintentar.length > 0) {
        await this.colaRepository
          .createQueryBuilder()
          .update(ArchivoColaProcesamiento)
          .set({ estado: EstadoCola.PENDIENTE })
          .whereInIds(tareasParaReintentar.map((t) => t.id))
          .execute();

        this.logger.log(
          `${tareasParaReintentar.length} tareas de procesamiento marcadas para reintento`,
        );
      }
    } catch (error) {
      this.logger.error('Error reintentando tareas fallidas:', error);
    }
  }

  /**
   * Generar reporte de almacenamiento (semanal, lunes a las 6 AM)
   */
  @Cron('0 6 * * 1')
  async generateStorageReport(): Promise<void> {
    this.logger.log('Generando reporte semanal de almacenamiento...');

    try {
      // Estadísticas de BD
      const stats = await this.archivoRepository
        .createQueryBuilder('archivo')
        .select('archivo.bucket', 'bucket')
        .addSelect('COUNT(*)', 'count')
        .addSelect('SUM(archivo.tamanoBytes)', 'totalBytes')
        .where('archivo.deletedAt IS NULL')
        .andWhere('archivo.estado = :estado', { estado: ArchivoEstado.DISPONIBLE })
        .groupBy('archivo.bucket')
        .getRawMany();

      // Estadísticas de MinIO
      const minioStats = await Promise.all(
        Object.values(this.minioService.BUCKETS).map(async (bucket) => {
          const size = await this.minioService.getBucketSize(bucket);
          return { bucket, minioSize: size };
        }),
      );

      // Comparar y detectar discrepancias
      const report = {
        fecha: new Date().toISOString(),
        buckets: stats.map((s) => {
          const minioStat = minioStats.find((m) => m.bucket === s.bucket);
          return {
            bucket: s.bucket,
            archivosEnBD: Number(s.count),
            bytesEnBD: Number(s.totalBytes),
            bytesEnMinIO: minioStat?.minioSize || 0,
            discrepancia: minioStat
              ? Math.abs(Number(s.totalBytes) - minioStat.minioSize)
              : 0,
          };
        }),
      };

      // Guardar reporte en Redis (para consulta)
      await this.redis.setex(
        'storage:weekly-report',
        7 * 24 * 60 * 60, // 7 días
        JSON.stringify(report),
      );

      this.logger.log('Reporte de almacenamiento generado');
    } catch (error) {
      this.logger.error('Error generando reporte de almacenamiento:', error);
    }
  }

  /**
   * Ejecutar limpieza manual (para llamar desde admin)
   */
  async runManualCleanup(): Promise<{
    deletedFiles: number;
    orphanedUploads: number;
    expiredUrls: number;
  }> {
    const results = {
      deletedFiles: 0,
      orphanedUploads: 0,
      expiredUrls: 0,
    };

    // Contar antes de limpiar
    const deletedCount = await this.archivoRepository.count({
      where: { estado: ArchivoEstado.ELIMINADO },
    });

    const orphanedCount = await this.archivoRepository.count({
      where: { estado: ArchivoEstado.PENDIENTE },
    });

    // Ejecutar limpiezas
    await this.cleanupDeletedFiles();
    await this.cleanupPendingUploads();
    await this.invalidateExpiredUrls();

    results.deletedFiles = deletedCount;
    results.orphanedUploads = orphanedCount;

    return results;
  }
}
