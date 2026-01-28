# SIGP API - Quick Start Guide

Comienza a consumir la API en 5 minutos.

## 1. Obtener Access Token

Puedes autenticarte usando **email** o **username**. Ambas opciones son validas.

### Opcion A: cURL con Email

```bash
curl -X POST http://localhost:3010/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@inei.gob.pe",
    "password": "password123"
  }' | jq '.'
```

### Opcion B: cURL con Username

```bash
curl -X POST http://localhost:3010/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "jperez",
    "password": "Password123!"
  }' | jq '.'
```

**Response**:
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

**Guardar token**:
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Opcion C: Postman

1. Abre Postman
2. New -> HTTP Request
3. Metodo: POST
4. URL: `http://localhost:3010/api/v1/auth/login`
5. Tab "Headers" -> Add `Content-Type: application/json`
6. Tab "Body" -> Select "raw" (JSON) -> Pega (con email o username):
```json
{
  "email": "usuario@inei.gob.pe",
  "password": "password123"
}
```
o
```json
{
  "username": "jperez",
  "password": "Password123!"
}
```
7. Click "Send"
8. Copia el valor de `accessToken`

---

## 2. Hacer tu Primer Request

### Opción A: cURL

```bash
curl -X GET http://localhost:3010/api/v1/proyectos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
```

### Opción B: Postman

1. New → HTTP Request
2. Método: GET
3. URL: `http://localhost:3010/api/v1/proyectos`
4. Tab "Headers":
   - `Authorization: Bearer {token}`
   - `Content-Type: application/json`
5. Click "Send"

### Opción C: JavaScript/Node.js

```javascript
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

fetch("http://localhost:3010/api/v1/proyectos", {
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  }
})
.then(r => r.json())
.then(data => console.log(data));
```

### Opción D: Python

```python
import requests

token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
headers = {"Authorization": f"Bearer {token}"}
response = requests.get(
    "http://localhost:3010/api/v1/proyectos",
    headers=headers
)
print(response.json())
```

---

## 3. Crear un Proyecto

### cURL

```bash
curl -X POST http://localhost:3010/api/v1/proyectos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "PRY001",
    "nombre": "Mi Primer Proyecto",
    "descripcion": "Proyecto de prueba",
    "clasificacion": "Gestion interna",
    "fechaInicio": "2024-02-01T00:00:00Z",
    "fechaFin": "2024-12-31T00:00:00Z"
  }' | jq '.'
```

### Postman

1. Método: POST
2. URL: `http://localhost:3010/api/v1/proyectos`
3. Headers: `Authorization`, `Content-Type`
4. Body (raw JSON):
```json
{
  "codigo": "PRY001",
  "nombre": "Mi Primer Proyecto",
  "descripcion": "Proyecto de prueba",
  "clasificacion": "Gestion interna",
  "fechaInicio": "2024-02-01T00:00:00Z",
  "fechaFin": "2024-12-31T00:00:00Z"
}
```
5. Click "Send"

---

## 4. Obtener ID del Proyecto y Crear Sprint

### Obtener ID del proyecto que acabas de crear

```bash
curl -X GET "http://localhost:3010/api/v1/proyectos?codigo=PRY001" \
  -H "Authorization: Bearer $TOKEN" | jq '.[] | {id, nombre}'
```

**Response**:
```json
{
  "id": 1,
  "nombre": "Mi Primer Proyecto"
}
```

### Crear Sprint en el Proyecto

```bash
PROYECTO_ID=1

curl -X POST http://localhost:3010/api/v1/sprints \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"proyectoId\": $PROYECTO_ID,
    \"nombre\": \"Sprint 1\",
    \"sprintGoal\": \"Completar setup inicial\",
    \"fechaInicio\": \"2024-02-01T00:00:00Z\",
    \"fechaFin\": \"2024-02-15T00:00:00Z\",
    \"capacidadEquipo\": 40
  }" | jq '.'
```

---

## 5. Endpoints Más Usados

### Auth

```bash
# Login
POST /auth/login

# Obtener perfil
GET /auth/profile

# Cambiar contraseña
PUT /auth/change-password

# Logout
POST /auth/logout

# Refrescar token
POST /auth/refresh
```

### Proyectos

```bash
# Listar
GET /proyectos?estado=En%20desarrollo

# Obtener uno
GET /proyectos/{id}

# Crear
POST /proyectos

# Actualizar
PATCH /proyectos/{id}

# Eliminar
DELETE /proyectos/{id}
```

### Sprints

```bash
# Listar
GET /sprints?proyectoId={id}

# Crear
POST /sprints

# Iniciar
PATCH /sprints/{id}/iniciar

# Cerrar
PATCH /sprints/{id}/cerrar

# Burndown
GET /sprints/{id}/burndown

# Métricas
GET /sprints/{id}/metricas
```

### Historias de Usuario

```bash
# Listar
GET /historias-usuario?proyectoId={id}

# Crear
POST /historias-usuario

# Cambiar estado
PATCH /historias-usuario/{id}/estado
```

### Tareas

```bash
# Listar
GET /tareas?historiaUsuarioId={id}

# Crear
POST /tareas

# Cambiar estado
PATCH /tareas/{id}/estado
```

### Upload de Archivos

```bash
# Solicitar URL presignada
POST /upload/request-url

# Confirmar upload
POST /upload/confirm

# Upload directo
POST /upload/direct
```

---

## 6. Generar Token en el Frontend

### Vue.js

```javascript
import { ref } from 'vue'

export function useAuth() {
  const user = ref(null)
  const accessToken = ref(localStorage.getItem('accessToken'))

  async function login(email, password) {
    const response = await fetch('http://localhost:3010/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    const data = await response.json()
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    user.value = data.user
    accessToken.value = data.accessToken
  }

  return { user, accessToken, login }
}
```

### React

```javascript
import { useState } from 'react'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('accessToken'))

  async function login(email, password) {
    const response = await fetch('http://localhost:3010/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    const data = await response.json()
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    setUser(data.user)
    setToken(data.accessToken)
  }

  return { user, token, login }
}
```

---

## 7. Importar OpenAPI en Postman

### Pasos

1. Abre Postman
2. Click en "Import"
3. Selecciona "File" o "Folder"
4. Navega a: `docs/api/openapi.yaml`
5. Click "Import"
6. Se crearán automáticamente todos los endpoints

### O desde Link (si está hosteado)

1. Click en "Import"
2. Selecciona "Link"
3. Pega: `https://tu-repo/docs/api/openapi.yaml`
4. Click "Import"

---

## 8. Variables de Entorno

### Postman

1. Click en "Environments"
2. Create new environment: "SIGP"
3. Agregar variables:

```
api_base_url = http://localhost:3010/api/v1
access_token = {{token obtenido del login}}
refresh_token = {{token obtenido del login}}
```

4. Usar en requests:

```
{{api_base_url}}/proyectos
Authorization: Bearer {{access_token}}
```

---

## 9. Filtros y Búsqueda

### Proyectos

```bash
# Por estado
GET /proyectos?estado=En%20desarrollo

# Por coordinador
GET /proyectos?coordinadorId=1

# Por acción estratégica
GET /proyectos?accionEstrategicaId=5

# Combinados
GET /proyectos?estado=En%20desarrollo&coordinadorId=1&activo=true
```

### Sprints

```bash
# Por proyecto
GET /sprints?proyectoId=1

# Por estado
GET /sprints?estado=Activo

# Combinados
GET /sprints?proyectoId=1&estado=Activo
```

### Historias de Usuario

```bash
# Por proyecto
GET /historias-usuario?proyectoId=1

# Por estado
GET /historias-usuario?estado=En%20desarrollo

# Por prioridad
GET /historias-usuario?prioridad=Must

# Combinados
GET /historias-usuario?proyectoId=1&estado=En%20desarrollo&prioridad=Must
```

---

## 10. Manejo Básico de Errores

### Estructura de Error

```json
{
  "statusCode": 400,
  "message": "Bad Request",
  "error": "Descripción del error"
}
```

### Errores Comunes

| Código | Causa | Solución |
|--------|-------|----------|
| 400 | Datos inválidos | Verifica tipos y campos requeridos |
| 401 | No autenticado | Incluye Authorization header con token |
| 403 | Sin permisos | Verifica tu rol, solicita permisos |
| 404 | No encontrado | Verifica el ID del recurso |
| 409 | Ya existe | Email u otro campo duplicado |
| 500 | Error servidor | Contacta soporte |

### Manejo en JavaScript

```javascript
async function apiCall(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'API Error')
    }

    return await response.json()
  } catch (error) {
    console.error('Error:', error.message)
    // Mostrar error al usuario
  }
}
```

---

## 11. Documentación Completa

Cuando necesites más detalles:

| Necesito | Leer |
|----------|------|
| Entender estructura API | `README.md` |
| Importar en Postman | `openapi.yaml` |
| Referencia todos endpoints | `API_REFERENCE.md` |
| Autenticación | `AUTHENTICATION.md` |
| Integración frontend | `INTEGRATION_GUIDE.md` |
| Código ejemplo | `EXAMPLES.md` |
| Toda la documentación | `DOCUMENTATION_SUMMARY.md` |

---

## 12. Checklist Rápido

- [ ] Tengo credenciales válidas
- [ ] Obtuve access token
- [ ] Token está en header `Authorization: Bearer {token}`
- [ ] Content-Type es `application/json`
- [ ] Estoy usando método HTTP correcto (GET, POST, PATCH, DELETE)
- [ ] IDs de recursos existen
- [ ] Mi rol tiene permisos (si obtengo 403)
- [ ] URL es correcta

---

## Resumen

```
1. Login → Obten token
2. Usa token en cada request en header Authorization
3. GET para obtener datos
4. POST para crear
5. PATCH para actualizar
6. DELETE para eliminar
7. Consulta API_REFERENCE.md para detalles
```

---

## Próximos Pasos

1. **Leer `INTEGRATION_GUIDE.md`** si vas a hacer frontend
2. **Leer `AUTHENTICATION.md`** si necesitas entender auth
3. **Consultar `API_REFERENCE.md`** para cada endpoint que uses
4. **Usar `EXAMPLES.md`** para código en tu lenguaje

---

## Soporte

- Documentación: `docs/api/`
- Email: api@inei.gob.pe
- Issue Tracker: (GitHub interno)

Listo para empezar! Que disfrutes usando la API.

