// Consultas SQL para la tabla cuentas
const pool = require("../config/db");

/**
 * Retorna todas las cuentas que pertenecen a un usuario.
 */
const findAllByUser = async (userId) => {
  const { rows } = await pool.query(
    `SELECT id, account_number, alias, balance, currency, type, created_at
     FROM cuentas
     WHERE user_id = $1
     ORDER BY created_at ASC`,
    [userId],
  );
  return rows;
};

/**
 * Retorna una cuenta por id verificando que pertenezca al usuario.
 */
const findById = async (id, userId) => {
  const { rows } = await pool.query(
    `SELECT id, account_number, alias, balance, currency, type, created_at
     FROM cuentas
     WHERE id = $1 AND user_id = $2`,
    [id, userId],
  );
  return rows[0] || null;
};

/**
 * Verifica si un account_number ya existe (para garantizar unicidad antes de insertar).
 */
const existsByAccountNumber = async (accountNumber) => {
  const { rows } = await pool.query(
    "SELECT id FROM cuentas WHERE account_number = $1",
    [accountNumber],
  );
  return rows.length > 0;
};

/**
 * Inserta una nueva cuenta y retorna el registro creado.
 */
const create = async ({ userId, accountNumber, alias, currency, type }) => {
  const { rows } = await pool.query(
    `INSERT INTO cuentas (user_id, account_number, alias, balance, currency, type)
     VALUES ($1, $2, $3, 0.00, $4, $5)
     RETURNING id, account_number, alias, balance, currency, type, created_at`,
    [userId, accountNumber, alias || null, currency, type],
  );
  return rows[0];
};

module.exports = { findAllByUser, findById, existsByAccountNumber, create };
