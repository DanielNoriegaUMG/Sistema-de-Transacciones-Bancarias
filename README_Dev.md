# BancoApp

Plataforma de banca digital con login integrado, gestión de cuentas, transferencias y estado de cuenta en tiempo real. Backend en Node.js/Express con PostgreSQL, frontend en React con autenticación JWT centralizada.

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
├── server.js                          Entrada del servidor Express con error handler global
├── package.json                       Dependencias y scripts del backend
├── .env                               Variables de entorno (no se versiona)
│
├── src/
│   ├── config/
│   │   └── db.js                      Configuración del pool de PostgreSQL
│   │
│   ├── controllers/
│   │   ├── auth.controller.js         Delegación de lógica con manejo centralizado de errores
│   │   ├── cuenta.controller.js
│   │   ├── estadoCuenta.controller.js
│   │   └── transferencia.controller.js
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js         Validación de JWT en rutas protegidas
│   │   ├── error.middleware.js        Captura global de errores con respuestas consistentes
│   │   └── validation.middleware.js   Validación de requests con express-validator
│   │
│   ├── models/
│   │   ├── auth.model.js              Consultas SQL de autenticación
│   │   ├── cuenta.model.js
│   │   ├── estadoCuenta.model.js
│   │   └── transferencia.model.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js             POST /api/auth/login, /logout y GET /api/auth/me (con validación)
│   │   ├── accounts.routes.js         GET /api/accounts, /api/accounts/:id (con validación)
│   │   ├── transfers.routes.js        GET y POST /api/transfers (con validación de monto, cuentas)
│   │   └── transactions.routes.js     GET /api/transactions
│   │
│   ├── services/
│   │   ├── auth.services.js           Lógica de negocio con JWT y bcrypt
│   │   ├── cuenta.services.js
│   │   ├── estadoCuenta.services.js
│   │   └── transferencia.services.js  Transacciones ACID con rollback
│   │
│   └── utils/                         Utilitarios compartidos (pendiente)
│
└── client/                            Aplicación React con auth centralizado
    ├── package.json
    │
    ├── public/
    │   ├── index.html
    │   ├── favicon.ico
    │   ├── manifest.json
    │   └── robots.txt
    │
    └── src/
        ├── App.jsx                    Router con guards, ErrorBoundary y AuthProvider
        ├── index.jsx                  Punto de entrada de React
        ├── index.css                  Variables CSS globales y reset
        ├── api.js                     Helper centralizado para peticiones HTTP con token
        │
        ├── components/
        │   ├── Sidebar.jsx            Navegación lateral con logout
        │   ├── ErrorBoundary.jsx      Captura errores de renderizado
        │   └── DevPlaceholder.jsx     Componente reutilizable para desarrollo
        │
        ├── context/
        │   └── AuthContext.jsx        Context global de autenticación, login y logout
        │
        └── pages/
            ├── Login.jsx              Funcional — auténtica contra API real
            ├── Dashboard.jsx          Funcional — resumen de cuentas y actividad reciente
            ├── Accounts.jsx           Funcional — listado de cuentas con saldos
            ├── Transfers.jsx          Funcional — formulario de transferencias
            ├── Transactions.jsx       Funcional — estado de cuenta con filtros
            └── Profile.jsx            Funcional — datos del usuario
```

---

## Instalación y puesta en marcha

### 1. Clonar el repositorio y configurar variables de entorno

```bash
cp .env.example .env
```

Editar `.env` con los valores correspondientes al entorno local.

### 2. Instalar dependencias del backend

Ejecutar desde la raíz del proyecto:

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

Se necesitan dos terminales abiertas de forma simultánea.

**Terminal 1 — backend (puerto 5001):**

```bash
npm run dev
```

**Terminal 2 — frontend (puerto 3001):**

```bash
cd client
npm start
```

La aplicación queda disponible en `http://localhost:3001`. El frontend proxy al backend en `http://localhost:5001`.

---

## Variables de entorno

El archivo `.env` debe existir en la raíz del proyecto. Nunca se sube al repositorio.

```
PORT=5001
NODE_ENV=development
CLIENT_URL=http://localhost:3001
JWT_SECRET=clave_secreta_larga_y_aleatoria
JWT_EXPIRES_IN=8h

DB_HOST=localhost
DB_PORT=5432
DB_NAME=banco_db
DB_USER=postgres
DB_PASSWORD=tu_password
```

---

## Credenciales de prueba

```
Usuario:    admin
Contraseña: admin123
```

---

## Características implementadas

### Backend
- ✅ Autenticación con JWT y bcrypt
- ✅ Middleware de error global con respuestas consistentes
- ✅ Validación de requests con express-validator
- ✅ Rutas protegidas con autenticación
- ✅ Manejo transaccional de transferencias
- ✅ API RESTful con estructura MVC

### Frontend
- ✅ Auth context centralizado
- ✅ Helper de API con manejo automático de token y 401
- ✅ Logout automático en 401 (sesión expirada)
- ✅ ErrorBoundary para capturar errores de renderizado
- ✅ Dashboard con resumen de cuentas
- ✅ Gestión de cuentas
- ✅ Formulario de transferencias
- ✅ Estado de cuenta con filtros
- ✅ Perfil de usuario

---

## Flujo de autenticación

1. Usuario ingresa credenciales en `/login`.
2. Frontend POST a `/api/auth/login`.
3. Backend valida contra PostgreSQL con bcrypt.
4. Si es correcto, devuelve JWT y datos del usuario.
5. Frontend guarda `banco_token` y `banco_user` en `localStorage`.
6. `App.jsx` renderiza `AuthProvider` que mantiene el contexto de auth.
7. `PrivateRoute` verifica `token` antes de renderizar.
8. Páginas usan `useAuth()` para obtener `logout()` y manejar 401.
9. `api.js` incluye automáticamente el token en el header `Authorization: Bearer <token>`.
10. Si la respuesta es 401, marca el error como `unauthorized` y la página hace logout.

---

## API endpoints

Todos responden con estructura:

```json
{
  "success": true,
  "message": "descripción",
  "data": {}
}
```

### Públicos

| Método | Ruta            |
| ------ | --------------- |
| POST   | /api/auth/login |
| GET    | /api/health     |

### Protegidos

| Método | Ruta              | Descripción                           |
| ------ | ----------------- | ------------------------------------- |
| GET    | /api/auth/me      | Datos del usuario autenticado         |
| POST   | /api/auth/logout  | Cerrar sesión                         |
| GET    | /api/accounts     | Listado de cuentas del usuario        |
| GET    | /api/accounts/:id | Detalles de una cuenta específica      |
| GET    | /api/transfers    | Listado de transferencias del usuario |
| POST   | /api/transfers    | Realizar una transferencia            |
| GET    | /api/transactions | Movimientos de todas las cuentas      |

---

## Validación de requests

Las rutas principales validan:

- **Login:** usuario y contraseña requeridos
- **Transfers:** IDs válidos, monto positivo, cuentas diferentes
- **Accounts:** ID válido como parámetro

Las validaciones rechazan con estado 422 y detalles del error.

---

## Siguientes pasos

- [ ] Tests backend (Jest + Supertest)
- [ ] Tests frontend (React Testing Library)
- [ ] Linting y formateo (Prettier)
- [ ] Documentación de API (Swagger)
- [ ] Notificaciones de transferencias
- [ ] Historial de transferencias por fecha
- [ ] Edición de perfil
- [ ] Cambio de contraseña

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
