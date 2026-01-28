/**
 * SIGP - Storage Configuration
 * Configuración para MinIO, Redis y almacenamiento de archivos
 */

import { registerAs } from '@nestjs/config';

export const storageConfig = registerAs('storage', () => ({
  // MinIO Configuration
  minio: {
    endpoint: process.env.MINIO_ENDPOINT || 'localhost',
    // Public endpoint for browser-accessible URLs (different from internal Docker endpoint)
    publicEndpoint: process.env.MINIO_PUBLIC_ENDPOINT || process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000', 10),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    region: process.env.MINIO_REGION || 'us-east-1',
  },

  // Buckets
  buckets: {
    documentos: process.env.MINIO_BUCKET_DOCUMENTOS || 'sigp-documentos',
    adjuntos: process.env.MINIO_BUCKET_ADJUNTOS || 'sigp-adjuntos',
    avatares: process.env.MINIO_BUCKET_AVATARES || 'sigp-avatares',
    backups: process.env.MINIO_BUCKET_BACKUPS || 'sigp-backups',
  },

  // URLs y TTLs
  presignedUrl: {
    uploadTtl: parseInt(process.env.UPLOAD_URL_TTL || '3600', 10), // 1 hora
    downloadTtl: parseInt(process.env.DOWNLOAD_URL_TTL || '3600', 10), // 1 hora
    cacheTtl: parseInt(process.env.URL_CACHE_TTL || '3000', 10), // 50 min
  },

  // Límites de archivos
  limits: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800', 10), // 50MB
    maxAvatarSize: parseInt(process.env.MAX_AVATAR_SIZE || '2097152', 10), // 2MB
    maxDirectUploadSize: parseInt(process.env.MAX_DIRECT_UPLOAD_SIZE || '10485760', 10), // 10MB
  },

  // Retención y limpieza
  cleanup: {
    retentionDays: parseInt(process.env.FILE_RETENTION_DAYS || '30', 10),
    pendingUploadHours: parseInt(process.env.PENDING_UPLOAD_HOURS || '24', 10),
  },

  // Procesamiento
  processing: {
    enableVirusScan: process.env.ENABLE_VIRUS_SCAN === 'true',
    enableThumbnails: process.env.ENABLE_THUMBNAILS !== 'false',
    maxRetries: parseInt(process.env.PROCESSING_MAX_RETRIES || '3', 10),
  },
}));

export type StorageConfig = ReturnType<typeof storageConfig>;
