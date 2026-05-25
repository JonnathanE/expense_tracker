# Expense Tracker

Aplicación full-stack para el seguimiento y gestión de gastos personales. El backend expone una API REST construida en Go y el frontend es una SPA en React. La autenticación se basa en JWT con un flujo de activación por email.

---

## Tabla de contenidos

- [Stack tecnológico](#stack-tecnológico)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Variables de entorno](#variables-de-entorno)
- [Levantar la base de datos](#levantar-la-base-de-datos)
- [Levantar el backend](#levantar-el-backend)
- [Levantar el frontend](#levantar-el-frontend)
- [Documentación de la API (Swagger)](#documentación-de-la-api-swagger)
- [Endpoints disponibles](#endpoints-disponibles)

---

## Stack tecnológico

| Capa       | Tecnología                                      |
|------------|-------------------------------------------------|
| Backend    | Go 1.26, chi, pgx/v5, golang-jwt, godotenv      |
| Frontend   | React 19, TypeScript 6, Vite 8, pnpm            |
| Base datos | PostgreSQL 17                                   |
| DevOps     | Docker / Docker Compose                         |

---

## Estructura del proyecto

```
expense_tracker/
├── docker-compose.yml        # Servicio de PostgreSQL
├── backend/
│   ├── cmd/api/main.go       # Entry point del servidor
│   ├── internal/
│   │   ├── config/           # Carga de variables de entorno
│   │   ├── db/               # Conexión a PostgreSQL (pgx pool)
│   │   ├── handler/          # Handlers HTTP
│   │   ├── middleware/        # Middlewares (auth JWT, etc.)
│   │   ├── model/            # Modelos de datos
│   │   └── service/          # Lógica de negocio
│   ├── migrations/
│   │   └── 001_init.sql      # Esquema inicial de la DB
│   ├── .env.example          # Plantilla de variables de entorno
│   └── go.mod
└── frontend/
    ├── src/
    │   ├── App.tsx
    │   └── main.tsx
    ├── index.html
    ├── vite.config.ts
    └── package.json
```

---

## Variables de entorno

El backend requiere un archivo `.env` en `backend/`. Puedes crear uno a partir del ejemplo:

```bash
cp backend/.env.example backend/.env
```

| Variable       | Descripción                                  | Valor por defecto                                                   |
|----------------|----------------------------------------------|---------------------------------------------------------------------|
| `PORT`         | Puerto en el que escucha el servidor         | `8080`                                                              |
| `DATABASE_URL` | Cadena de conexión a PostgreSQL              | `postgresql://expense_user:expense_pass@localhost:5432/expense_tracker` |
| `JWT_SECRET`   | Clave secreta para firmar tokens JWT         | *(debes cambiarlo)*                                                 |
| `FRONTEND_URL`    | URL del frontend (CORS y links de email)     | `http://localhost:5173`                                             |
| `SWAGGER_ENABLED` | Habilita la UI de Swagger (`true`/`false`)   | `false`                                                             |

---

## Levantar la base de datos

El archivo `docker-compose.yml` levanta un contenedor de PostgreSQL 17 con el esquema inicial ya aplicado.

```bash
# Iniciar el contenedor en segundo plano
docker compose up -d

# Verificar que el contenedor esté sano
docker compose ps

# Detener el contenedor
docker compose down

# Detener y eliminar el volumen de datos
docker compose down -v

# Verificar que las tablas se crearon correctamente
docker exec -it expense_tracker_db psql -U expense_user -d expense_tracker -c "\dt"

# Deberías ver:
List of relations
 Schema |     Name     | Type  |    Owner
--------+--------------+-------+-------------
 public | budgets      | table | expense_user
 public | categories   | table | expense_user
 public | transactions | table | expense_user
 public | users        | table | expense_user
```

La base de datos queda disponible en `localhost:5432` con las credenciales definidas en `docker-compose.yml`:

- **Usuario:** `expense_user`
- **Contraseña:** `expense_pass`
- **Base de datos:** `expense_tracker`

---

## Levantar el backend

Asegúrate de tener [Go 1.26+](https://go.dev/dl/) instalado y la base de datos corriendo.

```bash
# Desde la raíz del proyecto
cd backend

# Instalar dependencias
go mod download

# Iniciar el servidor
go run ./cmd/api
```

El servidor queda disponible en `http://localhost:8080`.

---

## Levantar el frontend

Asegúrate de tener [Node.js](https://nodejs.org/) y [pnpm](https://pnpm.io/) instalados.

```bash
# Desde la raíz del proyecto
cd frontend

# Instalar dependencias
pnpm install

# Iniciar el servidor de desarrollo
pnpm dev
```

La aplicación queda disponible en `http://localhost:5173`.

---

## Documentación de la API (Swagger)

La documentación interactiva se genera con [swaggo/swag](https://github.com/swaggo/swag) y se sirve automáticamente junto con el backend.

### Requisitos

Instala la herramienta `swag` si aún no la tienes:

```bash
go install github.com/swaggo/swag/cmd/swag@latest
```

### Habilitar Swagger

La UI solo se monta si la variable de entorno `SWAGGER_ENABLED=true` está definida. En producción omite esta variable o ponla en `false` para que la ruta `/swagger/*` no exista.

```bash
# backend/.env — entorno local/desarrollo
SWAGGER_ENABLED=true

# En producción: omitir la variable o dejarla en false
# SWAGGER_ENABLED=false
```

### Regenerar los docs

Ejecuta este comando desde la carpeta `backend/` cada vez que modifiques los comentarios de los handlers:

```bash
cd backend
swag init -g cmd/api/main.go -o docs
```

Esto actualiza los archivos `docs/docs.go`, `docs/swagger.json` y `docs/swagger.yaml`.

### Acceder a la UI

Con el backend corriendo (`go run ./cmd/api`), abre en el navegador:

```
http://localhost:8080/swagger/index.html
```

Desde ahí puedes explorar todos los endpoints, ver los modelos de request/response y probar las llamadas directamente. Para los endpoints protegidos, haz clic en **Authorize** e ingresa tu token con el formato:

```
Bearer <access_token>
```

---

## Endpoints disponibles

### Públicos

| Método | Ruta              | Descripción                              |
|--------|-------------------|------------------------------------------|
| `POST` | `/auth/register`  | Registro de usuario (envía email de activación) |
| `GET`  | `/auth/activate`  | Activación de cuenta por token de email  |
| `POST` | `/auth/login`     | Login, retorna JWT                       |
| `GET`  | `/health`         | Health check del servidor                |

### Protegidos (requieren `Authorization: Bearer <token>`)

| Método | Ruta  | Descripción                     |
|--------|-------|---------------------------------|
| `GET`  | `/me` | Retorna el ID del usuario autenticado |

---

## Conectarse a la DB DOCKER

```bash
docker exec -it expense_tracker_db psql -U expense_user -d expense_tracker
```

Eso te abre la consola interactiva de PostgreSQL. Desde ahí puedes correr cualquier query.

### Comandos útiles dentro de psql

```sql
-- Ver todas las tablas
\dt

-- Ver columnas de una tabla
\d users
\d categories
\d transactions
\d budgets
\d refresh_tokens

-- Salir
\q
```


### Selects por tabla

```sql
-- Usuarios
SELECT id, name, email, is_active, created_at FROM users;

-- Categorías
SELECT id, name, type, icon, color FROM categories;

-- Transacciones
SELECT id, amount, type, description, date FROM transactions;

-- Transacciones con nombre de categoría
SELECT t.id, t.amount, t.type, t.description, t.date, c.name AS category
FROM transactions t
LEFT JOIN categories c ON c.id = t.category_id
ORDER BY t.date DESC;

-- Presupuestos
SELECT id, amount, month FROM budgets;

-- Refresh tokens
SELECT id, user_id, token, expires_at, created_at FROM refresh_tokens;

```


### Sin entrar a la consola interactiva

Si prefieres correr un query directo desde la terminal sin abrir psql:

```bash
# Cualquier query
docker exec -it expense_tracker_db psql -U expense_user -d expense_tracker \
  -c "SELECT id, name, email, is_active FROM users;"

# Transacciones del mes actual
docker exec -it expense_tracker_db psql -U expense_user -d expense_tracker \
  -c "SELECT amount, type, description, date FROM transactions ORDER BY date DESC;"
```
