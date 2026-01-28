# SIGP - API Examples

Ejemplos prácticos de cómo consumir la API de SIGP con diferentes lenguajes y herramientas.

## Tabla de Contenidos

1. [JavaScript/Fetch](#javascriptfetch)
2. [JavaScript/Axios](#javascriptaxios)
3. [TypeScript](#typescript)
4. [Python](#python)
5. [cURL](#curl)
6. [Java](#java)
7. [C#/.NET](#cnet)

---

## JavaScript/Fetch

### Ejemplo 1: Login con Email

```javascript
const apiBaseUrl = 'http://localhost:3010/api/v1';

async function loginWithEmail(email, password) {
  try {
    const response = await fetch(`${apiBaseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Guardar tokens
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);

    return data.user;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

// Uso
loginWithEmail('usuario@inei.gob.pe', 'password123')
  .then((user) => console.log('Logged in as:', user.nombre))
  .catch((error) => console.error(error));
```

### Ejemplo 1b: Login con Username (NUEVO)

```javascript
async function loginWithUsername(username, password) {
  try {
    const response = await fetch(`${apiBaseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Guardar tokens
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);

    return data.user;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

// Uso
loginWithUsername('jperez', 'password123')
  .then((user) => console.log('Logged in as:', user.username))
  .catch((error) => console.error(error));
```

### Ejemplo 2: Listar Proyectos

```javascript
async function listProyectos(filters = {}) {
  const accessToken = localStorage.getItem('accessToken');

  const queryParams = new URLSearchParams(filters).toString();
  const url = queryParams
    ? `${apiBaseUrl}/proyectos?${queryParams}`
    : `${apiBaseUrl}/proyectos`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to list proyectos:', error);
    throw error;
  }
}

// Uso
listProyectos({ estado: 'En desarrollo', activo: true })
  .then((proyectos) => console.log('Proyectos:', proyectos))
  .catch((error) => console.error(error));
```

### Ejemplo 3: Crear Proyecto

```javascript
async function createProyecto(proyectoData) {
  const accessToken = localStorage.getItem('accessToken');

  try {
    const response = await fetch(`${apiBaseUrl}/proyectos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(proyectoData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to create proyecto:', error);
    throw error;
  }
}

// Uso
const nuevoProyecto = {
  codigo: 'PRY002',
  nombre: 'Nuevo Sistema de Reporting',
  descripcion: 'Sistema para generación de reportes automáticos',
  clasificacion: 'Gestion interna',
  fechaInicio: '2024-02-01T00:00:00Z',
  fechaFin: '2024-12-31T00:00:00Z',
};

createProyecto(nuevoProyecto)
  .then((proyecto) => console.log('Proyecto creado:', proyecto))
  .catch((error) => console.error(error));
```

### Ejemplo 4: Upload de Archivo

```javascript
async function uploadFile(file, entidadTipo, entidadId) {
  const accessToken = localStorage.getItem('accessToken');

  try {
    // Paso 1: Solicitar URL presignada
    const uploadUrlResponse = await fetch(
      `${apiBaseUrl}/upload/request-url`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entidadTipo,
          entidadId,
          categoria: 'documento',
          nombreArchivo: file.name,
          mimeType: file.type,
          tamano: file.size,
        }),
      },
    );

    if (!uploadUrlResponse.ok) {
      throw new Error('Failed to get upload URL');
    }

    const uploadData = await uploadUrlResponse.json();

    // Paso 2: Subir archivo a MinIO
    const uploadResponse = await fetch(uploadData.uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload file to MinIO');
    }

    // Paso 3: Confirmar upload
    const confirmResponse = await fetch(
      `${apiBaseUrl}/upload/confirm`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          archivoId: uploadData.archivoId,
        }),
      },
    );

    if (!confirmResponse.ok) {
      throw new Error('Failed to confirm upload');
    }

    return await confirmResponse.json();
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}

// Uso
const fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (file) {
    try {
      const result = await uploadFile(file, 'PROYECTO', 1);
      console.log('Archivo subido:', result);
    } catch (error) {
      console.error(error);
    }
  }
});
```

---

## JavaScript/Axios

### Ejemplo 1: Cliente Axios Configurado

```javascript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3010/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor para manejar errores
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(
          'http://localhost:3010/api/v1/auth/refresh',
          { refreshToken },
        );

        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
```

### Ejemplo 2: Servicios API

```javascript
import apiClient from './client';

export const authService = {
  async login(email, password) {
    const response = await apiClient.post('/auth/login', { email, password });
    const { accessToken, refreshToken, user } = response.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  },

  async logout() {
    await apiClient.post('/auth/logout', {
      token: localStorage.getItem('accessToken'),
    });
    localStorage.clear();
  },

  async register(userData) {
    const response = await apiClient.post('/auth/register', userData);
    const { accessToken, refreshToken, user } = response.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  },

  async getProfile() {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },
};

export const proyectoService = {
  async list(filters = {}) {
    const response = await apiClient.get('/proyectos', { params: filters });
    return response.data;
  },

  async get(id) {
    const response = await apiClient.get(`/proyectos/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await apiClient.post('/proyectos', data);
    return response.data;
  },

  async update(id, data) {
    const response = await apiClient.patch(`/proyectos/${id}`, data);
    return response.data;
  },

  async delete(id) {
    await apiClient.delete(`/proyectos/${id}`);
  },
};

export const sprintService = {
  async list(filters = {}) {
    const response = await apiClient.get('/sprints', { params: filters });
    return response.data;
  },

  async get(id) {
    const response = await apiClient.get(`/sprints/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await apiClient.post('/sprints', data);
    return response.data;
  },

  async start(id) {
    const response = await apiClient.patch(`/sprints/${id}/iniciar`);
    return response.data;
  },

  async close(id, data) {
    const response = await apiClient.patch(`/sprints/${id}/cerrar`, data);
    return response.data;
  },

  async getBurndown(id) {
    const response = await apiClient.get(`/sprints/${id}/burndown`);
    return response.data;
  },

  async getMetricas(id) {
    const response = await apiClient.get(`/sprints/${id}/metricas`);
    return response.data;
  },
};
```

### Ejemplo 3: Uso en Componente React

```javascript
import { useState, useEffect } from 'react';
import { proyectoService } from './services';

function ProyectosList() {
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProyectos();
  }, []);

  const fetchProyectos = async () => {
    setLoading(true);
    try {
      const data = await proyectoService.list({ activo: true });
      setProyectos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de eliminar este proyecto?')) {
      try {
        await proyectoService.delete(id);
        setProyectos(proyectos.filter((p) => p.id !== id));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="proyectos-list">
      <h2>Proyectos</h2>
      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {proyectos.map((proyecto) => (
            <tr key={proyecto.id}>
              <td>{proyecto.codigo}</td>
              <td>{proyecto.nombre}</td>
              <td>{proyecto.estado}</td>
              <td>
                <button onClick={() => navigate(`/proyectos/${proyecto.id}`)}>
                  Ver
                </button>
                <button onClick={() => handleDelete(proyecto.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProyectosList;
```

---

## TypeScript

### Ejemplo 1: Tipos y Servicios Tipados

```typescript
import axios, { AxiosInstance } from 'axios';

// Tipos
export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  rol: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Proyecto {
  id: number;
  codigo: string;
  nombre: string;
  estado: 'Pendiente' | 'En desarrollo' | 'Finalizado';
  createdAt: string;
}

// Cliente
class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({ baseURL });
    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  async post<T>(path: string, data?: any): Promise<T> {
    const response = await this.client.post<T>(path, data);
    return response.data;
  }

  async get<T>(path: string, params?: any): Promise<T> {
    const response = await this.client.get<T>(path, { params });
    return response.data;
  }

  async patch<T>(path: string, data?: any): Promise<T> {
    const response = await this.client.patch<T>(path, data);
    return response.data;
  }

  async delete<T>(path: string): Promise<T> {
    const response = await this.client.delete<T>(path);
    return response.data;
  }
}

// Servicio tipado
export class AuthService {
  constructor(private client: ApiClient) {}

  async login(email: string, password: string): Promise<AuthResponse> {
    return this.client.post<AuthResponse>('/auth/login', { email, password });
  }

  async register(data: any): Promise<AuthResponse> {
    return this.client.post<AuthResponse>('/auth/register', data);
  }

  async logout(): Promise<void> {
    await this.client.post('/auth/logout');
  }

  async getProfile(): Promise<User> {
    return this.client.get<User>('/auth/profile');
  }
}

// Uso
const apiClient = new ApiClient('http://localhost:3010/api/v1');
const authService = new AuthService(apiClient);

async function main() {
  try {
    const user = await authService.login('test@example.com', 'password123');
    console.log('Logged in:', user);
  } catch (error) {
    console.error('Login failed:', error);
  }
}

main();
```

---

## Python

### Ejemplo 1: Cliente Python con Requests

```python
import requests
import json
from typing import Dict, Any, Optional

class SigpApiClient:
    def __init__(self, base_url: str = "http://localhost:3010/api/v1"):
        self.base_url = base_url
        self.session = requests.Session()
        self.access_token: Optional[str] = None
        self.refresh_token: Optional[str] = None

    def _set_headers(self):
        """Configurar headers con token"""
        if self.access_token:
            self.session.headers.update({
                "Authorization": f"Bearer {self.access_token}",
                "Content-Type": "application/json"
            })

    def login(self, email: str = None, username: str = None, password: str = None) -> Dict[str, Any]:
        """Login del usuario con email o username"""
        if not password:
            raise ValueError("Password es requerido")
        if not email and not username:
            raise ValueError("Email o username es requerido")

        url = f"{self.base_url}/auth/login"
        data = {"password": password}

        if email:
            data["email"] = email
        if username:
            data["username"] = username

        response = requests.post(url, json=data)
        response.raise_for_status()

        result = response.json()
        self.access_token = result["accessToken"]
        self.refresh_token = result["refreshToken"]
        self._set_headers()

        return result

    def login_with_email(self, email: str, password: str) -> Dict[str, Any]:
        """Login con email"""
        return self.login(email=email, password=password)

    def login_with_username(self, username: str, password: str) -> Dict[str, Any]:
        """Login con username (NUEVO)"""
        return self.login(username=username, password=password)

    def get_proyectos(self, filters: Optional[Dict] = None) -> list:
        """Obtener lista de proyectos"""
        url = f"{self.base_url}/proyectos"
        response = self.session.get(url, params=filters)
        response.raise_for_status()
        return response.json()

    def create_proyecto(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Crear nuevo proyecto"""
        url = f"{self.base_url}/proyectos"
        response = self.session.post(url, json=data)
        response.raise_for_status()
        return response.json()

    def get_sprint_burndown(self, sprint_id: int) -> Dict[str, Any]:
        """Obtener datos de burndown del sprint"""
        url = f"{self.base_url}/sprints/{sprint_id}/burndown"
        response = self.session.get(url)
        response.raise_for_status()
        return response.json()

    def upload_file(self, file_path: str, entidad_tipo: str, entidad_id: int) -> Dict[str, Any]:
        """Subir archivo"""
        # Paso 1: Solicitar URL presignada
        with open(file_path, 'rb') as f:
            file_size = len(f.read())

        url = f"{self.base_url}/upload/request-url"
        data = {
            "entidadTipo": entidad_tipo,
            "entidadId": entidad_id,
            "categoria": "documento",
            "nombreArchivo": file_path.split('/')[-1],
            "mimeType": "application/pdf",
            "tamano": file_size
        }

        response = self.session.post(url, json=data)
        response.raise_for_status()
        upload_data = response.json()

        # Paso 2: Subir archivo a MinIO
        with open(file_path, 'rb') as f:
            response = requests.put(
                upload_data["uploadUrl"],
                data=f,
                headers={"Content-Type": "application/pdf"}
            )
            response.raise_for_status()

        # Paso 3: Confirmar upload
        url = f"{self.base_url}/upload/confirm"
        data = {"archivoId": upload_data["archivoId"]}
        response = self.session.post(url, json=data)
        response.raise_for_status()

        return response.json()

    def logout(self):
        """Cerrar sesión"""
        url = f"{self.base_url}/auth/logout"
        self.session.post(url, json={"token": self.access_token})
        self.access_token = None
        self.refresh_token = None

# Uso
if __name__ == "__main__":
    client = SigpApiClient()

    try:
        # Login
        auth = client.login("usuario@inei.gob.pe", "password123")
        print(f"Logged in as: {auth['user']['nombre']}")

        # Obtener proyectos
        proyectos = client.get_proyectos({"activo": "true"})
        print(f"Total de proyectos: {len(proyectos)}")

        # Crear proyecto
        nuevo_proyecto = {
            "codigo": "PRY003",
            "nombre": "Nuevo Proyecto desde Python",
            "descripcion": "Proyecto creado desde script Python"
        }
        proyecto = client.create_proyecto(nuevo_proyecto)
        print(f"Proyecto creado: {proyecto['id']}")

        # Subir archivo
        resultado = client.upload_file(
            "documento.pdf",
            "PROYECTO",
            proyecto['id']
        )
        print(f"Archivo subido: {resultado['id']}")

        # Logout
        client.logout()
        print("Logged out")

    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
```

---

## cURL

### Ejemplo 1: Login con Email

```bash
curl -X POST http://localhost:3010/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@inei.gob.pe",
    "password": "password123"
  }' \
  | jq '.'
```

### Ejemplo 1b: Login con Username (NUEVO)

```bash
curl -X POST http://localhost:3010/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "jperez",
    "password": "password123"
  }' \
  | jq '.'
```

### Ejemplo 2: Guardar token y usarlo

```bash
# Login y guardar token
TOKEN=$(curl -s -X POST http://localhost:3010/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@inei.gob.pe",
    "password": "password123"
  }' | jq -r '.accessToken')

echo "Token: $TOKEN"

# Usar token para obtener proyectos
curl -X GET http://localhost:3010/api/v1/proyectos \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'
```

### Ejemplo 3: Crear Proyecto

```bash
curl -X POST http://localhost:3010/api/v1/proyectos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "PRY004",
    "nombre": "Proyecto desde cURL",
    "descripcion": "Proyecto creado con cURL",
    "clasificacion": "Gestion interna",
    "fechaInicio": "2024-02-01T00:00:00Z",
    "fechaFin": "2024-12-31T00:00:00Z"
  }' \
  | jq '.'
```

### Ejemplo 4: Upload de Archivo

```bash
#!/bin/bash

# Variables
API_URL="http://localhost:3010/api/v1"
TOKEN="your-access-token-here"
FILE="documento.pdf"
ENTIDAD_TIPO="PROYECTO"
ENTIDAD_ID=1

# Paso 1: Solicitar URL presignada
UPLOAD_RESPONSE=$(curl -s -X POST "$API_URL/upload/request-url" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"entidadTipo\": \"$ENTIDAD_TIPO\",
    \"entidadId\": $ENTIDAD_ID,
    \"categoria\": \"documento\",
    \"nombreArchivo\": \"$FILE\",
    \"mimeType\": \"application/pdf\",
    \"tamano\": $(stat -f%z "$FILE" 2>/dev/null || stat -c%s "$FILE")
  }")

UPLOAD_URL=$(echo "$UPLOAD_RESPONSE" | jq -r '.uploadUrl')
ARCHIVO_ID=$(echo "$UPLOAD_RESPONSE" | jq -r '.archivoId')

echo "Upload URL: $UPLOAD_URL"
echo "Archivo ID: $ARCHIVO_ID"

# Paso 2: Subir archivo a MinIO
curl -X PUT "$UPLOAD_URL" \
  -H "Content-Type: application/pdf" \
  --data-binary @"$FILE"

# Paso 3: Confirmar upload
curl -X POST "$API_URL/upload/confirm" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"archivoId\": \"$ARCHIVO_ID\"
  }" \
  | jq '.'
```

### Ejemplo 5: Filtrar Proyectos

```bash
# Proyectos en desarrollo
curl -s "http://localhost:3010/api/v1/proyectos?estado=En%20desarrollo&activo=true" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.[] | {id, codigo, nombre, estado}'

# Sprints activos
curl -s "http://localhost:3010/api/v1/sprints?estado=Activo" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.[] | {id, nombre, estado, fechaFin}'
```

---

## Java

### Ejemplo 1: Cliente HTTP con HttpClient

```java
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URI;
import com.google.gson.Gson;
import com.google.gson.JsonObject;

public class SigpApiClient {
    private static final String BASE_URL = "http://localhost:3010/api/v1";
    private final HttpClient httpClient;
    private final Gson gson;
    private String accessToken;
    private String refreshToken;

    public SigpApiClient() {
        this.httpClient = HttpClient.newHttpClient();
        this.gson = new Gson();
    }

    public void login(String email, String password) throws Exception {
        JsonObject body = new JsonObject();
        body.addProperty("email", email);
        body.addProperty("password", password);

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(BASE_URL + "/auth/login"))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(body.toString()))
            .build();

        HttpResponse<String> response = httpClient.send(
            request,
            HttpResponse.BodyHandlers.ofString()
        );

        JsonObject responseBody = gson.fromJson(
            response.body(),
            JsonObject.class
        );

        this.accessToken = responseBody.get("accessToken").getAsString();
        this.refreshToken = responseBody.get("refreshToken").getAsString();

        System.out.println("Logged in successfully");
    }

    public String getProyectos() throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(BASE_URL + "/proyectos"))
            .header("Authorization", "Bearer " + accessToken)
            .header("Content-Type", "application/json")
            .GET()
            .build();

        HttpResponse<String> response = httpClient.send(
            request,
            HttpResponse.BodyHandlers.ofString()
        );

        return response.body();
    }

    public void createProyecto(String codigo, String nombre) throws Exception {
        JsonObject body = new JsonObject();
        body.addProperty("codigo", codigo);
        body.addProperty("nombre", nombre);
        body.addProperty("clasificacion", "Gestion interna");

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(BASE_URL + "/proyectos"))
            .header("Authorization", "Bearer " + accessToken)
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(body.toString()))
            .build();

        HttpResponse<String> response = httpClient.send(
            request,
            HttpResponse.BodyHandlers.ofString()
        );

        if (response.statusCode() == 201) {
            System.out.println("Proyecto creado: " + response.body());
        } else {
            System.out.println("Error: " + response.body());
        }
    }

    public static void main(String[] args) throws Exception {
        SigpApiClient client = new SigpApiClient();

        // Login
        client.login("usuario@inei.gob.pe", "password123");

        // Obtener proyectos
        String proyectos = client.getProyectos();
        System.out.println("Proyectos: " + proyectos);

        // Crear proyecto
        client.createProyecto("PRY005", "Nuevo Proyecto Java");
    }
}
```

### Ejemplo 2: Con Spring RestTemplate

```java
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestTemplate;
import org.springframework.stereotype.Service;

@Service
public class SigpService {
    private final RestTemplate restTemplate = new RestTemplate();
    private final String baseUrl = "http://localhost:3010/api/v1";
    private String accessToken;

    public void login(String email, String password) {
        String url = baseUrl + "/auth/login";

        Map<String, String> body = new HashMap<>();
        body.put("email", email);
        body.put("password", password);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, String>> request =
            new HttpEntity<>(body, headers);

        var response = restTemplate.postForObject(url, request, Map.class);
        this.accessToken = (String) response.get("accessToken");
    }

    public List<Map> getProyectos() {
        String url = baseUrl + "/proyectos";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);

        HttpEntity<String> request = new HttpEntity<>(headers);

        var response = restTemplate.exchange(
            url,
            HttpMethod.GET,
            request,
            List.class
        );

        return response.getBody();
    }

    public Map createProyecto(String codigo, String nombre) {
        String url = baseUrl + "/proyectos";

        Map<String, String> body = new HashMap<>();
        body.put("codigo", codigo);
        body.put("nombre", nombre);
        body.put("clasificacion", "Gestion interna");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(accessToken);

        HttpEntity<Map<String, String>> request =
            new HttpEntity<>(body, headers);

        return restTemplate.postForObject(url, request, Map.class);
    }
}
```

---

## C#/.NET

### Ejemplo 1: HttpClient

```csharp
using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

public class SigpApiClient
{
    private const string BaseUrl = "http://localhost:3010/api/v1";
    private readonly HttpClient _httpClient;
    private string _accessToken;
    private string _refreshToken;

    public SigpApiClient()
    {
        _httpClient = new HttpClient();
    }

    public async Task Login(string email, string password)
    {
        var url = $"{BaseUrl}/auth/login";
        var body = new { email, password };
        var jsonContent = new StringContent(
            JsonConvert.SerializeObject(body),
            Encoding.UTF8,
            "application/json"
        );

        var response = await _httpClient.PostAsync(url, jsonContent);
        response.EnsureSuccessStatusCode();

        var content = await response.Content.ReadAsStringAsync();
        dynamic result = JsonConvert.DeserializeObject(content);

        _accessToken = result.accessToken;
        _refreshToken = result.refreshToken;

        Console.WriteLine("Logged in successfully");
    }

    public async Task<string> GetProyectos()
    {
        var url = $"{BaseUrl}/proyectos";

        _httpClient.DefaultRequestHeaders.Clear();
        _httpClient.DefaultRequestHeaders.Add(
            "Authorization",
            $"Bearer {_accessToken}"
        );

        var response = await _httpClient.GetAsync(url);
        response.EnsureSuccessStatusCode();

        return await response.Content.ReadAsStringAsync();
    }

    public async Task<string> CreateProyecto(string codigo, string nombre)
    {
        var url = $"{BaseUrl}/proyectos";
        var body = new { codigo, nombre, clasificacion = "Gestion interna" };
        var jsonContent = new StringContent(
            JsonConvert.SerializeObject(body),
            Encoding.UTF8,
            "application/json"
        );

        _httpClient.DefaultRequestHeaders.Clear();
        _httpClient.DefaultRequestHeaders.Add(
            "Authorization",
            $"Bearer {_accessToken}"
        );

        var response = await _httpClient.PostAsync(url, jsonContent);
        response.EnsureSuccessStatusCode();

        return await response.Content.ReadAsStringAsync();
    }
}

// Uso
class Program
{
    static async Task Main(string[] args)
    {
        var client = new SigpApiClient();

        // Login
        await client.Login("usuario@inei.gob.pe", "password123");

        // Obtener proyectos
        var proyectos = await client.GetProyectos();
        Console.WriteLine("Proyectos: " + proyectos);

        // Crear proyecto
        var nuevoProyecto = await client.CreateProyecto(
            "PRY006",
            "Nuevo Proyecto C#"
        );
        Console.WriteLine("Proyecto creado: " + nuevoProyecto);
    }
}
```

### Ejemplo 2: Con HttpClientFactory (Recomendado)

```csharp
using Microsoft.Extensions.DependencyInjection;
using System.Net.Http;

public class SigpApiClient
{
    private readonly HttpClient _httpClient;
    private const string BaseUrl = "http://localhost:3010/api/v1";

    public SigpApiClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
        _httpClient.BaseAddress = new Uri(BaseUrl);
    }

    public async Task<LoginResponse> LoginAsync(
        string email,
        string password
    )
    {
        var request = new { email, password };
        var response = await _httpClient.PostAsJsonAsync(
            "/auth/login",
            request
        );

        response.EnsureSuccessStatusCode();
        return await response.Content.ReadAsAsync<LoginResponse>();
    }

    public async Task<List<Proyecto>> GetProyectosAsync()
    {
        var response = await _httpClient.GetAsync("/proyectos");
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadAsAsync<List<Proyecto>>();
    }

    public async Task<Proyecto> CreateProyectoAsync(CreateProyectoRequest request)
    {
        var response = await _httpClient.PostAsJsonAsync("/proyectos", request);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadAsAsync<Proyecto>();
    }
}

// DTOs
public class LoginResponse
{
    public string AccessToken { get; set; }
    public string RefreshToken { get; set; }
    public User User { get; set; }
}

public class User
{
    public int Id { get; set; }
    public string Email { get; set; }
    public string Nombre { get; set; }
    public string Apellido { get; set; }
    public string Rol { get; set; }
}

public class Proyecto
{
    public int Id { get; set; }
    public string Codigo { get; set; }
    public string Nombre { get; set; }
    public string Estado { get; set; }
}

public class CreateProyectoRequest
{
    public string Codigo { get; set; }
    public string Nombre { get; set; }
    public string Clasificacion { get; set; }
}

// Configuración en Startup.cs
public void ConfigureServices(IServiceCollection services)
{
    services.AddHttpClient<SigpApiClient>()
        .ConfigureHttpClient(client =>
        {
            client.BaseAddress = new Uri("http://localhost:3010/api/v1");
            client.DefaultRequestHeaders.Add("Accept", "application/json");
        })
        .AddPolicyHandler(GetRetryPolicy())
        .AddPolicyHandler(GetCircuitBreakerPolicy());

    services.AddControllers();
}

// Uso en Controller
[ApiController]
[Route("api/[controller]")]
public class ProyectosController : ControllerBase
{
    private readonly SigpApiClient _sigpClient;

    public ProyectosController(SigpApiClient sigpClient)
    {
        _sigpClient = sigpClient;
    }

    [HttpGet]
    public async Task<IActionResult> GetProyectos()
    {
        var proyectos = await _sigpClient.GetProyectosAsync();
        return Ok(proyectos);
    }
}
```

---

## Notas Importantes

1. **Manejo de Errores**: Siempre captura excepciones y maneja errores apropiadamente
2. **Rate Limiting**: Implementa backoff exponencial para reintentos
3. **Seguridad**: Nunca incluyas tokens en logs o versión control
4. **CORS**: En desarrollo, el servidor puede requerir ajustes de CORS
5. **Timeouts**: Configura timeouts apropiados para operaciones de larga duración
6. **Validación**: Valida datos en el cliente antes de enviar al servidor

