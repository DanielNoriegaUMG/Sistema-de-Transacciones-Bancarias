// Consultas SQL para autenticación contra la tabla users
const pool = require("../config/db");

/**
 * Busca un usuario por username. Retorna el registro completo incluyendo
 * password_hash para que el service pueda verificarlo con bcrypt.
 */
const findByUsername = async (username) => {
  const { rows } = await pool.query(
    "SELECT id, username, password_hash, name, email, role FROM users WHERE username = $1 LIMIT 1",
    [username],
  );
  return rows[0] || null;
};

module.exports = { findByUsername };
