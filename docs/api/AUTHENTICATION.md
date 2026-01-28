# SIGP - Authentication Guide

Guía completa sobre autenticación y autorización en la API de SIGP.

## Tabla de Contenidos

1. [Flujo de Autenticación](#flujo-de-autenticación)
2. [JWT Tokens](#jwt-tokens)
3. [Roles y Permisos](#roles-y-permisos)
4. [Endpoints de Auth](#endpoints-de-auth)
5. [Manejo de Tokens](#manejo-de-tokens)
6. [Security Best Practices](#security-best-practices)
7. [Troubleshooting](#troubleshooting)

---

## Flujo de Autenticación

### Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────┐
│                     USUARIOS                                 │
└─────────────────────────────────────────────────────────────┘
                             │
                             ├─ Registrarse (nuevo usuario)
                             ├─ Login (usuario existente)
                             │
                    ┌────────▼──────────┐
                    │   REGISTRO/LOGIN  │
                    └────────┬──────────┘
                             │
                    ┌────────▼──────────────────────────┐
                    │ Validar credenciales              │
                    │ Generar AccessToken + RefreshToken │
                    └────────┬──────────────────────────┘
                             │
                    ┌────────▼──────────┐
                    │  Retornar Tokens  │
                    └────────┬──────────┘
                             │
        ┌────────────────────┴──────────────────────┐
        │                                           │
        │    ┌──────────────────────────────────┐  │
        │    │  AccessToken (corta vida: 1h)   │  │
        │    │  RefreshToken (larga vida: 7d)  │  │
        │    └──────────────────────────────────┘  │
        │                                           │
        ├─ Usar AccessToken en cada request        │
        │    Header: Authorization: Bearer {token}  │
        │                                           │
        ├─ Cuando AccessToken expira:              │
        │    POST /auth/refresh                     │
        │    + RefreshToken nuevo AccessToken      │
        │                                           │
        └─ Cuando RefreshToken expira:             │
             Ir a login nuevamente                  │
```

### Flujo Paso a Paso

1. **Registro** (opcional - puede ser administrador):
   ```
   POST /auth/register
   {
     "email": "nuevo@inei.gob.pe",
     "password": "SecurePassword123",
     "nombre": "Juan",
     "apellido": "Perez",
     "rol": "DESARROLLADOR"
   }
   ```

2. **Login**:
   ```
   POST /auth/login
   {
     "email": "usuario@inei.gob.pe",
     "password": "password123"
   }
   ```

3. **Response**:
   ```json
   {
     "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "expiresIn": 3600,
     "user": {
       "id": 1,
       "email": "usuario@inei.gob.pe",
       "nombre": "Juan",
       "apellido": "Perez",
       "rol": "DESARROLLADOR"
     }
   }
   ```

4. **Usar Token**:
   ```
   GET /api/v1/proyectos
   Headers: Authorization: Bearer {accessToken}
   ```

5. **Refrescar Token** (cuando expire):
   ```
   POST /auth/refresh
   {
     "refreshToken": "{refreshToken}"
   }
   ```

---

## JWT Tokens

### Estructura del JWT

Un JWT tiene 3 partes separadas por puntos: `header.payload.signature`

**Header**:
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload** (AccessToken):
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

**Payload** (RefreshToken):
```json
{
  "sub": 1,
  "type": "refresh",
  "iat": 1704067200,
  "exp": 1711929600
}
```

### Decodificar JWT

En el navegador o herramientas:

```javascript
// En JavaScript
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
const parts = token.split('.');
const payload = JSON.parse(atob(parts[1]));
console.log(payload);
```

En línea: https://jwt.io

### Tiempos de Expiración

```
AccessToken:   1 hora (3600 segundos)
RefreshToken:  7 días (604800 segundos)
```

---

## Roles y Permisos

### Jerarquía de Roles

```
ADMIN (100)
├─ Acceso total al sistema
├─ Crear/eliminar usuarios
├─ Crear/eliminar proyectos
├─ Asignar roles
└─ Acceso a dashboards administrativos

PMO (90)
├─ Gestión de programas y proyectos
├─ Crear sprints
├─ Crear historias de usuario
├─ Ver dashboards
└─ Asignar personal a proyectos

COORDINADOR (80)
├─ Coordinación de proyectos específicos
├─ Crear actividades
├─ Crear tareas
├─ Consultar reportes
└─ Asignar personal

SCRUM_MASTER (70)
├─ Gestión ágil
├─ Crear/cerrar sprints
├─ Gestionar historias de usuario
├─ Daily meetings
└─ Métricas de sprint

PATROCINADOR (60)
├─ Aprobación de proyectos
├─ Consultar estado
└─ Ver reportes

DESARROLLADOR (50)
├─ Crear/actualizar tareas
├─ Comentar en historias
├─ Registrar tiempo
└─ Acceso a personal dashboard

IMPLEMENTADOR (50)
├─ Ejecutar actividades
├─ Reportar avance
└─ Crear documentos
```

### Matriz de Permisos

| Acción | ADMIN | PMO | COORDINADOR | SCRUM_MASTER | PATROCINADOR | DESARROLLADOR | IMPLEMENTADOR |
|--------|:-----:|:---:|:-----------:|:------------:|:------------:|:-------------:|:-------------:|
| Crear Proyecto | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Editar Proyecto | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Crear Sprint | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Crear Historia | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Editar Historia | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Cambiar Estado Historia | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ |
| Crear Tarea | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Cambiar Estado Tarea | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Ver Dashboard General | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Ver Dashboard Proyecto | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Gestionar Personal | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |

### Verificación de Permisos

El backend valida permisos en cada endpoint:

```typescript
// En el controlador
@Post()
@Roles(Role.ADMIN, Role.PMO)  // Solo ADMIN o PMO pueden crear
create(@Body() createDto: CreateProyectoDto) {
  return this.proyectoService.create(createDto);
}
```

Errores de autorización:

```json
{
  "statusCode": 403,
  "message": "Forbidden",
  "error": "Roles insuficientes para esta acción"
}
```

---

## Endpoints de Auth

### POST /auth/register

Registrar nuevo usuario.

**Request**:
```bash
curl -X POST http://localhost:3010/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nuevo@inei.gob.pe",
    "password": "SecurePassword123",
    "nombre": "Juan",
    "apellido": "Perez",
    "rol": "DESARROLLADOR",
    "telefono": "+51999999999"
  }'
```

**Response** (201):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "user": {
    "id": 1,
    "email": "nuevo@inei.gob.pe",
    "nombre": "Juan",
    "apellido": "Perez",
    "rol": "DESARROLLADOR"
  }
}
```

**Errores**:
- 400: Datos inválidos
- 409: Email ya registrado

---

### POST /auth/login

Login con email o username y contrasena. El endpoint acepta **email O username**, pero al menos uno es requerido.

#### Login con Email

**Request**:
```bash
curl -X POST http://localhost:3010/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@inei.gob.pe",
    "password": "password123"
  }'
```

#### Login con Username

**Request**:
```bash
curl -X POST http://localhost:3010/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "jperez",
    "password": "Password123!"
  }'
```

**Response** (200):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "user": {
    "id": 1,
    "email": "usuario@inei.gob.pe",
    "username": "jperez",
    "nombre": "Juan",
    "apellido": "Perez",
    "rol": "DESARROLLADOR"
  }
}
```

#### Login Flexible

El endpoint acepta **email O username**, pero no ambos simultaneamente:

**Valido:**
- `{ "email": "user@example.com", "password": "..." }`
- `{ "username": "jperez", "password": "..." }`

**Invalido:**
- `{ "password": "..." }` (falta identificador)

**Errores**:
- 400: Debe proporcionar email o username
- 401: Credenciales invalidas

---

### POST /auth/refresh

Refrescar access token.

**Request**:
```bash
curl -X POST http://localhost:3010/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

**Response** (200):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "user": { ... }
}
```

**Errores**:
- 401: Refresh token inválido o expirado

---

### GET /auth/profile

Obtener perfil del usuario actual.

**Request**:
```bash
curl -X GET http://localhost:3010/api/v1/auth/profile \
  -H "Authorization: Bearer {accessToken}"
```

**Response** (200):
```json
{
  "id": 1,
  "email": "usuario@inei.gob.pe",
  "nombre": "Juan",
  "apellido": "Perez",
  "rol": "DESARROLLADOR",
  "avatarUrl": "https://..."
}
```

**Errores**:
- 401: No autenticado

---

### PUT /auth/change-password

Cambiar contraseña del usuario.

**Request**:
```bash
curl -X PUT http://localhost:3010/api/v1/auth/change-password \
  -H "Authorization: Bearer {accessToken}" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "oldPassword123",
    "newPassword": "newPassword123"
  }'
```

**Response** (200):
```json
{
  "message": "Password changed successfully"
}
```

**Errores**:
- 400: Contraseña actual incorrecta
- 401: No autenticado

---

### POST /auth/logout

Cerrar sesión del usuario.

**Request**:
```bash
curl -X POST http://localhost:3010/api/v1/auth/logout \
  -H "Authorization: Bearer {accessToken}" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "{accessToken}"
  }'
```

**Response** (200):
```json
{
  "message": "Sesion cerrada correctamente"
}
```

---

## Manejo de Tokens

### Guardar Tokens

**LocalStorage** (simple pero menos seguro):
```javascript
localStorage.setItem('accessToken', token);
localStorage.setItem('refreshToken', refreshToken);
```

**SessionStorage** (se limpia al cerrar navegador):
```javascript
sessionStorage.setItem('accessToken', token);
sessionStorage.setItem('refreshToken', refreshToken);
```

**Memory + Cookies HttpOnly** (recomendado):
```javascript
// Backend configura cookies HttpOnly
// Frontend no necesita guardar tokens manualmente
```

### Recuperar Tokens

```javascript
const accessToken = localStorage.getItem('accessToken');
const refreshToken = localStorage.getItem('refreshToken');
```

### Usar Token en Requests

**Axios**:
```javascript
apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

**Fetch**:
```javascript
fetch(url, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

**cURL**:
```bash
curl -H "Authorization: Bearer $TOKEN" https://api.url/endpoint
```

### Refrescar Token Automáticamente

**Interceptor Axios**:
```typescript
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { accessToken } = await refreshAccessToken();
        localStorage.setItem('accessToken', accessToken);
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (err) {
        // Refresh falló, ir a login
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);
```

### Limpiar Tokens

```javascript
function logout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  // Redirigir a login
  window.location.href = '/login';
}
```

---

## Security Best Practices

### 1. Almacenamiento de Tokens

**NO hacer**:
- ✗ Guardar en localStorage (vulnerable a XSS)
- ✗ Incluir en URL
- ✗ Guardar sin encriptar

**Hacer**:
- ✓ Usar HttpOnly cookies (si es posible)
- ✓ Guardar en memory + sessionStorage (para SPA)
- ✓ Implementar token rotation
- ✓ CORS configuration adecuada

### 2. CORS Configuration

Backend debe permitir solo orígenes confiables:

```typescript
// app.module.ts
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

const corsOptions: CorsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:4200',
    'https://sigp.inei.gob.pe',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.enableCors(corsOptions);
```

### 3. HTTPS en Producción

Siempre usar HTTPS en producción:

```
http://localhost:3010/api/v1     (development)
https://api.sigp.inei.gob.pe/api/v1  (production)
```

### 4. Headers de Seguridad

Backend envía headers de seguridad:

```
Content-Security-Policy: default-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### 5. Contraseñas

**Requisitos mínimos**:
- Al menos 6 caracteres
- Idealmente: 8+ caracteres, mayúsculas, números, símbolos

**No hacer**:
- ✗ Transmitir contraseña sin HTTPS
- ✗ Guardar contraseña en plain text
- ✗ Loguear contraseñas

**Hacer**:
- ✓ Hash con bcrypt (el servidor lo hace)
- ✓ Usar HTTPS siempre
- ✓ Implementar rate limiting en login

### 6. Rate Limiting

En producción, implementar rate limiting:

```
Máximo 5 intentos fallidos de login por IP en 15 minutos
Máximo 100 requests por minuto por usuario
```

### 7. Validación de JWT

El servidor valida:
- Firma del token (HS256)
- Expiración
- Claims (rol, usuario)

### 8. Logout

Asegurar que el logout:
- Invalide el token en el servidor (si usa blacklist)
- Borre cookies
- Limpie memoria en el cliente
- Redirija a login

---

## Troubleshooting

### Error: "401 Unauthorized"

**Causas posibles**:
1. Token no incluido en header
2. Token expirado
3. Token inválido (malformado o corrupto)
4. Servidor rechazó el token

**Solución**:
```javascript
// Verificar token
console.log(localStorage.getItem('accessToken'));

// Refrescar token
POST /auth/refresh { "refreshToken": "..." }

// O hacer login nuevamente
POST /auth/login { "email": "...", "password": "..." }
```

### Error: "403 Forbidden"

**Causa**: Rol de usuario no tiene permisos para esta acción

**Solución**:
- Verificar rol del usuario: `GET /auth/profile`
- Solicitar permisos al administrador
- Usar otra cuenta con rol apropiado

### Token Expirado Constantemente

**Causa**: AccessToken tiene vida corta (1 hora)

**Solución**:
- Implementar refresh automático (interceptor)
- Mostrar advertencia antes de que expire
- Implementar "remember me" con refresh token

### CORS Error al hacer requests

**Error**:
```
Access to XMLHttpRequest at 'http://api...' from origin 'http://localhost:3000'
has been blocked by CORS policy
```

**Soluciones**:
1. Backend debe tener CORS habilitado
2. Frontend debe usar origin correcto
3. Verificar headers CORS en response

```javascript
// Frontend: asegurar que se envían headers correctamente
fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  credentials: 'include'  // Important para cookies
})
```

### Token en URL es inseguro

**NUNCA hacer**:
```
GET /api/v1/proyectos?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Siempre usar Header**:
```
GET /api/v1/proyectos
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Reset de Contraseña

Si el usuario olvida su contraseña:

1. Implementar endpoint de reset (no incluido en esta versión)
2. O contactar al administrador

---

## Resumen

1. **Register/Login** para obtener tokens
2. **Guardar tokens** de forma segura
3. **Incluir AccessToken** en Authorization header
4. **Cuando expire**, usar RefreshToken para obtener uno nuevo
5. **Si RefreshToken expira**, ir a login nuevamente
6. **Al logout**, limpiar tokens y redirigir a login
7. **Roles determinan permisos** - si no tienes permiso, obtienes 403

