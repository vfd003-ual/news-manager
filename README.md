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

La aplicación sigue una arquitectura de microservicios con tres componentes principales:

### Frontend (Puerto 4000)
- Desarrollado con Angular 19
- Características:
  - SSR (Server-Side Rendering) para mejor SEO
  - Componentes standalone
  - Gestión de estado eficiente
  - Sistema de rutas protegidas
  - Interceptores para manejo de tokens

### Backend (Puerto 3000)
- Desarrollado con Node.js y Express
- Características:
  - API RESTful
  - Autenticación mediante JWT
  - Sistema de caché para optimizar peticiones
  - Middleware de autenticación
  - Proxy para NewsAPI
  - Integración con MongoDB

### Base de Datos
- MongoDB
- Almacena:
  - Información de usuarios
  - Preferencias
  - Noticias guardadas

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

## API Endpoints

### Autenticación
- `POST /api/auth/register`: Registro de nuevo usuario
  - Body: `{ name, email, password }`
- `POST /api/auth/login`: Inicio de sesión
  - Body: `{ email, password }`
- `GET /api/auth/user`: Obtiene información del usuario actual
- `PUT /api/auth/user`: Actualiza información del usuario
  - Body: `{ name, email, currentPassword?, newPassword? }`

### Noticias
- `GET /api/news`: Obtiene lista de noticias
  - Query params: `{ category, query }`
- `GET /api/news/local`: Obtiene noticias locales

### Preferencias
- `PUT /api/preferences/saved-news`: Guarda/elimina noticias
  - Body: `{ news: NewsItem, save: boolean }`
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

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
