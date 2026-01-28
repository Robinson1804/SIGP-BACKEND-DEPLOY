/**
 * SIGP - Archivo Service
 * Servicio principal para gestión de archivos
 * Integra PostgreSQL, MinIO y Redis
 */

import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as crypto from 'crypto';

import { MinioService } from './minio.service';
import { ArchivoValidationService } from './archivo-validation.service';

import {
  Archivo,
  ArchivoEntidadTipo,
  ArchivoCategoria,
  ArchivoEstado,
} from '../entities/archivo.entity';
import { ArchivoColaProcesamiento, TipoProcesamiento, EstadoCola } from '../entities/archivo-cola-procesamiento.entity';

import {
  RequestUploadUrlDto,
  UploadUrlResponseDto,
  ConfirmUploadDto,
} from '../dto/upload-request.dto';
import {
  FilterArchivosDto,
  ArchivoResponseDto,
  ArchivoListResponseDto,
  UpdateArchivoMetadataDto,
  StorageStatsDto,
} from '../dto/archivo.dto';

@Injectable()
export class ArchivoService {
  private readonly logger = new Logger(ArchivoService.name);

  // TTL para URLs presignadas
  private readonly PRESIGNED_URL_TTL = 3600; // 1 hora
  private readonly REDIS_URL_CACHE_TTL = 3000; // 50 minutos

  constructor(
    @InjectRepository(Archivo)
    private archivoRepository: Repository<Archivo>,

    @InjectRepository(ArchivoColaProcesamiento)
    private colaRepository: Repository<ArchivoColaProcesamiento>,

    @InjectRedis()
    private redis: Redis,

    private minioService: MinioService,
    private validationService: ArchivoValidationService,
  ) {}

  // =========================================================================
  // FLUJO DE SUBIDA
  // =========================================================================

  /**
   * PASO 1: Solicitar URL presignada para subida
   */
  async requestUploadUrl(
    dto: RequestUploadUrlDto,
    usuarioId: number,
  ): Promise<UploadUrlResponseDto> {
    // Validar formato y tamaño
    const extension = path.extname(dto.nombreArchivo).toLowerCase().slice(1);
    await this.validationService.validateFormat(extension, dto.categoria, dto.tamano);

    // Generar identificadores únicos
    const archivoId = uuidv4();
    const nombreAlmacenado = `${archivoId}.${extension}`;
    const bucket = this.getBucketPorCategoria(dto.categoria);
    const objectKey = this.generarObjectKey(
      dto.entidadTipo,
      dto.entidadId,
      dto.categoria,
      nombreAlmacenado,
    );

    // Crear registro en BD (estado: pendiente)
    const archivo = this.archivoRepository.create({
      id: archivoId,
      entidadTipo: dto.entidadTipo,
      entidadId: dto.entidadId,
      nombreOriginal: dto.nombreArchivo,
      nombreAlmacenado,
      extension,
      mimeType: dto.mimeType,
      tamanoBytes: dto.tamano,
      bucket,
      objectKey,
      categoria: dto.categoria,
      estado: ArchivoEstado.PENDIENTE,
      esObligatorio: dto.esObligatorio || false,
      metadata: dto.metadata || {},
      createdBy: usuarioId,
    });

    await this.archivoRepository.save(archivo);

    // Generar URL presignada para PUT
    const uploadUrl = await this.minioService.getPresignedPutUrl(
      bucket,
      objectKey,
      this.PRESIGNED_URL_TTL,
    );

    // Guardar en Redis para tracking
    await this.redis.setex(
      `upload:pending:${archivoId}`,
      this.PRESIGNED_URL_TTL + 60,
      JSON.stringify({
        archivoId,
        usuarioId,
        nombreArchivo: dto.nombreArchivo,
        estado: 'esperando_subida',
        createdAt: new Date().toISOString(),
      }),
    );

    this.logger.log(`URL de subida generada para archivo ${archivoId}`);

    return {
      uploadUrl,
      archivoId,
      objectKey,
      bucket,
      expiresIn: this.PRESIGNED_URL_TTL,
      requiredHeaders: {
        'Content-Type': dto.mimeType,
      },
    };
  }

  /**
   * PASO 2: Confirmar subida completada
   */
  async confirmUpload(dto: ConfirmUploadDto, usuarioId: number): Promise<ArchivoResponseDto> {
    const archivo = await this.archivoRepository.findOne({
      where: { id: dto.archivoId },
      relations: ['creador'],
    });

    if (!archivo) {
      throw new NotFoundException(`Archivo no encontrado: ${dto.archivoId}`);
    }

    if (archivo.estado !== ArchivoEstado.PENDIENTE) {
      throw new BadRequestException(`Archivo ya fue procesado: ${archivo.estado}`);
    }

    // Verificar que el archivo existe en MinIO
    try {
      const stat = await this.minioService.statObject(archivo.bucket, archivo.objectKey);

      // Actualizar con metadata real de MinIO
      archivo.tamanoBytes = stat.size;
      archivo.estado = ArchivoEstado.DISPONIBLE;
      archivo.updatedBy = usuarioId;

      // Guardar checksum si está disponible
      if (stat.etag) {
        archivo.checksumMd5 = stat.etag.replace(/"/g, '');
      }
      if (dto.checksumMd5) {
        // Validar si el cliente envió checksum
        if (archivo.checksumMd5 && dto.checksumMd5 !== archivo.checksumMd5) {
          this.logger.warn(`Checksum mismatch para archivo ${dto.archivoId}`);
        }
      }

      await this.archivoRepository.save(archivo);

      // Limpiar tracking de Redis
      await this.redis.del(`upload:pending:${dto.archivoId}`);

      // Agregar a cola de procesamiento
      await this.agregarAColaProcesamiento(archivo);

      // Publicar evento
      await this.redis.publish(
        'archivo:uploaded',
        JSON.stringify({
          archivoId: archivo.id,
          entidadTipo: archivo.entidadTipo,
          entidadId: archivo.entidadId,
          categoria: archivo.categoria,
          usuarioId,
        }),
      );

      this.logger.log(`Archivo confirmado: ${dto.archivoId}`);

      // Generar URL de descarga presignada para incluir en la respuesta
      const downloadUrl = await this.minioService.getPresignedGetUrl(
        archivo.bucket,
        archivo.objectKey,
        this.PRESIGNED_URL_TTL,
      );

      // Guardar en cache para uso futuro
      const cacheKey = `file:url:${archivo.id}`;
      await this.redis.setex(cacheKey, this.REDIS_URL_CACHE_TTL, downloadUrl);

      // Actualizar cache en BD
      await this.archivoRepository.update(archivo.id, {
        urlDescargaCache: downloadUrl,
        urlDescargaExpira: new Date(Date.now() + this.PRESIGNED_URL_TTL * 1000),
      });

      return this.toResponseDto(archivo, downloadUrl);
    } catch (error) {
      this.logger.error(`Error confirmando archivo ${dto.archivoId}:`, error);
      throw new BadRequestException(
        `Archivo no encontrado en almacenamiento. ¿Se completó la subida?`,
      );
    }
  }

  // =========================================================================
  // FLUJO DE DESCARGA
  // =========================================================================

  /**
   * Obtener URL de descarga (con cache en Redis)
   */
  async getDownloadUrl(archivoId: string): Promise<string> {
    // Buscar en cache de Redis
    const cacheKey = `file:url:${archivoId}`;
    const cachedUrl = await this.redis.get(cacheKey);

    if (cachedUrl) {
      return cachedUrl;
    }

    // Buscar archivo en BD
    const archivo = await this.archivoRepository.findOne({
      where: { id: archivoId, estado: ArchivoEstado.DISPONIBLE },
    });

    if (!archivo || archivo.deletedAt) {
      throw new NotFoundException(`Archivo no disponible: ${archivoId}`);
    }

    // Generar URL presignada
    const downloadUrl = await this.minioService.getPresignedGetUrl(
      archivo.bucket,
      archivo.objectKey,
      this.PRESIGNED_URL_TTL,
    );

    // Guardar en cache
    await this.redis.setex(cacheKey, this.REDIS_URL_CACHE_TTL, downloadUrl);

    // Actualizar cache en BD
    await this.archivoRepository.update(archivoId, {
      urlDescargaCache: downloadUrl,
      urlDescargaExpira: new Date(Date.now() + this.PRESIGNED_URL_TTL * 1000),
    });

    return downloadUrl;
  }

  // =========================================================================
  // CRUD OPERATIONS
  // =========================================================================

  /**
   * Obtener archivo por ID
   */
  async findById(archivoId: string): Promise<ArchivoResponseDto> {
    const archivo = await this.archivoRepository.findOne({
      where: { id: archivoId },
      relations: ['creador'],
    });

    if (!archivo) {
      throw new NotFoundException(`Archivo no encontrado: ${archivoId}`);
    }

    return this.toResponseDto(archivo);
  }

  /**
   * Obtener entidad archivo por ID (para uso interno, incluye objectKey)
   */
  async findEntityById(archivoId: string): Promise<Archivo> {
    const archivo = await this.archivoRepository.findOne({
      where: { id: archivoId },
      relations: ['creador'],
    });

    if (!archivo) {
      throw new NotFoundException(`Archivo no encontrado: ${archivoId}`);
    }

    return archivo;
  }

  /**
   * Listar archivos con filtros
   */
  async findAll(filters: FilterArchivosDto): Promise<ArchivoListResponseDto> {
    const query = this.archivoRepository
      .createQueryBuilder('archivo')
      .leftJoinAndSelect('archivo.creador', 'creador');

    // Aplicar filtros
    this.applyFilters(query, filters);

    // Paginación
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const [archivos, total] = await query
      .orderBy('archivo.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: archivos.map((a) => this.toResponseDto(a)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtener archivos de una entidad específica
   */
  async findByEntidad(
    entidadTipo: ArchivoEntidadTipo,
    entidadId: number,
    categoria?: ArchivoCategoria,
  ): Promise<ArchivoResponseDto[]> {
    const query = this.archivoRepository
      .createQueryBuilder('archivo')
      .leftJoinAndSelect('archivo.creador', 'creador')
      .where('archivo.entidadTipo = :entidadTipo', { entidadTipo })
      .andWhere('archivo.entidadId = :entidadId', { entidadId })
      .andWhere('archivo.estado = :estado', { estado: ArchivoEstado.DISPONIBLE })
      .andWhere('archivo.deletedAt IS NULL')
      .andWhere('archivo.esVersionActual = true');

    if (categoria) {
      query.andWhere('archivo.categoria = :categoria', { categoria });
    }

    const archivos = await query.orderBy('archivo.createdAt', 'DESC').getMany();

    return archivos.map((a) => this.toResponseDto(a));
  }

  /**
   * Actualizar metadata de archivo
   */
  async updateMetadata(
    archivoId: string,
    dto: UpdateArchivoMetadataDto,
    usuarioId: number,
  ): Promise<ArchivoResponseDto> {
    const archivo = await this.archivoRepository.findOne({
      where: { id: archivoId },
    });

    if (!archivo) {
      throw new NotFoundException(`Archivo no encontrado: ${archivoId}`);
    }

    if (dto.esPublico !== undefined) {
      archivo.esPublico = dto.esPublico;
    }
    if (dto.esObligatorio !== undefined) {
      archivo.esObligatorio = dto.esObligatorio;
    }
    if (dto.metadata) {
      archivo.metadata = { ...archivo.metadata, ...dto.metadata };
    }

    archivo.updatedBy = usuarioId;
    await this.archivoRepository.save(archivo);

    return this.toResponseDto(archivo);
  }

  /**
   * Eliminar archivo (soft delete)
   */
  async delete(archivoId: string, usuarioId: number): Promise<void> {
    const archivo = await this.archivoRepository.findOne({
      where: { id: archivoId },
    });

    if (!archivo) {
      throw new NotFoundException(`Archivo no encontrado: ${archivoId}`);
    }

    // Soft delete
    await this.archivoRepository.update(archivoId, {
      estado: ArchivoEstado.ELIMINADO,
      deletedAt: new Date(),
      deletedBy: usuarioId,
    });

    // Invalidar cache
    await this.redis.del(`file:url:${archivoId}`);

    // Agregar a set de archivos pendientes de eliminar físicamente
    await this.redis.sadd('archivos:pendiente_eliminar', archivoId);

    this.logger.log(`Archivo eliminado (soft): ${archivoId}`);
  }

  // =========================================================================
  // VERSIONADO
  // =========================================================================

  /**
   * Obtener versiones de un archivo
   */
  async getVersiones(archivoId: string): Promise<ArchivoResponseDto[]> {
    const archivo = await this.archivoRepository.findOne({
      where: { id: archivoId },
    });

    if (!archivo) {
      throw new NotFoundException(`Archivo no encontrado: ${archivoId}`);
    }

    const padreId = archivo.archivoPadreId || archivoId;

    const versiones = await this.archivoRepository
      .createQueryBuilder('archivo')
      .leftJoinAndSelect('archivo.creador', 'creador')
      .where('archivo.id = :padreId OR archivo.archivoPadreId = :padreId', { padreId })
      .andWhere('archivo.deletedAt IS NULL')
      .orderBy('archivo.version', 'DESC')
      .getMany();

    return versiones.map((a) => this.toResponseDto(a));
  }

  /**
   * Crear nueva versión de archivo
   */
  async createVersion(
    archivoOriginalId: string,
    file: Express.Multer.File,
    usuarioId: number,
  ): Promise<ArchivoResponseDto> {
    const original = await this.archivoRepository.findOne({
      where: { id: archivoOriginalId },
    });

    if (!original) {
      throw new NotFoundException(`Archivo original no encontrado: ${archivoOriginalId}`);
    }

    // Validar formato
    const extension = path.extname(file.originalname).toLowerCase().slice(1);
    await this.validationService.validateFormat(extension, original.categoria, file.size);

    // Obtener siguiente versión
    const padreId = original.archivoPadreId || archivoOriginalId;
    const maxVersion = await this.archivoRepository
      .createQueryBuilder('archivo')
      .select('MAX(archivo.version)', 'max')
      .where('archivo.id = :padreId OR archivo.archivoPadreId = :padreId', { padreId })
      .getRawOne();

    const nuevaVersion = (maxVersion?.max || original.version) + 1;

    // Generar nuevo object key
    const nuevoId = uuidv4();
    const nuevoNombreAlmacenado = `${nuevoId}.${extension}`;
    const nuevoObjectKey = this.generarObjectKey(
      original.entidadTipo,
      original.entidadId,
      original.categoria,
      nuevoNombreAlmacenado,
    );

    // Subir a MinIO
    await this.minioService.putObject(
      original.bucket,
      nuevoObjectKey,
      file.buffer,
      file.size,
      { 'Content-Type': file.mimetype },
    );

    // Marcar versiones anteriores como no actuales
    await this.archivoRepository
      .createQueryBuilder()
      .update(Archivo)
      .set({ esVersionActual: false, updatedBy: usuarioId })
      .where('(id = :padreId OR archivoPadreId = :padreId) AND esVersionActual = true', {
        padreId,
      })
      .execute();

    // Crear nuevo registro
    const nuevoArchivo = this.archivoRepository.create({
      id: nuevoId,
      entidadTipo: original.entidadTipo,
      entidadId: original.entidadId,
      nombreOriginal: file.originalname,
      nombreAlmacenado: nuevoNombreAlmacenado,
      extension,
      mimeType: file.mimetype,
      tamanoBytes: file.size,
      bucket: original.bucket,
      objectKey: nuevoObjectKey,
      categoria: original.categoria,
      estado: ArchivoEstado.DISPONIBLE,
      version: nuevaVersion,
      archivoPadreId: padreId,
      esVersionActual: true,
      checksumMd5: crypto.createHash('md5').update(file.buffer).digest('hex'),
      metadata: original.metadata,
      createdBy: usuarioId,
    });

    await this.archivoRepository.save(nuevoArchivo);

    this.logger.log(`Nueva versión creada: ${nuevoId} (v${nuevaVersion})`);

    return this.toResponseDto(nuevoArchivo);
  }

  // =========================================================================
  // ESTADÍSTICAS
  // =========================================================================

  /**
   * Obtener estadísticas de almacenamiento
   */
  async getStorageStats(): Promise<StorageStatsDto> {
    // Total general
    const totalResult = await this.archivoRepository
      .createQueryBuilder('archivo')
      .select('COUNT(*)', 'count')
      .addSelect('COALESCE(SUM(archivo.tamanoBytes), 0)', 'bytes')
      .where('archivo.deletedAt IS NULL')
      .andWhere('archivo.estado = :estado', { estado: ArchivoEstado.DISPONIBLE })
      .getRawOne();

    // Por categoría
    const porCategoria = await this.archivoRepository
      .createQueryBuilder('archivo')
      .select('archivo.categoria', 'categoria')
      .addSelect('COUNT(*)', 'cantidad')
      .addSelect('COALESCE(SUM(archivo.tamanoBytes), 0)', 'bytes')
      .where('archivo.deletedAt IS NULL')
      .andWhere('archivo.estado = :estado', { estado: ArchivoEstado.DISPONIBLE })
      .groupBy('archivo.categoria')
      .getRawMany();

    // Por entidad
    const porEntidad = await this.archivoRepository
      .createQueryBuilder('archivo')
      .select('archivo.entidadTipo', 'entidadTipo')
      .addSelect('COUNT(*)', 'cantidad')
      .addSelect('COALESCE(SUM(archivo.tamanoBytes), 0)', 'bytes')
      .where('archivo.deletedAt IS NULL')
      .andWhere('archivo.estado = :estado', { estado: ArchivoEstado.DISPONIBLE })
      .groupBy('archivo.entidadTipo')
      .getRawMany();

    const totalBytes = Number(totalResult.bytes);

    return {
      totalArchivos: Number(totalResult.count),
      totalBytes,
      totalLegible: this.formatBytes(totalBytes),
      porCategoria: porCategoria.map((r) => ({
        categoria: r.categoria,
        cantidad: Number(r.cantidad),
        bytes: Number(r.bytes),
      })),
      porEntidad: porEntidad.map((r) => ({
        entidadTipo: r.entidadTipo,
        cantidad: Number(r.cantidad),
        bytes: Number(r.bytes),
      })),
    };
  }

  // =========================================================================
  // MÉTODOS AUXILIARES PRIVADOS
  // =========================================================================

  private getBucketPorCategoria(categoria: ArchivoCategoria): string {
    const bucketMap: Record<ArchivoCategoria, string> = {
      [ArchivoCategoria.AVATAR]: this.minioService.BUCKETS.AVATARES,
      [ArchivoCategoria.EVIDENCIA]: this.minioService.BUCKETS.ADJUNTOS,
      [ArchivoCategoria.ADJUNTO]: this.minioService.BUCKETS.ADJUNTOS,
      [ArchivoCategoria.BACKUP]: this.minioService.BUCKETS.BACKUPS,
      [ArchivoCategoria.DOCUMENTO]: this.minioService.BUCKETS.DOCUMENTOS,
      [ArchivoCategoria.ACTA]: this.minioService.BUCKETS.DOCUMENTOS,
      [ArchivoCategoria.INFORME]: this.minioService.BUCKETS.DOCUMENTOS,
      [ArchivoCategoria.CRONOGRAMA]: this.minioService.BUCKETS.DOCUMENTOS,
    };

    return bucketMap[categoria] || this.minioService.BUCKETS.DOCUMENTOS;
  }

  private generarObjectKey(
    entidadTipo: ArchivoEntidadTipo,
    entidadId: number,
    categoria: ArchivoCategoria,
    nombreAlmacenado: string,
  ): string {
    const basePath = entidadTipo.toLowerCase().replace('_', '-');
    return `${basePath}/${entidadId}/${categoria}/${nombreAlmacenado}`;
  }

  private async agregarAColaProcesamiento(archivo: Archivo): Promise<void> {
    const tareas: Partial<ArchivoColaProcesamiento>[] = [];

    // Escaneo de virus (excepto avatares pequeños)
    if (archivo.categoria !== ArchivoCategoria.AVATAR) {
      tareas.push({
        archivoId: archivo.id,
        tipoProcesamiento: TipoProcesamiento.ESCANEO_VIRUS,
        estado: EstadoCola.PENDIENTE,
      });
    }

    // Generar thumbnail para imágenes
    if (archivo.mimeType.startsWith('image/')) {
      tareas.push({
        archivoId: archivo.id,
        tipoProcesamiento: TipoProcesamiento.GENERAR_THUMBNAIL,
        estado: EstadoCola.PENDIENTE,
      });
    }

    // Extraer metadata de PDFs
    if (archivo.mimeType === 'application/pdf') {
      tareas.push({
        archivoId: archivo.id,
        tipoProcesamiento: TipoProcesamiento.EXTRAER_METADATA,
        estado: EstadoCola.PENDIENTE,
      });
    }

    if (tareas.length > 0) {
      await this.colaRepository.save(tareas);
    }
  }

  private applyFilters(
    query: SelectQueryBuilder<Archivo>,
    filters: FilterArchivosDto,
  ): void {
    if (filters.entidadTipo) {
      query.andWhere('archivo.entidadTipo = :entidadTipo', {
        entidadTipo: filters.entidadTipo,
      });
    }

    if (filters.entidadId) {
      query.andWhere('archivo.entidadId = :entidadId', {
        entidadId: filters.entidadId,
      });
    }

    if (filters.categoria) {
      query.andWhere('archivo.categoria = :categoria', {
        categoria: filters.categoria,
      });
    }

    if (filters.estado) {
      query.andWhere('archivo.estado = :estado', { estado: filters.estado });
    } else {
      query.andWhere('archivo.estado = :estado', {
        estado: ArchivoEstado.DISPONIBLE,
      });
    }

    if (filters.soloVersionActual !== false) {
      query.andWhere('archivo.esVersionActual = true');
    }

    if (!filters.incluirEliminados) {
      query.andWhere('archivo.deletedAt IS NULL');
    }
  }

  private toResponseDto(archivo: Archivo, downloadUrl?: string): ArchivoResponseDto {
    return {
      id: archivo.id,
      entidadTipo: archivo.entidadTipo,
      entidadId: archivo.entidadId,
      nombreOriginal: archivo.nombreOriginal,
      extension: archivo.extension,
      mimeType: archivo.mimeType,
      tamanoBytes: Number(archivo.tamanoBytes),
      tamanoLegible: this.formatBytes(Number(archivo.tamanoBytes)),
      categoria: archivo.categoria,
      estado: archivo.estado,
      version: archivo.version,
      esVersionActual: archivo.esVersionActual,
      esPublico: archivo.esPublico,
      downloadUrl: downloadUrl,
      metadata: archivo.metadata,
      createdAt: archivo.createdAt,
      creador: archivo.creador
        ? {
            id: archivo.creador.id,
            nombreCompleto: `${archivo.creador.nombre} ${archivo.creador.apellido}`,
          }
        : undefined,
    };
  }

  private formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
