/**
 * SIGP - Storage Constants
 * Constantes para el módulo de almacenamiento
 */

// =========================================================================
// MIME TYPES
// =========================================================================

export const MIME_TYPES = {
  // Documentos
  PDF: 'application/pdf',
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  DOC: 'application/msword',
  XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  XLS: 'application/vnd.ms-excel',
  PPTX: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  PPT: 'application/vnd.ms-powerpoint',

  // Imágenes
  JPEG: 'image/jpeg',
  PNG: 'image/png',
  GIF: 'image/gif',
  WEBP: 'image/webp',
  SVG: 'image/svg+xml',
  BMP: 'image/bmp',

  // Archivos comprimidos
  ZIP: 'application/zip',
  RAR: 'application/x-rar-compressed',
  TAR: 'application/x-tar',
  GZIP: 'application/gzip',

  // Otros
  JSON: 'application/json',
  XML: 'application/xml',
  TEXT: 'text/plain',
  CSV: 'text/csv',
  SQL: 'application/sql',
} as const;

// =========================================================================
// EXTENSIONES POR CATEGORÍA
// =========================================================================

export const EXTENSIONS_BY_CATEGORY = {
  documento: ['pdf', 'docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt', 'png', 'jpg', 'jpeg'],
  evidencia: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'zip'],
  acta: ['pdf', 'docx', 'doc'],
  informe: ['pdf', 'xlsx', 'xls'],
  cronograma: ['xlsx', 'xls', 'pdf', 'mpp'],
  avatar: ['jpg', 'jpeg', 'png', 'webp'],
  adjunto: ['pdf', 'docx', 'xlsx', 'jpg', 'jpeg', 'png', 'zip'],
  backup: ['sql', 'zip', 'tar', 'gz'],
} as const;

// =========================================================================
// TAMAÑOS MÁXIMOS (en bytes)
// =========================================================================

export const MAX_FILE_SIZES = {
  documento: 50 * 1024 * 1024, // 50 MB
  evidencia: 25 * 1024 * 1024, // 25 MB
  acta: 50 * 1024 * 1024, // 50 MB
  informe: 50 * 1024 * 1024, // 50 MB
  cronograma: 25 * 1024 * 1024, // 25 MB
  avatar: 2 * 1024 * 1024, // 2 MB
  adjunto: 25 * 1024 * 1024, // 25 MB
  backup: 500 * 1024 * 1024, // 500 MB
} as const;

// =========================================================================
// REDIS KEYS
// =========================================================================

export const REDIS_KEYS = {
  // URLs de descarga cacheadas
  FILE_URL: (id: string) => `file:url:${id}`,

  // Uploads pendientes
  UPLOAD_PENDING: (id: string) => `upload:pending:${id}`,

  // Archivos a eliminar
  FILES_TO_DELETE: 'archivos:pendiente_eliminar',

  // Reportes
  WEEKLY_REPORT: 'storage:weekly-report',

  // Lock para procesamiento
  PROCESSING_LOCK: (id: string) => `processing:lock:${id}`,
} as const;

// =========================================================================
// EVENTOS (para Redis Pub/Sub y WebSocket)
// =========================================================================

export const STORAGE_EVENTS = {
  // Archivo subido exitosamente
  FILE_UPLOADED: 'archivo:uploaded',

  // Archivo eliminado
  FILE_DELETED: 'archivo:deleted',

  // Nueva versión creada
  VERSION_CREATED: 'archivo:version:created',

  // Procesamiento completado
  PROCESSING_COMPLETED: 'archivo:processing:completed',

  // Error en procesamiento
  PROCESSING_FAILED: 'archivo:processing:failed',
} as const;

// =========================================================================
// RUTAS DE OBJECT KEYS
// =========================================================================

export const OBJECT_KEY_TEMPLATES = {
  PROYECTO: (id: number, categoria: string, filename: string) =>
    `proyectos/${id}/${categoria}/${filename}`,

  SUBPROYECTO: (id: number, categoria: string, filename: string) =>
    `subproyectos/${id}/${categoria}/${filename}`,

  ACTIVIDAD: (id: number, categoria: string, filename: string) =>
    `actividades/${id}/${categoria}/${filename}`,

  TAREA: (id: number, filename: string) =>
    `tareas/${id}/${filename}`,

  SUBTAREA: (id: number, filename: string) =>
    `subtareas/${id}/${filename}`,

  USUARIO: (id: number, filename: string) =>
    `usuarios/${id}/${filename}`,

  ACTA_CONSTITUCION: (id: number, filename: string) =>
    `actas/constitucion/${id}/${filename}`,

  ACTA_REUNION: (id: number, filename: string) =>
    `actas/reunion/${id}/${filename}`,

  INFORME_SPRINT: (id: number, filename: string) =>
    `informes/sprint/${id}/${filename}`,

  INFORME_ACTIVIDAD: (id: number, filename: string) =>
    `informes/actividad/${id}/${filename}`,
} as const;

// =========================================================================
// THUMBNAILS
// =========================================================================

export const THUMBNAIL_CONFIG = {
  sizes: {
    small: { width: 100, height: 100 },
    medium: { width: 300, height: 300 },
    large: { width: 600, height: 600 },
  },
  quality: 80,
  format: 'webp' as const,
} as const;

// =========================================================================
// VIRUS SCAN
// =========================================================================

export const VIRUS_SCAN_CONFIG = {
  // Extensiones que siempre se deben escanear
  alwaysScan: ['exe', 'dll', 'bat', 'cmd', 'ps1', 'vbs', 'js', 'jar'],

  // Extensiones seguras (no escanear)
  skipScan: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],

  // Tamaño máximo para escaneo (archivos más grandes se omiten)
  maxScanSize: 100 * 1024 * 1024, // 100 MB
} as const;
