# SIGP API - Complete Documentation Index

Índice y guía de navegación para toda la documentación de la API.

## Comienza Aquí

### Si tienes 5 minutos
1. **[QUICKSTART.md](QUICKSTART.md)** - Obtén un token y haz tu primer request en 5 minutos

### Si tienes 30 minutos
1. **[README.md](README.md)** - Entender la estructura general
2. **[QUICKSTART.md](QUICKSTART.md)** - Hacer tu primer request

### Si vas a implementar un frontend
1. **[README.md](README.md)** - 5 min
2. **[AUTHENTICATION.md](AUTHENTICATION.md)** - 20 min
3. **[INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)** - 1-2 horas
4. **[EXAMPLES.md](EXAMPLES.md)** - Según necesites

### Si vas a hacer testing
1. **[QUICKSTART.md](QUICKSTART.md)** - 5 min
2. **[openapi.yaml](openapi.yaml)** - Importar en Postman
3. **[API_REFERENCE.md](API_REFERENCE.md)** - Como referencia

---

## Documentos Disponibles

### 1. QUICKSTART.md (5 min read)
**Para**: Comenzar inmediatamente

**Contenido**:
- Obtener token en 30 segundos
- Primer request en 1 minuto
- Endpoints más usados
- Código ejemplo rápido
- Troubleshooting básico

**Cuándo usar**: Necesitas empezar ya mismo

---

### 2. README.md (10 min read)
**Para**: Entender la estructura general

**Contenido**:
- Inicio rápido
- Estructura de módulos
- Autenticación 101
- Roles y permisos
- Formatos comunes
- Errores comunes
- Acceso rápido a recursos

**Cuándo usar**: Primera toma de contacto con la API

---

### 3. openapi.yaml (Especificación)
**Para**: Visión técnica completa

**Contenido**:
- Especificación OpenAPI 3.0
- 35+ endpoints definidos
- Schemas de request/response
- Security schemes
- Examples para cada endpoint

**Cuándo usar**:
- Importar en Postman
- Validar con swagger-ui
- Generar cliente automáticamente

**Cómo usar en Postman**:
```
File > Import > openapi.yaml
```

---

### 4. API_REFERENCE.md (30+ min reference)
**Para**: Referencia técnica completa

**Contenido**:
- Todos los 35+ endpoints documentados
- Ejemplos de curl para cada uno
- Parámetros explicados
- Respuestas de éxito y error
- Enums y constantes
- Matriz de roles vs permisos

**Secciones**:
- Auth (6 endpoints)
- Proyectos (8 endpoints)
- Sprints (10 endpoints)
- Historias de Usuario (12 endpoints)
- Tareas (8 endpoints)
- Personal (8 endpoints)
- Storage (6 endpoints)
- Notificaciones (8 endpoints)
- Dashboard (7 endpoints)

**Cuándo usar**: Necesitas documentación completa de un endpoint específico

---

### 5. AUTHENTICATION.md (20 min read)
**Para**: Entender completamente la autenticación

**Contenido**:
- Flujo de autenticación (visual)
- Estructura JWT explicada
- Cómo decodificar tokens
- 7 roles y su jerarquía
- Matriz de permisos (tabla completa)
- Todos los endpoints de auth
- Manejo de tokens
- 15 best practices de seguridad
- CORS configuration
- Troubleshooting

**Temas**:
- Login/Logout
- Refresh de tokens
- Cambio de contraseña
- HTTPS y seguridad
- Rate limiting
- Validación JWT

**Cuándo usar**:
- Implementar autenticación
- Entender roles y permisos
- Implementar seguridad

---

### 6. INTEGRATION_GUIDE.md (60-120 min read + code)
**Para**: Implementar el frontend

**Contenido**:
- Setup inicial del proyecto
- Configuración de cliente HTTP
- Implementación de autenticación
- Manejo de errores global
- Paginación
- Filtros
- Tipos TypeScript
- Upload de archivos (presigned URLs)
- WebSockets para notificaciones
- Testing

**Secciones Principales**:
1. Setup Inicial
2. Configuración de la API
3. Autenticación (Composables/Hooks)
4. Manejo de Errores
5. Paginación
6. Filtros
7. Tipos TypeScript
8. Upload de Archivos
9. WebSockets
10. Testing

**Código Incluido**:
- Cliente Axios completo
- Interceptores
- Composables/Hooks (Vue + React)
- Servicios API
- Upload con progreso
- WebSocket client
- Tests con Vitest

**Cuándo usar**: Vas a implementar frontend

---

### 7. EXAMPLES.md (30+ min copy-paste)
**Para**: Código listo para copiar

**Lenguajes**:
1. **JavaScript/Fetch** (3 ejemplos)
   - Login, listar, crear
   - Upload de archivo

2. **JavaScript/Axios** (3 ejemplos)
   - Cliente configurado
   - Servicios
   - Uso en React

3. **TypeScript** (1 ejemplo)
   - Tipos tipados
   - Cliente genérico

4. **Python** (2 ejemplos)
   - Cliente requests
   - Script completo

5. **cURL** (5 ejemplos)
   - Todos los casos comunes
   - Scripts útiles

6. **Java** (2 ejemplos)
   - HttpClient
   - Spring RestTemplate

7. **C#/.NET** (2 ejemplos)
   - HttpClient
   - HttpClientFactory

**Total**: 500+ líneas de código

**Cuándo usar**: Necesitas código para tu lenguaje

---

### 8. DOCUMENTATION_SUMMARY.md (5 min read)
**Para**: Resumen de toda la documentación

**Contenido**:
- Qué hay en cada documento
- Cómo usar la documentación
- Cobertura total
- Características principales
- Cómo mantener la documentación
- Estadísticas

**Cuándo usar**: Necesitas entender qué hay disponible

---

### 9. INDEX.md (Este archivo)
**Para**: Navegar toda la documentación

**Contenido**:
- Este índice
- Estructura de documentos
- Cómo encontrar lo que necesitas

---

## Por Rol / Persona

### Developer Frontend

**Orden de lectura**:
1. QUICKSTART.md (5 min)
2. README.md (10 min)
3. AUTHENTICATION.md (20 min)
4. INTEGRATION_GUIDE.md (2 horas)
5. EXAMPLES.md (según necesites)
6. API_REFERENCE.md (como referencia)

**Total**: 2.5-3 horas para empezar

---

### QA / Tester

**Orden de lectura**:
1. QUICKSTART.md (5 min)
2. README.md (10 min)
3. openapi.yaml (Importar en Postman)
4. API_REFERENCE.md (consultar)

**Total**: 20 min + testing

---

### DevOps / Arquitecto

**Orden de lectura**:
1. README.md (10 min)
2. AUTHENTICATION.md (security section)
3. DOCUMENTATION_SUMMARY.md (estadísticas)

**Total**: 30 min

---

### Backend Developer (mantenimiento)

**Orden de lectura**:
1. README.md (10 min)
2. openapi.yaml (arquitectura)
3. API_REFERENCE.md (referencia)

**Total**: 20 min + según cambios

---

### Product Manager

**Orden de lectura**:
1. README.md (10 min)
2. DOCUMENTATION_SUMMARY.md (cobertura)

**Total**: 15 min

---

## Por Tarea

### Quiero consumir un endpoint específico

1. Buscar en API_REFERENCE.md
2. Si quiero código, ir a EXAMPLES.md
3. Si necesito entender auth, AUTHENTICATION.md

---

### Quiero implementar login

1. QUICKSTART.md (obtener token)
2. AUTHENTICATION.md (flujos)
3. INTEGRATION_GUIDE.md (implementación)
4. EXAMPLES.md (código)

---

### Quiero subir un archivo

1. API_REFERENCE.md → Storage
2. INTEGRATION_GUIDE.md → Upload de Archivos
3. EXAMPLES.md (código)

---

### Quiero entender los roles

1. AUTHENTICATION.md → Roles y Permisos
2. API_REFERENCE.md → Matriz de permisos

---

### Quiero hacer testing

1. QUICKSTART.md (obtener token)
2. openapi.yaml (importar en Postman)
3. API_REFERENCE.md (casos de prueba)

---

### Quiero WebSocket/Notificaciones

1. INTEGRATION_GUIDE.md → WebSockets
2. API_REFERENCE.md → Notificaciones
3. EXAMPLES.md → código

---

## Estructura de Archivos

```
docs/api/
├─ INDEX.md                           # Este archivo
├─ README.md                           # Inicio rápido
├─ QUICKSTART.md                       # 5 min para comenzar
├─ openapi.yaml                        # Especificación OpenAPI 3.0
├─ API_REFERENCE.md                    # Referencia completa
├─ AUTHENTICATION.md                   # Autenticación detallada
├─ INTEGRATION_GUIDE.md                # Guía para frontend
├─ EXAMPLES.md                         # Código en 7 lenguajes
├─ DOCUMENTATION_SUMMARY.md            # Resumen de docs
└─ DOCUMENTATION_SUMMARY.md            # Resumen de docs
```

---

## Búsqueda Rápida

### Busco [cosa]...

| Busco | Archivo |
|-------|---------|
| Login | QUICKSTART.md |
| Obtener token | AUTHENTICATION.md |
| Crear proyecto | API_REFERENCE.md, EXAMPLES.md |
| Upload archivo | INTEGRATION_GUIDE.md, API_REFERENCE.md |
| WebSockets | INTEGRATION_GUIDE.md, API_REFERENCE.md |
| Roles y permisos | AUTHENTICATION.md |
| Código ejemplo | EXAMPLES.md |
| Todo los endpoints | API_REFERENCE.md, openapi.yaml |
| Setup frontend | INTEGRATION_GUIDE.md |
| Testing | INTEGRATION_GUIDE.md |
| Seguridad | AUTHENTICATION.md |
| CORS | AUTHENTICATION.md |
| Rate limiting | AUTHENTICATION.md |

---

## Flujo Recomendado por Perfil

### Si soy Frontend Developer (primer contacto)

```
1. QUICKSTART (5 min)     → "¡Ok, entiendo básico!"
2. README (10 min)        → "¡Veo la estructura!"
3. AUTHENTICATION (20 min)→ "¡Entiendo login!"
4. INTEGRATION_GUIDE      → "¡Implemento!"
   (2 horas)
5. Referencia constante:  → API_REFERENCE.md
```

**Tiempo total**: 2.5 horas para estar operacional

---

### Si soy QA (primer contacto)

```
1. QUICKSTART (5 min)     → "¡Ok, tengo token!"
2. openapi.yaml           → "Importo en Postman"
3. API_REFERENCE.md       → "Verifico cada endpoint"
4. AUTHENTICATION         → "Entiendo roles"
```

**Tiempo total**: 1 hora para empezar testing

---

### Si soy PM (primer contacto)

```
1. README (10 min)                   → "¡Entiendo módulos!"
2. DOCUMENTATION_SUMMARY (5 min)     → "¡Veo cobertura!"
```

**Tiempo total**: 15 minutos

---

## Mantenimiento de Documentación

### Cuando agregas un endpoint

1. Actualiza `openapi.yaml`
2. Actualiza `API_REFERENCE.md`
3. Agrega ejemplo en `EXAMPLES.md`
4. Actualiza `README.md` si aplica
5. Actualiza `DOCUMENTATION_SUMMARY.md` (estadísticas)

### Versionado

```
openapi.yaml:
  servers:
    - url: /api/v1   # Cambiar si hay breaking changes

CHANGELOG:
  v1.1.0
  - Nuevo endpoint X
  - Cambio parámetro Y
```

---

## Links Útiles

### En Documentación

- [README.md](README.md) - Inicio
- [QUICKSTART.md](QUICKSTART.md) - Quick start
- [openapi.yaml](openapi.yaml) - OpenAPI spec
- [API_REFERENCE.md](API_REFERENCE.md) - Todos los endpoints
- [AUTHENTICATION.md](AUTHENTICATION.md) - Autenticación
- [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) - Frontend
- [EXAMPLES.md](EXAMPLES.md) - Código
- [DOCUMENTATION_SUMMARY.md](DOCUMENTATION_SUMMARY.md) - Resumen

### External Tools

- [Swagger UI Online](https://editor.swagger.io) - Ver OpenAPI
- [JWT.io](https://jwt.io) - Decodificar tokens
- [Postman](https://www.postman.com) - Testing API

---

## FAQ Documentación

**P: ¿Por dónde empiezo?**
R: Si tienes 5 min → QUICKSTART. Si tienes 30 min → README + QUICKSTART.

**P: ¿Necesito leer todo?**
R: No. Lee según tu rol y necesidad. Ve a "Por Rol" arriba.

**P: ¿Dónde está [endpoint]?**
R: API_REFERENCE.md tiene todos. O busca en openapi.yaml.

**P: ¿Cómo implemento [feature]?**
R: INTEGRATION_GUIDE.md tiene guías, EXAMPLES.md tiene código.

**P: ¿Cómo hago testing?**
R: QUICKSTART + openapi.yaml en Postman + API_REFERENCE.md

**P: ¿Qué información está disponible?**
R: Ve DOCUMENTATION_SUMMARY.md para cobertura.

---

## Versión

| Aspecto | Valor |
|---------|-------|
| Documentación | v1.0.0 |
| API | v1.0.0 |
| Fecha | 2024-01-20 |
| Estatus | Completa |

---

## Contacto

Para preguntas sobre documentación:
- Email: api@inei.gob.pe
- Issue: (GitHub interno)

---

Última actualización: 2024-01-20

Comienza con **QUICKSTART.md** si quieres ir rápido, o **README.md** si tienes tiempo.
