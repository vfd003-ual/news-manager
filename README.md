# NewsManager

NewsManager es una aplicación web moderna para la gestión y personalización de noticias. Permite a los usuarios ver, filtrar, y guardar noticias de diversas fuentes, con una interfaz intuitiva y responsive.

## Características Principales

- Autenticación de usuarios (registro, inicio de sesión)
- Visualización de noticias con filtros por categoría y fuente
- Guardado de noticias favoritas
- Perfil de usuario personalizable
- Interfaz responsive y moderna
- Sistema de caché para optimizar las peticiones a la API de noticias

## Requisitos Previos

Para ejecutar la aplicación necesitas tener instalado:

- Node.js (v18 o superior)
- Docker y Docker Compose
- Variables de entorno configuradas:
  - `JWT_SECRET`: Clave secreta para JWT
  - `NEWS_API_KEY`: API key de NewsAPI
  - `NEWS_API_URL`: URL base de NewsAPI

## Arquitectura

La aplicación implementa una arquitectura de microservicios moderna y escalable, con énfasis en la separación de responsabilidades y la mantenibilidad del código.

### Diagrama de Arquitectura

```mermaid
graph TB
    subgraph "Contenedores Docker"
        subgraph "Frontend Container"
            A[Usuario] --> B[Angular Frontend]
            B --> C[Componentes Standalone]
            B --> D[Servicios]
            B --> E[Guards & Interceptores]
        end

        subgraph "Backend Container"
            F[Express Server] --> G[Controladores]
            F --> H[Middlewares]
            F --> I[Servicios]
            I --> J[Cache Layer]
            I --> W[Web Scraping Service]
        end

        subgraph "MongoDB Container"
            L[MongoDB]
        end
    end

    subgraph "Servicios Externos"
        K[NewsAPI]
        S[Sitios Web]
    end

    B -- HTTP/JWT --> F
    I -- HTTP --> K
    W -- Axios/Cheerio --> S
    F -- Mongoose --> L
    J -- Cache --> I

    %% Docker Compose gestiona la red entre contenedores
    classDef container fill:#e1f5fe,stroke:#01579b
    class Cliente,Backend,MongoDB container
```

### Infraestructura Docker

#### Contenedores
- **Frontend Container**: Servidor Angular con SSR
  - Nginx como servidor web
  - Optimización y compresión de assets
  - Caché de estáticos

- **Backend Container**: Servidor Node.js
  - Express como framework web
  - Servicios y controladores
  - Sistema de caché
  - Web Scraping con Axios/Cheerio

- **MongoDB Container**: Base de datos
  - Persistencia en volumen Docker
  - Configuración optimizada
  - Backups automatizados

#### Características
- Network Bridge dedicada
- Volúmenes para persistencia
- Variables de entorno securizadas
- Healthchecks configurados
- Reinicio automático
- Logs centralizados


### Frontend (Puerto 4000)
Desarrollado con Angular 19, implementa una arquitectura moderna basada en componentes.

#### Componentes Principales
- **Módulo Core**: Servicios singleton y componentes globales
- **Módulos Feature**: Funcionalidades específicas modularizadas
- **Componentes Standalone**: Arquitectura modular y eficiente

#### Características Técnicas
- **Server-Side Rendering (SSR)**: Mejora SEO y rendimiento inicial
- **Lazy Loading**: Carga bajo demanda de módulos
- **State Management**: Gestión reactiva del estado con RxJS
- **Interceptores HTTP**: Manejo centralizado de peticiones
- **Guards**: Protección de rutas y autorización

### Backend (Puerto 3000)
Servidor Node.js con Express, siguiendo principios REST y clean architecture.

#### Capas de la Aplicación
- **Controllers**: Manejo de requests y responses
- **Services**: Lógica de negocio y operaciones
  - NewsService: Gestión de noticias y caché
  - ScrapingService: Web scraping de fuentes alternativas
  - AuthService: Autenticación y autorización
- **Models**: Esquemas y validación de datos
- **Middleware**: Procesamiento de peticiones
- **Utils**: Funciones auxiliares y helpers

#### Características Técnicas
- **RESTful API**: Endpoints bien definidos y documentados
- **JWT Authentication**: Seguridad basada en tokens
- **Caching Layer**: Sistema de caché para optimizar peticiones
- **Rate Limiting**: Control de frecuencia de peticiones
- **Error Handling**: Gestión centralizada de errores
- **API Proxy**: Intermediario para NewsAPI

#### Web Scraping Service
- **Tecnologías**:
  - Axios: Cliente HTTP para peticiones
  - Cheerio: Parsing y manipulación DOM
  - Queue: Sistema de colas para requests
- **Funcionalidades**:
  - Extracción de noticias de múltiples fuentes
  - Normalización de datos
  - Gestión de rate limiting
  - Manejo de errores y reintentos
  - Caché de resultados

### Base de Datos (MongoDB)
Sistema de persistencia NoSQL con esquemas flexibles.

#### Características
- **Schemas**: Modelos de datos estructurados
- **Índices**: Optimización de consultas frecuentes
- **Relaciones**: Referencias entre colecciones
- **Transacciones**: Operaciones atómicas cuando necesario

#### Colecciones Principales
- **Users**: Información de usuarios y autenticación
- **SavedNews**: Noticias guardadas por usuarios
- **Preferences**: Configuraciones de usuario

### Comunicación entre Servicios
- **API REST**: Comunicación cliente-servidor
- **JWT**: Tokens de autenticación
- **HTTP/HTTPS**: Protocolo de comunicación
- **WebSockets** (planificado): Para actualizaciones en tiempo real

## Instalación y Ejecución

1. Clonar el repositorio
2. Configurar las variables de entorno en un archivo `.env`
3. Ejecutar con Docker Compose:
```bash
docker-compose up --build
```

La aplicación estará disponible en:
- Frontend: http://localhost:4000
- Backend API: http://localhost:3000

## Desarrollo

Para desarrollo local sin Docker:

### Frontend
```bash
cd frontend
npm install
ng serve
```
El frontend estará disponible en http://localhost:4200

### Backend
```bash
cd backend
npm install
npm run dev
```
El backend estará disponible en http://localhost:3000

### Base de Datos
Asegúrate de tener MongoDB ejecutándose localmente o ajusta la variable de entorno `MONGODB_URI` para apuntar a tu instancia de MongoDB.

## Scripts Disponibles

### Frontend
- `ng serve`: Inicia el servidor de desarrollo
- `ng build`: Compila el proyecto
- `ng test`: Ejecuta los tests unitarios
- `ng e2e`: Ejecuta los tests end-to-end

### Backend
- `npm run dev`: Inicia el servidor en modo desarrollo con nodemon
- `npm start`: Inicia el servidor en modo producción
- `npm test`: Ejecuta los tests

## Estructura del Proyecto

```
news-manager/
├── frontend/                # Aplicación Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/ # Componentes de la aplicación
│   │   │   ├── services/   # Servicios
│   │   │   ├── models/     # Interfaces y tipos
│   │   │   └── guards/     # Guards de rutas
│   └── ...
├── backend/                 # Servidor Node.js
│   ├── config/             # Configuración
│   ├── controllers/        # Controladores
│   ├── middleware/         # Middleware
│   ├── models/            # Modelos de datos
│   ├── routes/            # Rutas de la API
│   └── services/          # Servicios
└── docker-compose.yml     # Configuración de Docker
```
## Modelo de Datos

La aplicación implementa una estructura de datos relacional donde los usuarios pueden guardar múltiples noticias, similar a una relación "uno a muchos".

### Diagrama de Relaciones

```mermaid
classDiagram
    class User {
        +ObjectId _id
        +String name
        +String email
        +String password
        +Date createdAt
        +guardarNoticia()
        +eliminarNoticia()
    }

    class SavedNews {
        +String url
        +String title
        +String description
        +Date publishedAt
        +String source.name
        +String urlToImage
        +Date savedAt
    }

    class News {
        +String source.id
        +String source.name
        +String author
        +String title
        +String description
        +String url
        +String urlToImage
        +String publishedAt
        +String content
        +Boolean isSaved
        +Boolean isLocal
    }

    User "1" --> "*" SavedNews : tiene
    SavedNews --|> News : hereda de
```

### Tablas de Modelo de Datos

#### Usuario (User)

| Campo      | Tipo     | Descripción                    | Requerido |
|------------|----------|--------------------------------|-----------|
| _id        | ObjectId | ID único de MongoDB           | Sí        |
| name       | String   | Nombre del usuario            | Sí        |
| email      | String   | Email único del usuario       | Sí        |
| password   | String   | Contraseña hasheada          | Sí        |
| createdAt  | Date     | Fecha de creación            | Sí        |

#### Noticia Guardada (SavedNews)

| Campo       | Tipo     | Descripción                   | Requerido |
|------------|----------|-------------------------------|-----------|
| url        | String   | URL única de la noticia      | Sí        |
| title      | String   | Título de la noticia         | Sí        |
| description| String   | Descripción del contenido    | No        |
| publishedAt| Date     | Fecha de publicación        | Sí        |
| source.name| String   | Nombre de la fuente         | Sí        |
| urlToImage | String   | URL de la imagen            | No        |
| savedAt    | Date     | Fecha de guardado           | Sí        |

#### Noticia (News)

| Campo       | Tipo     | Descripción                   | Requerido |
|------------|----------|-------------------------------|-----------|
| source.id  | String   | ID de la fuente             | No        |
| source.name| String   | Nombre de la fuente         | Sí        |
| author     | String   | Autor del artículo          | No        |
| title      | String   | Título del artículo         | Sí        |
| description| String   | Descripción corta           | No        |
| url        | String   | URL única del artículo      | Sí        |
| urlToImage | String   | URL de la imagen            | No        |
| publishedAt| String   | Fecha de publicación        | Sí        |
| content    | String   | Contenido completo          | No        |
| isSaved    | Boolean  | Estado de guardado          | No        |
| isLocal    | Boolean  | Es noticia local            | No        |

### Relaciones y Cardinalidad

- Un **Usuario** puede guardar múltiples **Noticias** (1:N)
- Cada **Noticia Guardada** pertenece a un único **Usuario** (N:1)
- Las **Noticias Guardadas** heredan propiedades del modelo **Noticia**

## Patrones de Diseño

### Patrón Repository
- Implementado en `ScrapingService` y `NewsService`
- Abstrae el acceso a datos y la lógica de negocio
- Proporciona una interfaz unificada para acceder a los datos
- Facilita el cambio de fuentes de datos sin afectar la lógica de negocio

### Patrón Observer
- Utilizado en servicios Angular (`NewsService`, `AuthService`)
- Implementa comunicación reactiva entre componentes
- Gestiona actualizaciones en tiempo real
- Maneja el estado de la aplicación de forma eficiente

### Patrón Factory
- Usado en la creación de instancias de noticias y usuarios
- Centraliza la lógica de creación de objetos
- Facilita la modificación de la lógica de creación

### Patrón Middleware
- Implementado en el backend para autenticación y validación
- Procesa las solicitudes HTTP de forma secuencial
- Permite la reutilización de lógica común

## API Endpoints

### Autenticación
- `POST /api/auth/register`: Registro de usuario
- `POST /api/auth/login`: Inicio de sesión
- `GET /api/auth/user`: Obtiene datos del usuario
- `PUT /api/auth/user`: Actualiza datos del usuario

### Noticias
- `GET /api/news`: Lista de noticias con filtros
- `GET /api/news/local`: Noticias locales

### Preferencias
- `PUT /api/preferences/saved-news`: Gestiona noticias guardadas
- `GET /api/preferences/saved-news`: Obtiene noticias guardadas

## Seguridad

La aplicación implementa varias capas de seguridad:

### Frontend
- Guards de autenticación para rutas protegidas
- Interceptores HTTP para tokens JWT
- Saneamiento de datos y protección XSS
- CSRF protection

### Backend
- Autenticación basada en JWT
- Middleware de autenticación para rutas protegidas
- Rate limiting
- CORS configurado
- Sanitización de entrada
- Validación de datos

### Docker
- Contenedores sin privilegios root
- Healthchecks implementados
- Secrets management
- Volúmenes para persistencia segura
- Network isolation

