const pool = require("../config/db");

const findAllByUserId = async (userId) => {
  const result = await pool.query(
    `SELECT id, account_number, alias, balance, currency, type
     FROM cuentas
     WHERE user_id = $1
     ORDER BY id`,
    [userId],
  );
  return result.rows;
};

const findById = async (id, client = pool) => {
  const result = await client.query(
    `SELECT id, user_id, account_number, alias, balance, currency, type
     FROM cuentas
     WHERE id = $1`,
    [id],
  );
  return result.rows[0] || null;
};

const updateBalance = async (id, newBalance, client = pool) => {
  const result = await client.query(
    `UPDATE cuentas SET balance = $1 WHERE id = $2 RETURNING id, account_number, alias, balance, currency, type`,
    [newBalance, id],
  );
  return result.rows[0] || null;
};

module.exports = {
  findAllByUserId,
  findById,
  updateBalance,
};

