# BancoApp

Plataforma de banca digital. El proyecto es un monorepo con backend en Node.js/Express y frontend en React. El login ya está integrado con la API y PostgreSQL, y el resto de módulos siguen en desarrollo como placeholders.

---

## Requisitos previos

- Node.js v22.19.0 o superior
- npm v10 o superior
- PostgreSQL 14 o superior

---

## Estructura del proyecto

```
BANCO-APP/
│
├── server.js                          Entrada del servidor Express
├── package.json                       Dependencias y scripts del backend
├── .env                               Variables de entorno (no se versiona)
├── .env.example                       Plantilla de variables de entorno
│
├── src/
│   ├── config/
│   │   └── db.js                      Configuración del pool de PostgreSQL
│   │
│   ├── controllers/
│   │   ├── auth.controller.js         Recibe la petición HTTP y delega al service
│   │   ├── cuenta.controller.js
│   │   ├── estadoCuenta.controller.js
│   │   └── transferencia.controller.js
│   │
│   ├── middlewares/
│   │   └── auth.middleware.js         Valida el JWT en rutas protegidas
│   │
│   ├── models/
│   │   ├── auth.model.js              Consultas SQL de autenticación
│   │   ├── cuenta.model.js
│   │   ├── estadoCuenta.model.js
│   │   └── transferencia.model.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js             POST /api/auth/login, /logout y GET /api/auth/me
│   │   ├── accounts.routes.js         GET /api/accounts, /api/accounts/:id
│   │   ├── transfers.routes.js        GET y POST /api/transfers
│   │   └── transactions.routes.js     GET /api/transactions
│   │
│   ├── services/
│   │   ├── auth.services.js           Lógica de negocio de autenticación con PostgreSQL y JWT
│   │   ├── cuenta.services.js
│   │   ├── estadoCuenta.services.js
│   │   └── transferencia.services.js
│   │
│   └── utils/                         Utilitarios compartidos (pendiente de implementación)
│
└── client/                            Aplicación React (frontend)
    ├── package.json
    │
    ├── public/
    │   ├── index.html
    │   ├── favicon.ico
    │   ├── manifest.json
    │   └── robots.txt
    │
    └── src/
        ├── App.jsx                    Router principal con guards de autenticación
        ├── index.jsx                  Punto de entrada de React
        ├── index.css                  Variables CSS globales y reset
        │
        ├── components/
        │   ├── Sidebar.jsx            Navegación lateral y botón de cerrar sesión
        │   └── DevPlaceholder.jsx     Componente reutilizable para vistas en desarrollo
        │
        └── pages/
            ├── Login.jsx              Funcional — valida con backend real
            ├── Dashboard.jsx          Placeholder
            ├── Accounts.jsx           Placeholder
            ├── Transfers.jsx          Placeholder
            ├── Transactions.jsx       Placeholder
            └── Profile.jsx            Placeholder
```

---

## Instalacion y puesta en marcha

### 1. Clonar el repositorio y configurar variables de entorno

```bash
cp .env.example .env
```

Editar `.env` con los valores correspondientes al entorno local. Ver la seccion "Variables de entorno" mas adelante.

### 2. Instalar dependencias del backend

Ejecutar desde la raiz del proyecto:

```bash
npm install
```

### 3. Instalar dependencias del frontend

```bash
cd client
npm install
cd ..
```

### 4. Ejecutar en modo desarrollo

Se necesitan dos terminales abiertas de forma simultanea.

Terminal 1 — backend (puerto 5001):

```bash
npm run dev
```

Terminal 2 — frontend (puerto 3000):

```bash
cd client
npm start
```

La aplicacion queda disponible en `http://localhost:3000`.

---

## Variables de entorno

El archivo `.env` debe existir en la raiz del proyecto antes de ejecutar el servidor. Nunca se sube al repositorio.

```
PORT=5001
NODE_ENV=development
CLIENT_URL=http://localhost:3000
JWT_SECRET=clave_secreta_larga_y_aleatoria
JWT_EXPIRES_IN=24h

DB_HOST=localhost
DB_PORT=5432
DB_NAME=banco_db
DB_USER=postgres
DB_PASSWORD=tu_password
```

Las variables de base de datos no se usan en el MVP actual. Estan preparadas para la siguiente fase.

---

## Credenciales de prueba (MVP)

El login ahora se conecta a la base de datos PostgreSQL. Las credenciales de prueba están definidas en la migración inicial.

```
Usuario:    admin
Contrasena: admin123
```

Estas credenciales se pueden cambiar editando la migración o agregando nuevos usuarios directamente en la base de datos.

---

## Flujo de autenticacion actual

1. El usuario ingresa credenciales en `client/src/pages/Login.jsx`.
2. El frontend envía una petición POST a `/api/auth/login` con las credenciales.
3. El backend valida contra la base de datos PostgreSQL usando bcrypt para el hash de contraseña.
4. Si son correctas, el backend genera un JWT y lo devuelve junto con los datos del usuario.
5. El frontend guarda `banco_token` (JWT) y `banco_user` en `localStorage`.
6. `App.jsx` tiene un componente `PrivateRoute` que verifica la existencia de `banco_token` antes de renderizar cualquier ruta protegida. Si no existe, redirige a `/login`.
7. El `Sidebar.jsx` tiene el boton de cerrar sesion que borra ambas entradas del `localStorage` y redirige a `/login`.
8. Las rutas protegidas usan el middleware `auth.middleware.js` que valida el JWT en el header `Authorization: Bearer <token>`.

---

## API endpoints disponibles

Todos los endpoints del backend responden en formato JSON con la estructura:

```json
{
  "success": true,
  "message": "descripcion",
  "data": {}
}
```

### Publicos (sin token)

| Metodo | Ruta            | Descripcion         |
| ------ | --------------- | ------------------- |
| POST   | /api/auth/login | Iniciar sesion      |
| GET    | /api/health     | Estado del servidor |

### Protegidos (requieren header `Authorization: Bearer <token>`)

| Metodo | Ruta              | Descripcion                   |
| ------ | ----------------- | ----------------------------- |
| POST   | /api/auth/logout  | Cerrar sesion                 |
| GET    | /api/auth/me      | Datos del usuario autenticado |
| GET    | /api/accounts     | Listar cuentas                |
| GET    | /api/accounts/:id | Detalle de una cuenta         |
| GET    | /api/transfers    | Listar transferencias         |
| POST   | /api/transfers    | Crear transferencia           |
| GET    | /api/transactions | Listar movimientos            |

---

## Estado actual de los modulos

| Modulo           | Backend                        | Frontend                   |
| ---------------- | Funcional con BD PostgreSQL    | Funcional con API          |
| Logout           | Ruta implementada              | Funcional (borra token)    |
| Auth middleware  | Implementado (valida JWT)      | Guard en App.jsx           |
| Dashboard        | Sin implementar                | Placeholder                |
| Cuentas          | Placeholder (retorna array []) | Placeholder                |
| Transferencias   | Placeholder (retorna array []) | Placeholder                |
| Estado de cuenta | Placeholder (retorna array []) | Placeholder                |
| Perfil / Ajustes | Sin ruta                       | Placeholder                |
| Base de datos    | Conectado a PostgreSQL         | Placeholder                |
| Base de datos    | Pool configurado, sin conectar | No aplica                  |

---

## Como implementar un modulo nuevo (ejemplo: Cuentas)

Seguir este orden para mantener consistencia con la arquitectura del proyecto.

### Paso 1 — Model

Abrir `src/models/cuenta.model.js`. Las consultas SQL ya estan escritas y comentadas. Descomentar y ajustar segun el esquema real de la base de datos:

```js
const pool = require("../config/db");

const findAllByUser = async (userId) => {
  const { rows } = await pool.query(
    "SELECT * FROM cuentas WHERE usuario_id = $1",
    [userId],
  );
  return rows;
};

const findById = async (id, userId) => {
  const { rows } = await pool.query(
    "SELECT * FROM cuentas WHERE id = $1 AND usuario_id = $2",
    [id, userId],
  );
  return rows[0] || null;
};

module.exports = { findAllByUser, findById };
```

### Paso 2 — Service

Abrir `src/services/cuenta.services.js` y reemplazar las respuestas simuladas por llamadas al model:

```js
const cuentaModel = require("../models/cuenta.model");

const getAll = async (user) => {
  const data = await cuentaModel.findAllByUser(user.id);
  return { success: true, data };
};

const getById = async (id, user) => {
  const data = await cuentaModel.findById(id, user.id);
  if (!data) return { success: false, message: "Cuenta no encontrada." };
  return { success: true, data };
};

module.exports = { getAll, getById };
```

### Paso 3 — Controller

`src/controllers/cuenta.controller.js` ya esta implementado y llama al service. No requiere cambios salvo que se agreguen nuevas acciones (crear, actualizar, eliminar).

### Paso 4 — Route

`src/routes/accounts.routes.js` ya esta registrado en `server.js` y tiene las rutas GET definidas. Agregar rutas adicionales si el modulo lo requiere:

```js
router.post("/", cuentaController.create);
router.put("/:id", cuentaController.update);
router.delete("/:id", cuentaController.remove);
```

### Paso 5 — Frontend

Abrir `client/src/pages/Accounts.jsx` y reemplazar el componente `DevPlaceholder` por la vista real. El token disponible en `localStorage` con la clave `banco_token` debe enviarse en el header de cada peticion al backend:

```js
const token = localStorage.getItem("banco_token");

const response = await fetch("/api/accounts", {
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});

const data = await response.json();
```

La URL base no necesita incluir el host en desarrollo porque `client/package.json` tiene configurado "proxy": "http://localhost:5001", lo que redirige automaticamente todas las peticiones a `/api/*` al backend.

---

## Como conectar la base de datos

### Paso 1 — Configurar variables de entorno

Completar los valores de base de datos en el archivo `.env`:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=banco_db
DB_USER=postgres
DB_PASSWORD=tu_password
```

### Paso 2 — Activar el pool en db.js

`src/config/db.js` ya esta configurado. El pool se conecta automaticamente cuando cualquier model lo importe. No requiere cambios.

### Paso 3 — Activar el middleware de JWT real

En `src/middlewares/auth.middleware.js` el token simulado `simulated-token-admin` esta hardcodeado como caso especial. Cuando la autenticacion real este lista, eliminar ese bloque:

```js
// Eliminar este bloque cuando la BD este activa:
if (token === "simulated-token-admin") {
  req.user = { id: 1, username: "admin", name: "Administrador", role: "admin" };
  return next();
}
```

### Paso 4 — Activar el service de autenticacion

En `src/services/auth.services.js`, reemplazar la validacion contra `TEST_USER` por una consulta real:

```js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authModel = require("../models/auth.model");

const login = async (username, password) => {
  const user = await authModel.findByUsername(username);
  if (!user) return { success: false, message: "Credenciales incorrectas." };

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return { success: false, message: "Credenciales incorrectas." };

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "24h" },
  );

  return {
    success: true,
    token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    },
  };
};

module.exports = { login };
```

### Paso 5 — Actualizar el frontend para consumir el backend real

En `client/src/pages/Login.jsx`, reemplazar la validacion local por una llamada al endpoint:

```js
const response = await fetch("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username: form.username, password: form.password }),
});

const data = await response.json();

if (data.success) {
  localStorage.setItem("banco_token", data.token);
  localStorage.setItem("banco_user", JSON.stringify(data.user));
  navigate("/dashboard", { replace: true });
} else {
  setError(data.message);
}
```

---

## Convencion de commits

```
feat:     nueva funcionalidad
fix:      correccion de bug
refactor: cambio de codigo sin nueva funcionalidad ni correccion
docs:     cambios en documentacion
chore:    tareas de configuracion o dependencias
```

Ejemplos:

```
feat: implementar listado de cuentas con paginacion
fix: corregir validacion de token expirado en auth middleware
docs: actualizar README con instrucciones de base de datos
```

---

## Convencion de ramas

```
main          rama de produccion, solo merge desde develop
develop       integracion de features completadas
feature/nombre-descriptivo    nueva funcionalidad
fix/nombre-descriptivo        correccion de bug
```

---

## Scripts disponibles

Desde la raiz del proyecto (backend):

| Comando     | Descripcion                            |
| ----------- | -------------------------------------- |
| npm start   | Inicia el servidor con node            |
| npm run dev | Inicia el servidor con nodemon (watch) |

Desde `client/` (frontend):

| Comando       | Descripcion                            |
| ------------- | -------------------------------------- |
| npm start     | Inicia el servidor de desarrollo React |
| npm run build | Genera el build de produccion          |

---

## Notas importantes para el equipo

**No modificar `client/public/`** sin revisar que los archivos `favicon.ico`, `manifest.json` y `robots.txt` permanezcan presentes. Si alguno de estos archivos no existe, CRA intenta proxiarlos al backend y genera errores `ECONNREFUSED` en consola cuando el backend no esta corriendo.

**El proxy de desarrollo** esta configurado en `client/package.json` con "proxy": "http://localhost:5001". Esto significa que en desarrollo todas las peticiones a rutas que empiezan con `/api` se redirigen automaticamente al backend. En produccion esto no aplica; el servidor Express sirve el build de React directamente.

**Los modelos tienen las consultas SQL comentadas** y listas para activarse. No reescribir los modelos desde cero, solo descomentar y ajustar al esquema de la base de datos que se defina.

**Las variables de CSS** del frontend estan centralizadas en `client/src/index.css`. Usar siempre las variables definidas (`--navy-900`, `--accent-gold`, `--surface`, etc.) en lugar de valores hexadecimales directos para mantener consistencia visual.
