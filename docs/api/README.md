# SIGP API Documentation

Documentación completa de la API del Sistema Integral de Gestión de Proyectos (SIGP).

## Inicio Rápido

### 1. Configuración Base

```bash
# URL Base
http://localhost:3010/api/v1

# Login
POST /auth/login
{
  "email": "usuario@inei.gob.pe",
  "password": "password123"
}
```

### 2. Usar Token

```bash
# Incluir en cada request
Authorization: Bearer {accessToken}
```

### 3. Hacer tu primer request

```bash
curl -X GET http://localhost:3010/api/v1/proyectos \
  -H "Authorization: Bearer {accessToken}" \
  -H "Content-Type: application/json"
```

---

## Archivos de Documentación

### 1. **OpenAPI Specification** (`openapi.yaml`)
- Especificación completa en formato OpenAPI 3.0
- Importable en Postman, Swagger UI, etc.
- Define todos los endpoints, parámetros, schemas, y respuestas

### 2. **API Reference** (`API_REFERENCE.md`)
- Referencia detallada de TODOS los endpoints
- Ejemplos de requests y responses
- Códigos de error y troubleshooting
- Enums y constantes

### 3. **Integration Guide** (`INTEGRATION_GUIDE.md`)
- Guía completa para integración frontend
- Setup inicial y configuración
- Implementación de autenticación
- Manejo de errores
- Paginación y filtros
- Upload de archivos
- WebSockets
- Testing

### 4. **Authentication Guide** (`AUTHENTICATION.md`)
- Flujos de autenticación detallados
- JWT tokens explicados
- Roles y permisos
- Security best practices
- Troubleshooting de auth

### 5. **Code Examples** (`EXAMPLES.md`)
- Ejemplos en múltiples lenguajes:
  - JavaScript/Fetch
  - JavaScript/Axios
  - TypeScript
  - Python
  - cURL
  - Java
  - C#/.NET

### 6. **Postman Collection** (`POSTMAN_COLLECTION.json`)
- Colección lista para importar en Postman
- Incluye todos los endpoints
- Variables de entorno pre-configuradas
- Ejemplos de request/response

---

## Estructura de la API

### Módulos Principales

```
Auth
├─ Registrarse
├─ Login
├─ Refresh token
├─ Obtener perfil
├─ Cambiar contraseña
└─ Logout

Proyectos (POI)
├─ Listar proyectos
├─ Crear proyecto
├─ Obtener proyecto
├─ Actualizar proyecto
├─ Eliminar proyecto
└─ Cambiar estado

Sprints (Agile)
├─ Listar sprints
├─ Crear sprint
├─ Obtener sprint
├─ Iniciar sprint
├─ Cerrar sprint
├─ Burndown chart
└─ Métricas

Historias de Usuario (Agile)
├─ Listar historias
├─ Crear historia
├─ Obtener historia
├─ Actualizar historia
├─ Cambiar estado
├─ Asignar a sprint
└─ Gestionar dependencias

Tareas (Agile)
├─ Listar tareas
├─ Crear tarea
├─ Obtener tarea
├─ Actualizar tarea
├─ Cambiar estado
└─ Validar tarea

Personal (RRHH)
├─ Listar personal
├─ Crear personal
├─ Obtener personal
├─ Actualizar personal
├─ Gestionar habilidades
└─ Obtener disponibilidad

Archivos (Storage)
├─ Solicitar URL presignada
├─ Confirmar upload
├─ Upload directo
├─ Crear versión
└─ Descargar archivo

Notificaciones
├─ Obtener notificaciones
├─ Marcar como leída
├─ Eliminar notificación
└─ WebSocket en tiempo real

Dashboard
├─ Dashboard general
├─ Dashboard por proyecto
├─ Burndown chart
├─ Velocidad del equipo
└─ Alertas
```

---

## Autenticación

### Token JWT

```json
{
  "sub": 1,
  "email": "usuario@inei.gob.pe",
  "nombre": "Juan",
  "apellido": "Perez",
  "rol": "DESARROLLADOR",
  "iat": 1704067200,
  "exp": 1704070800
}
```

### Tipos de Tokens

- **AccessToken**: Corta vida (1 hora), usado para autenticación
- **RefreshToken**: Larga vida (7 días), usado para renovar AccessToken

### Flujo Básico

```javascript
// 1. Login
POST /auth/login
→ Recibir accessToken + refreshToken

// 2. Usar token
Authorization: Bearer {accessToken}

// 3. Token expira
POST /auth/refresh
→ Recibir nuevo accessToken

// 4. Ambos tokens expiran
POST /auth/login (nuevamente)
```

---

## Roles y Permisos

### Roles Disponibles

- **ADMIN**: Acceso total
- **PMO**: Gestión de programas y proyectos
- **COORDINADOR**: Coordinación de proyectos
- **SCRUM_MASTER**: Gestión ágil
- **PATROCINADOR**: Aprobación y monitoreo
- **DESARROLLADOR**: Desarrollo de tareas
- **IMPLEMENTADOR**: Implementación de actividades

### Matriz de Permisos

Ver `AUTHENTICATION.md` para matriz completa.

---

## Formatos Comunes

### Request Headers

```
Content-Type: application/json
Authorization: Bearer {accessToken}
```

### Response Success (2xx)

```json
{
  "data": { /* resource */ },
  "statusCode": 200,
  "message": "Success"
}
```

### Response Error (4xx/5xx)

```json
{
  "statusCode": 400,
  "message": "Bad Request",
  "error": "Descripción del error"
}
```

---

## Estados de Recursos

### Proyecto

```
Pendiente → En planificacion → En desarrollo → Finalizado
                                ↓
                             Cancelado
```

### Sprint

```
Planificado → Activo → Completado
```

### Historia de Usuario

```
Pendiente → En analisis → Lista → En desarrollo → En pruebas → En revision → Terminada
```

### Tarea

```
Por hacer → En progreso → En revision → Finalizado
```

---

## Paginación

### Query Parameters

```
?page=1&limit=20
```

### Response

```json
{
  "data": [ /* items */ ],
  "total": 100,
  "page": 1,
  "limit": 20,
  "totalPages": 5
}
```

---

## Filtros Comunes

### Proyectos

```
?estado=En%20desarrollo
?coordinadorId=1
?activo=true
```

### Sprints

```
?proyectoId=1
?estado=Activo
```

### Historias de Usuario

```
?proyectoId=1
?estado=En%20desarrollo
?prioridad=Must
?asignadoA=2
```

### Personal

```
?divisionId=1
?modalidad=Planilla
?disponible=true
```

---

## Errores Comunes

### 400 Bad Request

Datos inválidos o malformados. Verifica:
- Tipos de datos
- Campos requeridos
- Validaciones

### 401 Unauthorized

No autenticado. Soluciones:
- Incluir token en Authorization header
- Refrescar token si expiró
- Hacer login nuevamente

### 403 Forbidden

Sin permisos. Soluciones:
- Verificar rol del usuario
- Solicitar permisos al admin
- Usar otra cuenta

### 404 Not Found

Recurso no existe. Soluciones:
- Verificar ID del recurso
- Recurso puede haber sido eliminado

### 409 Conflict

Conflicto (ej: email duplicado). Soluciones:
- Usar datos únicos
- Verificar existencia previa

### 500 Internal Server Error

Error del servidor. Reportar incidente.

---

## Ejemplos Rápidos

### JavaScript/Fetch

```javascript
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

fetch('http://localhost:3010/api/v1/proyectos', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => console.log(data));
```

### Python

```python
import requests

headers = {'Authorization': f'Bearer {token}'}
response = requests.get(
    'http://localhost:3010/api/v1/proyectos',
    headers=headers
)
print(response.json())
```

### cURL

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3010/api/v1/proyectos
```

---

## Tools Recomendadas

### Testing API

- **Postman**: GUI completa, fácil de usar
- **Insomnia**: Similar a Postman, ligero
- **cURL**: CLI, bueno para scripts
- **Thunder Client**: VSCode plugin

### Generación de Código

```bash
# Generar cliente TypeScript desde OpenAPI
npm install -D @openapitools/openapi-generator-cli

npx openapi-generator-cli generate \
  -i docs/api/openapi.yaml \
  -g typescript-axios \
  -o src/api/generated
```

### Documentación Interactiva

- **Swagger UI**: `http://localhost:3010/api/docs`
- **ReDoc**: Para documentación legible

---

## Implementación Frontend

### Checklist

- [ ] Configurar cliente HTTP (Axios/Fetch)
- [ ] Implementar login/registro
- [ ] Guardar tokens de forma segura
- [ ] Agregar interceptores para token
- [ ] Crear servicios para cada módulo
- [ ] Implementar manejo de errores
- [ ] Agregar paginación
- [ ] Implementar filtros
- [ ] Upload de archivos
- [ ] WebSockets para notificaciones
- [ ] Tests unitarios
- [ ] Tests de integración

Ver `INTEGRATION_GUIDE.md` para implementación detallada.

---

## Seguridad

### HTTPS

Siempre usar HTTPS en producción.

### CORS

Backend tiene CORS configurado para orígenes confiables:
- http://localhost:3000 (dev)
- http://localhost:4200 (dev Angular)
- https://sigp.inei.gob.pe (prod)

### Headers

Incluir siempre:
- `Authorization: Bearer {token}`
- `Content-Type: application/json`

### Almacenamiento de Tokens

- Preferencia 1: HttpOnly cookies
- Preferencia 2: Memory + Session storage
- No hacer: localStorage (vulnerable a XSS)

Ver `AUTHENTICATION.md` para más detalles.

---

## Versionado

- **API Version**: 1.0.0
- **Fecha**: 2024-01-20
- **Base URL**: `/api/v1`

Cambios futuros serán en v2 con URL `/api/v2`.

---

## Support

Para reportar bugs o solicitudes:
- Email: api@inei.gob.pe
- GitHub Issues: (si es interno)

---

## Changelog

### v1.0.0 (2024-01-20)

- Autenticación JWT
- Módulo de Proyectos
- Módulo Ágil (Sprints, Historias, Tareas)
- Módulo RRHH
- Gestión de Archivos
- Notificaciones
- Dashboards

---

## Documentación Adicional

- **OpenAPI Spec**: `openapi.yaml`
- **API Reference**: `API_REFERENCE.md`
- **Integration Guide**: `INTEGRATION_GUIDE.md`
- **Authentication**: `AUTHENTICATION.md`
- **Code Examples**: `EXAMPLES.md`
- **Postman**: `POSTMAN_COLLECTION.json`

---

## Acceso Rápido

| Documento | Uso |
|-----------|-----|
| `openapi.yaml` | Importar en Postman/Swagger |
| `API_REFERENCE.md` | Referencia de endpoints |
| `INTEGRATION_GUIDE.md` | Implementación frontend |
| `AUTHENTICATION.md` | Flows de autenticación |
| `EXAMPLES.md` | Código de ejemplo |
| `POSTMAN_COLLECTION.json` | Colección Postman lista |

---

Última actualización: 2024-01-20
