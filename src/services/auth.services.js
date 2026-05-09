// ── Usuario de prueba (MVP sin BD) ────────────────────────────
// Cuando se conecte la BD, reemplazar esta constante por una consulta a auth.model.js usando el pool de PostgreSQL.
const TEST_USER = {
  id: 1,
  username: "admin",
  password: "admin123",
  name: "Administrador",
  email: "admin@banco.com",
  role: "admin",
};

const SIMULATED_TOKEN = "simulated-token-admin";

const login = async (username, password) => {
  // ── Fase MVP: validación en memoria ──────────────────────────
  if (username === TEST_USER.username && password === TEST_USER.password) {
    return {
      success: true,
      message: "Sesión iniciada correctamente.",
      token: SIMULATED_TOKEN,
      user: {
        id: TEST_USER.id,
        username: TEST_USER.username,
        name: TEST_USER.name,
        email: TEST_USER.email,
        role: TEST_USER.role,
      },
    };
  }

  return {
    success: false,
    message: "Credenciales incorrectas. Verifique su usuario y contraseña.",
  };
};

module.exports = { login };
