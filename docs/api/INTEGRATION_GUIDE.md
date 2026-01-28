# SIGP - Integration Guide for Frontend

Guía completa para integrar el frontend con la API del Sistema Integral de Gestión de Proyectos.

## Tabla de Contenidos

1. [Setup Inicial](#setup-inicial)
2. [Configuración de la API](#configuración-de-la-api)
3. [Autenticación](#autenticación)
4. [Manejo de Errores](#manejo-de-errores)
5. [Paginación](#paginación)
6. [Filtros](#filtros)
7. [Tipos TypeScript](#tipos-typescript)
8. [Upload de Archivos](#upload-de-archivos)
9. [WebSockets](#websockets)
10. [Testing](#testing)

---

## Setup Inicial

### Instalación de Dependencias

```bash
# Axios para HTTP
npm install axios

# Token management
npm install js-cookie

# State management (opcional)
npm install zustand
# o
npm install pinia

# TypeScript types
npm install -D @types/node
```

### Variables de Entorno

Crear archivo `.env.local`:

```env
VITE_API_BASE_URL=http://localhost:3010/api/v1
VITE_MINIO_BASE_URL=https://minio.inei.gob.pe
VITE_WS_URL=ws://localhost:3010/ws
VITE_APP_NAME=SIGP
```

---

## Configuración de la API

### Crear Cliente Axios

**src/api/client.ts**:

```typescript
import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import { getAccessToken, setAccessToken, clearTokens } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3010/api/v1';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor para agregar token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor para manejar errores y refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Si es 401 y no es una petición de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { accessToken } = await refreshAccessToken();
        setAccessToken(accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh falló, ir a login
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

// Función para refrescar token
async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
    refreshToken,
  });

  return response.data;
}

export default apiClient;
```

### Gestión de Tokens

**src/api/auth.ts**:

```typescript
const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setUser(user: any) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser() {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}
```

---

## Autenticación

### Login

**src/api/services/auth.service.ts**:

```typescript
import apiClient from '../client';

export interface LoginRequest {
  email?: string;
  username?: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  nombre: string;
  apellido: string;
  rol: string;
  telefono?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: number;
    email: string;
    username: string;
    nombre: string;
    apellido: string;
    rol: string;
    avatarUrl?: string;
  };
}

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout', {
      token: localStorage.getItem('accessToken'),
    });
  },

  async getProfile() {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },

  async changePassword(currentPassword: string, newPassword: string) {
    const response = await apiClient.put('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};
```

### Composable/Hook de Autenticación

**src/composables/useAuth.ts** (Vue):

```typescript
import { ref, computed } from 'vue';
import { authService, LoginRequest, RegisterRequest } from '@/api/services/auth.service';
import { setTokens, setUser, clearTokens, getUser } from '@/api/auth';
import { useRouter } from 'vue-router';

export function useAuth() {
  const router = useRouter();
  const user = ref(getUser());
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!user.value);

  async function login(credentials: LoginRequest) {
    loading.value = true;
    error.value = null;
    try {
      const response = await authService.login(credentials);
      setTokens(response.accessToken, response.refreshToken);
      setUser(response.user);
      user.value = response.user;
      router.push('/dashboard');
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Login failed';
    } finally {
      loading.value = false;
    }
  }

  async function register(data: RegisterRequest) {
    loading.value = true;
    error.value = null;
    try {
      const response = await authService.register(data);
      setTokens(response.accessToken, response.refreshToken);
      setUser(response.user);
      user.value = response.user;
      router.push('/dashboard');
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Registration failed';
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    try {
      await authService.logout();
    } finally {
      clearTokens();
      user.value = null;
      router.push('/login');
    }
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
  };
}
```

**src/hooks/useAuth.ts** (React):

```typescript
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, LoginRequest, RegisterRequest } from '@/api/services/auth.service';
import { setTokens, setUser, clearTokens, getUser } from '@/api/auth';

export function useAuth() {
  const navigate = useNavigate();
  const [user, setUserState] = useState(getUser());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (credentials: LoginRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(credentials);
      setTokens(response.accessToken, response.refreshToken);
      setUser(response.user);
      setUserState(response.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const register = useCallback(async (data: RegisterRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(data);
      setTokens(response.accessToken, response.refreshToken);
      setUser(response.user);
      setUserState(response.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      clearTokens();
      setUserState(null);
      navigate('/login');
    }
  }, [navigate]);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };
}
```

### Ejemplos de Uso de Autenticación

#### Login con Email (método tradicional)

```typescript
// Vue component
async function handleEmailLogin() {
  await login({
    email: 'usuario@inei.gob.pe',
    password: 'Password123!'
  });
}

// React component
const handleEmailLogin = async () => {
  await login({
    email: 'usuario@inei.gob.pe',
    password: 'Password123!'
  });
};
```

#### Login con Username (nuevo método)

```typescript
// Vue component
async function handleUsernameLogin() {
  await login({
    username: 'jperez',
    password: 'Password123!'
  });
}

// React component
const handleUsernameLogin = async () => {
  await login({
    username: 'jperez',
    password: 'Password123!'
  });
};
```

#### Registro de Usuario

```typescript
// Vue component
async function handleRegister() {
  await register({
    email: 'nuevo@inei.gob.pe',
    username: 'nuevousuario',  // Ahora requerido
    password: 'Password123!',
    nombre: 'Juan',
    apellido: 'Pérez',
    rol: 'DESARROLLADOR'
  });
}

// React component
const handleRegister = async () => {
  await register({
    email: 'nuevo@inei.gob.pe',
    username: 'nuevousuario',  // Ahora requerido
    password: 'Password123!',
    nombre: 'Juan',
    apellido: 'Pérez',
    rol: 'DESARROLLADOR'
  });
};
```

#### Login Flexible (detectar email vs username)

```typescript
// Detectar automáticamente si es email o username
function handleFlexibleLogin(identifier: string, password: string) {
  const isEmail = identifier.includes('@');

  if (isEmail) {
    return login({ email: identifier, password });
  } else {
    return login({ username: identifier, password });
  }
}

// Uso en un formulario
const credentials = {
  identifier: formData.identifier,  // puede ser email o username
  password: formData.password
};

await handleFlexibleLogin(credentials.identifier, credentials.password);
```

---

## Manejo de Errores

### Clase de Error Personalizada

**src/api/errors.ts**:

```typescript
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(message: string, statusCode: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }

  static fromAxiosError(error: any): ApiError {
    const statusCode = error.response?.status || 500;
    const message = error.response?.data?.message || error.message || 'Unknown error';
    const details = error.response?.data;

    return new ApiError(message, statusCode, details);
  }
}

// Map de errores comunes
export const ERROR_MESSAGES: Record<number, string> = {
  400: 'Solicitud inválida. Verifica los datos.',
  401: 'No autenticado. Por favor inicia sesión.',
  403: 'No tienes permiso para esta acción.',
  404: 'Recurso no encontrado.',
  409: 'Conflict. El recurso ya existe.',
  500: 'Error del servidor. Intenta más tarde.',
};

export function getErrorMessage(error: any): string {
  if (error instanceof ApiError) {
    return ERROR_MESSAGES[error.statusCode] || error.message;
  }
  return 'Error desconocido';
}
```

### Global Error Handler

**src/api/interceptors.ts**:

```typescript
import { apiClient } from './client';
import { ApiError } from './errors';

// Agregar al response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError = ApiError.fromAxiosError(error);

    // Log de errores
    console.error('API Error:', {
      status: apiError.statusCode,
      message: apiError.message,
      details: apiError.details,
    });

    // Emit event para mostrar toast/snackbar
    window.dispatchEvent(
      new CustomEvent('api-error', {
        detail: apiError,
      }),
    );

    return Promise.reject(apiError);
  },
);
```

### Ejemplo de Uso en Componente

**src/components/LoginForm.vue**:

```vue
<template>
  <form @submit.prevent="handleLogin">
    <input v-model="email" type="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Password" />

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <button :disabled="loading" type="submit">
      {{ loading ? 'Logging in...' : 'Login' }}
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { getErrorMessage } from '@/api/errors';

const email = ref('');
const password = ref('');
const { login, loading, error: authError } = useAuth();
const error = ref<string | null>(null);

async function handleLogin() {
  error.value = null;
  try {
    await login({ email: email.value, password: password.value });
  } catch (err: any) {
    error.value = getErrorMessage(err);
  }
}
</script>
```

---

## Paginación

### Parámetros de Paginación

```typescript
export interface PaginationParams {
  page?: number;      // Default: 1
  limit?: number;     // Default: 20
  sortBy?: string;    // Campo para ordenar
  sortOrder?: 'ASC' | 'DESC';  // Dirección
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

### Uso en Servicio

**src/api/services/proyecto.service.ts**:

```typescript
import apiClient from '../client';
import { PaginationParams, PaginatedResponse } from '../types';

export const proyectoService = {
  async listProyectos(params: PaginationParams = {}) {
    const response = await apiClient.get<PaginatedResponse<any>>(
      '/proyectos',
      { params },
    );
    return response.data;
  },

  async getProyecto(id: number) {
    const response = await apiClient.get(`/proyectos/${id}`);
    return response.data;
  },

  async createProyecto(data: any) {
    const response = await apiClient.post('/proyectos', data);
    return response.data;
  },

  async updateProyecto(id: number, data: any) {
    const response = await apiClient.patch(`/proyectos/${id}`, data);
    return response.data;
  },

  async deleteProyecto(id: number) {
    await apiClient.delete(`/proyectos/${id}`);
  },
};
```

### Composable de Paginación

**src/composables/usePagination.ts**:

```typescript
import { ref, computed } from 'vue';
import { PaginationParams } from '@/api/types';

export function usePagination(
  fetchFunction: (params: PaginationParams) => Promise<any>,
  initialLimit = 20,
) {
  const data = ref<any[]>([]);
  const total = ref(0);
  const page = ref(1);
  const limit = ref(initialLimit);
  const loading = ref(false);

  const totalPages = computed(() => Math.ceil(total.value / limit.value));

  async function fetch(newPage = 1) {
    loading.value = true;
    try {
      const result = await fetchFunction({
        page: newPage,
        limit: limit.value,
      });
      data.value = result.data;
      total.value = result.total;
      page.value = newPage;
    } finally {
      loading.value = false;
    }
  }

  function nextPage() {
    if (page.value < totalPages.value) {
      fetch(page.value + 1);
    }
  }

  function prevPage() {
    if (page.value > 1) {
      fetch(page.value - 1);
    }
  }

  return {
    data,
    total,
    page,
    limit,
    totalPages,
    loading,
    fetch,
    nextPage,
    prevPage,
  };
}
```

---

## Filtros

### Parámetros Comunes de Filtro

```typescript
// Proyectos
GET /proyectos?estado=En%20desarrollo&coordinadorId=1&activo=true

// Sprints
GET /sprints?proyectoId=1&estado=Activo

// Historias de Usuario
GET /historias-usuario?proyectoId=1&estado=En%20desarrollo&prioridad=Must

// Personal
GET /personal?divisionId=1&modalidad=Planilla&disponible=true
```

### Servicio con Filtros

**src/api/services/filters.ts**:

```typescript
import apiClient from '../client';

export interface FilterOptions {
  [key: string]: string | number | boolean | undefined;
}

export function cleanFilters(filters: FilterOptions): FilterOptions {
  return Object.fromEntries(
    Object.entries(filters).filter(([_, value]) => value !== undefined && value !== ''),
  );
}

export const proyectoService = {
  async listProyectos(filters: FilterOptions = {}) {
    const cleanedFilters = cleanFilters(filters);
    const response = await apiClient.get('/proyectos', {
      params: cleanedFilters,
    });
    return response.data;
  },
};
```

### Composable de Filtros

**src/composables/useFilters.ts**:

```typescript
import { ref, watch, reactive } from 'vue';

export function useFilters(fetchFunction: (filters: any) => Promise<void>) {
  const filters = reactive({
    estado: '',
    coordinadorId: undefined,
    activo: undefined,
  });

  const loading = ref(false);
  const data = ref<any[]>([]);

  async function applyFilters() {
    loading.value = true;
    try {
      await fetchFunction(filters);
    } finally {
      loading.value = false;
    }
  }

  function resetFilters() {
    Object.keys(filters).forEach((key) => {
      filters[key] = '';
    });
  }

  watch(filters, () => applyFilters(), { deep: true });

  return {
    filters,
    loading,
    data,
    applyFilters,
    resetFilters,
  };
}
```

---

## Tipos TypeScript

### Generar tipos desde OpenAPI

```bash
# Instalar herramienta
npm install -D @openapitools/openapi-generator-cli

# Generar tipos
npx openapi-generator-cli generate \
  -i docs/api/openapi.yaml \
  -g typescript-axios \
  -o src/api/generated
```

### Tipos Manuales

**src/api/types/index.ts**:

```typescript
// Auth
export interface User {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  rol: Role;
  avatarUrl?: string;
}

export type Role =
  | 'ADMIN'
  | 'PMO'
  | 'COORDINADOR'
  | 'SCRUM_MASTER'
  | 'PATROCINADOR'
  | 'DESARROLLADOR'
  | 'IMPLEMENTADOR';

// Proyectos
export interface Proyecto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  estado: ProyectoEstado;
  clasificacion?: Clasificacion;
  accionEstrategicaId?: number;
  coordinadorId?: number;
  scrumMasterId?: number;
  patrocinadorId?: number;
  createdAt: string;
  updatedAt: string;
}

export type ProyectoEstado =
  | 'Pendiente'
  | 'En planificacion'
  | 'En desarrollo'
  | 'Finalizado'
  | 'Cancelado';

export type Clasificacion = 'Al ciudadano' | 'Gestion interna';

// Sprints
export interface Sprint {
  id: number;
  proyectoId: number;
  nombre: string;
  estado: SprintEstado;
  sprintGoal?: string;
  fechaInicio: string;
  fechaFin: string;
  capacidadEquipo?: number;
  createdAt: string;
}

export type SprintEstado = 'Planificado' | 'Activo' | 'Completado';

// Historias de Usuario
export interface HistoriaUsuario {
  id: number;
  proyectoId: number;
  epicaId?: number;
  sprintId?: number;
  codigo: string;
  titulo: string;
  rol?: string;
  quiero?: string;
  para?: string;
  prioridad?: HuPrioridad;
  estimacion?: HuEstimacion;
  storyPoints?: number;
  estado: HuEstado;
  asignadoA?: number;
  criteriosAceptacion?: CriterioAceptacion[];
  createdAt: string;
}

export type HuPrioridad = 'Must' | 'Should' | 'Could' | 'Wont';
export type HuEstimacion = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
export type HuEstado =
  | 'Pendiente'
  | 'En analisis'
  | 'Lista'
  | 'En desarrollo'
  | 'En pruebas'
  | 'En revision'
  | 'Terminada';

export interface CriterioAceptacion {
  given: string;
  when: string;
  then: string;
  orden?: number;
}

// Tareas
export interface Tarea {
  id: number;
  titulo: string;
  descripcion?: string;
  tipo: TareaTipo;
  estado: TareaEstado;
  prioridad?: TareaPrioridad;
  historiaUsuarioId?: number;
  actividadId?: number;
  asignadoA?: number;
  createdAt: string;
}

export type TareaTipo = 'SCRUM' | 'KANBAN';
export type TareaEstado =
  | 'Por hacer'
  | 'En progreso'
  | 'En revision'
  | 'Finalizado';
export type TareaPrioridad = 'Alta' | 'Media' | 'Baja';

// Personal
export interface Personal {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  divisionId?: number;
  modalidad: Modalidad;
  disponible: boolean;
  horasDisponibles?: number;
  createdAt: string;
}

export type Modalidad = 'Planilla' | 'CAS' | 'Locador' | 'Practicante';

// Archivos
export interface Archivo {
  id: string;
  nombreOriginal: string;
  nombreAlmacenado: string;
  mimeType: string;
  tamanoBytes: number;
  tamanoLegible: string;
  categoria: ArchivoCategoria;
  estado: ArchivoEstado;
  entidadTipo: ArchivoEntidadTipo;
  entidadId: number;
  version: number;
  createdAt: string;
}

export type ArchivoCategoria =
  | 'documento'
  | 'evidencia'
  | 'acta'
  | 'informe'
  | 'cronograma'
  | 'avatar'
  | 'adjunto'
  | 'backup';

export type ArchivoEstado = 'pendiente' | 'procesando' | 'disponible' | 'error' | 'eliminado';

export enum ArchivoEntidadTipo {
  PROYECTO = 'PROYECTO',
  SUBPROYECTO = 'SUBPROYECTO',
  ACTIVIDAD = 'ACTIVIDAD',
  HISTORIA_USUARIO = 'HISTORIA_USUARIO',
  TAREA = 'TAREA',
  USUARIO = 'USUARIO',
}

// Notificaciones
export interface Notificacion {
  id: number;
  usuarioId: number;
  titulo: string;
  mensaje: string;
  tipo: TipoNotificacion;
  entidadTipo?: string;
  entidadId?: number;
  leida: boolean;
  createdAt: string;
}

export type TipoNotificacion =
  | 'Proyectos'
  | 'Sprints'
  | 'Retrasos'
  | 'Aprobaciones'
  | 'Tareas'
  | 'Documentos'
  | 'Sistema';

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}
```

---

## Upload de Archivos

### Servicio de Upload

**src/api/services/storage.service.ts**:

```typescript
import apiClient from '../client';

export interface UploadRequest {
  entidadTipo: string;
  entidadId: number;
  categoria: string;
  nombreArchivo: string;
  mimeType: string;
  tamano: number;
  metadata?: Record<string, any>;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  archivoId: string;
  objectKey: string;
  bucket: string;
  expiresIn: number;
  requiredHeaders: Record<string, string>;
}

export const storageService = {
  async requestUploadUrl(data: UploadRequest): Promise<UploadUrlResponse> {
    const response = await apiClient.post<UploadUrlResponse>(
      '/upload/request-url',
      data,
    );
    return response.data;
  },

  async confirmUpload(archivoId: string, checksumMd5?: string) {
    const response = await apiClient.post('/upload/confirm', {
      archivoId,
      checksumMd5,
    });
    return response.data;
  },

  async uploadDirectToMinio(
    file: File,
    uploadUrl: string,
    contentType: string,
  ): Promise<void> {
    // Subir directamente a MinIO usando PUT
    await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
      },
      body: file,
    });
  },

  async uploadDirect(
    file: File,
    entidadTipo: string,
    entidadId: number,
    categoria: string,
    metadata?: Record<string, any>,
  ) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entidadTipo', entidadTipo);
    formData.append('entidadId', entidadId.toString());
    formData.append('categoria', categoria);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    const response = await apiClient.post('/upload/direct', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
};
```

### Composable de Upload

**src/composables/useFileUpload.ts**:

```typescript
import { ref } from 'vue';
import { storageService } from '@/api/services/storage.service';

export function useFileUpload() {
  const file = ref<File | null>(null);
  const loading = ref(false);
  const progress = ref(0);
  const error = ref<string | null>(null);

  async function uploadPresigned(
    selectedFile: File,
    entidadTipo: string,
    entidadId: number,
    categoria: string,
  ) {
    loading.value = true;
    error.value = null;
    progress.value = 0;

    try {
      // Paso 1: Solicitar URL presignada
      const uploadResponse = await storageService.requestUploadUrl({
        entidadTipo,
        entidadId,
        categoria,
        nombreArchivo: selectedFile.name,
        mimeType: selectedFile.type,
        tamano: selectedFile.size,
      });

      progress.value = 33;

      // Paso 2: Subir archivo a MinIO
      await storageService.uploadDirectToMinio(
        selectedFile,
        uploadResponse.uploadUrl,
        selectedFile.type,
      );

      progress.value = 66;

      // Paso 3: Confirmar upload
      const result = await storageService.confirmUpload(uploadResponse.archivoId);

      progress.value = 100;
      file.value = selectedFile;

      return result;
    } catch (err: any) {
      error.value = err.message || 'Upload failed';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function uploadDirect(
    selectedFile: File,
    entidadTipo: string,
    entidadId: number,
    categoria: string,
  ) {
    loading.value = true;
    error.value = null;

    try {
      const result = await storageService.uploadDirect(
        selectedFile,
        entidadTipo,
        entidadId,
        categoria,
      );
      file.value = selectedFile;
      return result;
    } catch (err: any) {
      error.value = err.message || 'Upload failed';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    file,
    loading,
    progress,
    error,
    uploadPresigned,
    uploadDirect,
  };
}
```

### Componente de Upload

**src/components/FileUpload.vue**:

```vue
<template>
  <div class="file-upload">
    <input
      ref="fileInput"
      type="file"
      @change="handleFileChange"
      hidden
    />

    <button @click="selectFile" :disabled="loading">
      Seleccionar archivo
    </button>

    <div v-if="file" class="file-info">
      <p>{{ file.name }} ({{ formatFileSize(file.size) }})</p>
      <div class="progress-bar" v-if="loading">
        <div class="progress-fill" :style="{ width: progress + '%' }"></div>
      </div>
      <button @click="handleUpload" :disabled="loading">
        {{ loading ? 'Subiendo...' : 'Subir archivo' }}
      </button>
    </div>

    <div v-if="error" class="error">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useFileUpload } from '@/composables/useFileUpload';

const props = defineProps({
  entidadTipo: String,
  entidadId: Number,
  categoria: String,
});

const emit = defineEmits(['uploaded']);

const fileInput = ref<HTMLInputElement>();
const { file, loading, progress, error, uploadPresigned } = useFileUpload();

function selectFile() {
  fileInput.value?.click();
}

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files?.length) {
    file.value = input.files[0];
  }
}

async function handleUpload() {
  if (!file.value) return;

  try {
    const result = await uploadPresigned(
      file.value,
      props.entidadTipo!,
      props.entidadId!,
      props.categoria!,
    );
    emit('uploaded', result);
  } catch (err) {
    console.error('Upload error:', err);
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
</script>

<style scoped>
.file-upload {
  border: 2px dashed #ccc;
  padding: 20px;
  border-radius: 4px;
}

.file-info {
  margin-top: 10px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #eee;
  border-radius: 4px;
  overflow: hidden;
  margin: 10px 0;
}

.progress-fill {
  height: 100%;
  background: #4caf50;
  transition: width 0.3s;
}

.error {
  color: #f44336;
  margin-top: 10px;
}
</style>
```

---

## WebSockets

### Conexión WebSocket

**src/api/websocket.ts**:

```typescript
export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private token: string;
  private listeners: Map<string, Set<Function>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(url: string, token: string) {
    this.url = url;
    this.token = token;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(`${this.url}?token=${this.token}`);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          const message = JSON.parse(event.data);
          this.emit(message.type, message.data);
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.attemptReconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.pow(2, this.reconnectAttempts) * 1000;
      console.log(`Attempting to reconnect in ${delay}ms...`);
      setTimeout(() => this.connect(), delay);
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function) {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.delete(callback);
    }
  }

  private emit(event: string, data: any) {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach((callback) => {
        callback(data);
      });
    }
  }

  send(type: string, data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
```

### Composable WebSocket

**src/composables/useWebSocket.ts**:

```typescript
import { onMounted, onUnmounted, ref } from 'vue';
import { WebSocketClient } from '@/api/websocket';
import { getAccessToken } from '@/api/auth';

export function useWebSocket() {
  const ws = ref<WebSocketClient | null>(null);
  const isConnected = ref(false);
  const notifications = ref<any[]>([]);

  onMounted(async () => {
    const token = getAccessToken();
    if (!token) return;

    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3010/ws';
    ws.value = new WebSocketClient(wsUrl, token);

    try {
      await ws.value.connect();
      isConnected.value = true;

      // Escuchar notificaciones
      ws.value.on('notification', (data: any) => {
        notifications.value.push(data);
      });

      // Escuchar actualizaciones de proyectos
      ws.value.on('project-update', (data: any) => {
        // Actualizar estado del proyecto
      });

      // Escuchar cambios en tiempo real
      ws.value.on('realtime-update', (data: any) => {
        // Actualizar datos en tiempo real
      });
    } catch (error) {
      console.error('WebSocket connection failed:', error);
    }
  });

  onUnmounted(() => {
    ws.value?.disconnect();
  });

  const sendMessage = (type: string, data: any) => {
    ws.value?.send(type, data);
  };

  return {
    ws,
    isConnected,
    notifications,
    sendMessage,
  };
}
```

---

## Testing

### Unit Tests para Servicios

**src/api/services/__tests__/auth.service.spec.ts**:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../auth.service';
import apiClient from '../../client';

vi.mock('../../client');

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should login successfully', async () => {
    const mockResponse = {
      data: {
        accessToken: 'token123',
        refreshToken: 'refresh123',
        expiresIn: 3600,
        user: {
          id: 1,
          email: 'test@example.com',
          nombre: 'Test',
          apellido: 'User',
          rol: 'DEVELOPER',
        },
      },
    };

    vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

    const result = await authService.login({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(result).toEqual(mockResponse.data);
    expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('should handle login error', async () => {
    const error = new Error('Invalid credentials');
    vi.mocked(apiClient.post).mockRejectedValue(error);

    await expect(
      authService.login({
        email: 'test@example.com',
        password: 'wrong',
      }),
    ).rejects.toThrow('Invalid credentials');
  });
});
```

### Integration Tests

**src/__tests__/login.integration.spec.ts**:

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import axios from 'axios';

const API_URL = 'http://localhost:3010/api/v1';

describe('Authentication Integration Tests', () => {
  let accessToken: string;
  let refreshToken: string;

  it('should register a new user', async () => {
    const response = await axios.post(`${API_URL}/auth/register`, {
      email: `test-${Date.now()}@example.com`,
      password: 'TestPassword123',
      nombre: 'Test',
      apellido: 'User',
      rol: 'DEVELOPER',
    });

    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty('accessToken');
    expect(response.data).toHaveProperty('user');

    accessToken = response.data.accessToken;
    refreshToken = response.data.refreshToken;
  });

  it('should login with credentials', async () => {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'existing@example.com',
      password: 'password123',
    });

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('accessToken');
    expect(response.data.user.email).toBe('existing@example.com');
  });

  it('should get profile with valid token', async () => {
    const response = await axios.get(`${API_URL}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('email');
    expect(response.data).toHaveProperty('nombre');
  });

  it('should fail with invalid token', async () => {
    try {
      await axios.get(`${API_URL}/auth/profile`, {
        headers: {
          Authorization: 'Bearer invalid-token',
        },
      });
      expect.fail('Should have thrown');
    } catch (error: any) {
      expect(error.response.status).toBe(401);
    }
  });
});
```

---

## Checklist de Implementación

- [ ] Configurar variables de entorno
- [ ] Crear cliente Axios con interceptores
- [ ] Implementar gestión de tokens
- [ ] Crear servicios para cada módulo
- [ ] Implementar composables/hooks de lógica
- [ ] Crear componentes de UI (login, forms, etc.)
- [ ] Implementar manejo de errores
- [ ] Agregar paginación
- [ ] Implementar filtros
- [ ] Configurar upload de archivos
- [ ] Implementar WebSockets
- [ ] Escribir tests unitarios
- [ ] Escribir tests de integración
- [ ] Revisar seguridad (CORS, headers, etc.)
- [ ] Optimizar rendimiento (lazy loading, caching, etc.)

---

## Recursos Adicionales

- OpenAPI Spec: `/docs/api/openapi.yaml`
- API Reference: `/docs/api/API_REFERENCE.md`
- Postman Collection: `/docs/api/POSTMAN_COLLECTION.json`
- Ejemplos de código: `/docs/api/EXAMPLES.md`

