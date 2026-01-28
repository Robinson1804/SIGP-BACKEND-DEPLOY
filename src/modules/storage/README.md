# Storage Module - SIGP

Módulo de NestJS para gestión de archivos con MinIO, PostgreSQL y Redis.

## Estructura del Módulo

```
src/modules/storage/
├── config/
│   └── storage.config.ts       # Configuración del módulo
├── constants/
│   └── storage.constants.ts    # Constantes (MIME types, límites, etc)
├── controllers/
│   ├── archivo.controller.ts   # CRUD y consultas de archivos
│   ├── upload.controller.ts    # Endpoints de subida
│   └── index.ts
├── dto/
│   ├── archivo.dto.ts          # DTOs de archivo
│   ├── upload-request.dto.ts   # DTOs de subida
│   └── index.ts
├── entities/
│   ├── archivo.entity.ts                    # Entidad principal
│   ├── archivo-formato-permitido.entity.ts  # Formatos permitidos
│   ├── archivo-cola-procesamiento.entity.ts # Cola de procesamiento
│   └── index.ts
├── services/
│   ├── minio.service.ts              # Wrapper de MinIO
│   ├── archivo.service.ts            # Lógica de negocio
│   ├── archivo-validation.service.ts # Validación de formatos
│   ├── archivo-cleanup.service.ts    # Limpieza automática
│   └── index.ts
├── storage.module.ts           # Definición del módulo
├── index.ts                    # Exportaciones públicas
├── .env.example                # Variables de entorno
└── README.md                   # Esta documentación
```

## Instalación

### 1. Dependencias

```bash
npm install minio @nestjs-modules/ioredis ioredis uuid
npm install -D @types/multer
```

### 2. Variables de Entorno

Copiar `.env.example` a `.env` y configurar:

```env
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
```

### 3. Importar en AppModule

```typescript
import { StorageModule } from './modules/storage';

@Module({
  imports: [
    StorageModule,
    // ...
  ],
})
export class AppModule {}
```

## API Endpoints

### Subida de Archivos (Flujo Presignado)

**Recomendado para archivos grandes (>10MB)**

```
POST /api/v1/upload/request-url
```

Request:
```json
{
  "entidadTipo": "PROYECTO",
  "entidadId": 1,
  "categoria": "documento",
  "nombreArchivo": "arquitectura.pdf",
  "mimeType": "application/pdf",
  "tamano": 2048576
}
```

Response:
```json
{
  "uploadUrl": "https://minio.../presigned-url",
  "archivoId": "uuid",
  "objectKey": "proyectos/1/documento/uuid.pdf",
  "bucket": "sigp-documentos",
  "expiresIn": 3600,
  "requiredHeaders": {
    "Content-Type": "application/pdf"
  }
}
```

**Confirmar subida:**
```
POST /api/v1/upload/confirm
```

```json
{
  "archivoId": "uuid",
  "checksumMd5": "optional"
}
```

### Subida Directa (Archivos pequeños)

```
POST /api/v1/upload/direct
Content-Type: multipart/form-data

file: [binary]
entidadTipo: PROYECTO
entidadId: 1
categoria: documento
```

### Consultas

```
GET /api/v1/archivos                    # Listar con filtros
GET /api/v1/archivos/:id                # Obtener por ID
GET /api/v1/archivos/:id/download-url   # Obtener URL de descarga
GET /api/v1/archivos/:id/versiones      # Obtener versiones
GET /api/v1/archivos/entidad/:tipo/:id  # Archivos de una entidad
GET /api/v1/archivos/stats              # Estadísticas
GET /api/v1/archivos/formatos           # Formatos permitidos
```

### Modificaciones

```
PATCH  /api/v1/archivos/:id/metadata    # Actualizar metadata
DELETE /api/v1/archivos/:id             # Eliminar (soft)
POST   /api/v1/upload/:id/version       # Nueva versión
```

## Flujo de Integración con Frontend

### Flujo Presignado (Recomendado)

```typescript
// 1. Solicitar URL de subida
const { uploadUrl, archivoId } = await api.post('/upload/request-url', {
  entidadTipo: 'PROYECTO',
  entidadId: 1,
  categoria: 'documento',
  nombreArchivo: file.name,
  mimeType: file.type,
  tamano: file.size,
});

// 2. Subir directo a MinIO
await fetch(uploadUrl, {
  method: 'PUT',
  body: file,
  headers: {
    'Content-Type': file.type,
  },
});

// 3. Confirmar subida
const archivo = await api.post('/upload/confirm', {
  archivoId,
});
```

### Descarga

```typescript
// Obtener URL presignada
const { downloadUrl } = await api.get(`/archivos/${id}/download-url`);

// Descargar
window.open(downloadUrl, '_blank');
```

## Integración con Redis

El módulo usa Redis para:

| Key | Uso | TTL |
|-----|-----|-----|
| `file:url:{id}` | Cache de URLs presignadas | 50 min |
| `upload:pending:{id}` | Tracking de uploads | 1 hora |
| `archivos:pendiente_eliminar` | Set de archivos a eliminar | - |

### Eventos Pub/Sub

```typescript
// Suscribirse a eventos
redis.subscribe('archivo:uploaded', (data) => {
  console.log('Archivo subido:', data);
});
```

## Jobs Programados

| Cron | Función |
|------|---------|
| 2:00 AM diario | Limpiar archivos eliminados (>30 días) |
| Cada 6 horas | Limpiar uploads huérfanos |
| Cada hora | Invalidar URLs expiradas |
| Cada 30 min | Reintentar procesamientos fallidos |
| Lunes 6:00 AM | Generar reporte semanal |

## Validación de Formatos

Los formatos se validan en dos niveles:

1. **En memoria**: Usando `ArchivoValidationService` (rápido)
2. **En BD**: Trigger `trg_archivos_validar_formato` (garantía)

### Formatos por Categoría

| Categoría | Extensiones | Tamaño Máx |
|-----------|-------------|------------|
| documento | pdf, docx, xlsx, pptx | 50 MB |
| evidencia | jpg, png, gif, pdf, zip | 25 MB |
| acta | pdf, docx | 50 MB |
| informe | pdf, xlsx | 50 MB |
| cronograma | xlsx, pdf, mpp | 25 MB |
| avatar | jpg, png, webp | 2 MB |
| adjunto | pdf, docx, xlsx, jpg, zip | 25 MB |
| backup | sql, zip, tar, gz | 500 MB |

## Versionado de Archivos

```typescript
// Crear nueva versión
const nuevaVersion = await archivoService.createVersion(
  archivoOriginalId,
  nuevoArchivo,
  usuarioId,
);

// Obtener todas las versiones
const versiones = await archivoService.getVersiones(archivoId);
```

## Uso en Otros Módulos

```typescript
// Inyectar servicio
constructor(private archivoService: ArchivoService) {}

// Obtener archivos de un proyecto
const archivos = await this.archivoService.findByEntidad(
  ArchivoEntidadTipo.PROYECTO,
  proyectoId,
  ArchivoCategoria.DOCUMENTO,
);
```
