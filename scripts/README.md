# Scripts de Prueba y Utilidades

Esta carpeta contiene todos los scripts PowerShell para pruebas y utilidades del proyecto SIGP.

## Estructura

```
scripts/
├── tests/       # Scripts de prueba
├── utils/       # Utilidades (reset, usuarios, etc.)
└── outputs/     # Resultados de pruebas (logs, JSON)
```

## Requisitos

1. PowerShell 5.1+ o PowerShell Core 7+
2. Docker Desktop con contenedores corriendo
3. API disponible en `http://localhost:3010`

## Scripts de Prueba (tests/)

### Pruebas Principales

| Script | Descripcion |
|--------|-------------|
| `simular-flujo-kanban.ps1` | Simula flujo completo Kanban con datos reales |
| `test-agile-exhaustivo.ps1` | Suite completa de pruebas Agile |
| `test-planning-fixed.ps1` | Pruebas del modulo Planning |
| `test-poi-simple.ps1` | Pruebas del modulo POI |

### Pruebas de Permisos

| Script | Descripcion |
|--------|-------------|
| `test-admin-permisos.ps1` | Valida que ADMIN tiene acceso total |
| `test-pmo-permisos.ps1` | Valida permisos del rol PMO |
| `comparar-tokens.ps1` | Compara estructura de tokens JWT |

### Ejecucion

```powershell
# Desde la raiz del proyecto
powershell -ExecutionPolicy Bypass -File scripts/tests/simular-flujo-kanban.ps1
```

## Utilidades (utils/)

### Gestion de Usuarios

| Script | Descripcion | Cuando Usar |
|--------|-------------|-------------|
| `create-test-users.ps1` | Crea 7 usuarios de prueba | Primera vez |
| `reset-usuarios.ps1` | Resetea passwords (todos) | Cuentas bloqueadas |
| `reset-admin.ps1` | Resetea solo admin | Emergencia |

### Otros

| Script | Descripcion |
|--------|-------------|
| `update-passwords.sql` | SQL directo para passwords |
| `fix-encoding.ps1` | Corrige problemas de encoding |
| `fix-syntax.ps1` | Corrige errores de sintaxis |

### Ejecucion

```powershell
# Crear usuarios de prueba
powershell -ExecutionPolicy Bypass -File scripts/utils/create-test-users.ps1

# Resetear passwords
powershell -ExecutionPolicy Bypass -File scripts/utils/reset-usuarios.ps1
```

## Outputs (outputs/)

Carpeta con resultados de ejecuciones de prueba:

- `*.txt` - Logs de salida
- `*.json` - Resultados estructurados

**Nota:** Estos archivos son de referencia, no se ejecutan.

## Usuarios de Prueba

Todos usan password: `Password123!`

| Rol | Email |
|-----|-------|
| ADMIN | admin@inei.gob.pe |
| PMO | pmo@inei.gob.pe |
| COORDINADOR | coordinador@inei.gob.pe |
| SCRUM_MASTER | scrummaster@inei.gob.pe |
| PATROCINADOR | patrocinador@inei.gob.pe |
| DESARROLLADOR | desarrollador@inei.gob.pe |
| IMPLEMENTADOR | implementador@inei.gob.pe |

## Troubleshooting

### Error de Login
```powershell
# Resetear passwords
powershell -ExecutionPolicy Bypass -File scripts/utils/reset-usuarios.ps1
```

### API no responde
```bash
# Reiniciar contenedor
docker-compose restart app
```

### Error de ejecucion PowerShell
```powershell
# Verificar politica
Get-ExecutionPolicy
# Si es Restricted:
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```
