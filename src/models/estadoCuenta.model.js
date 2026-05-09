const pool = require("../config/db");

const findAllByUserId = async (userId) => {
  const result = await pool.query(
    `SELECT ec.id,
            ec.cuenta_id,
            c.account_number,
            ec.amount,
            ec.type,
            ec.description,
            ec.balance_after,
            ec.created_at
     FROM estado_cuenta ec
     JOIN cuentas c ON ec.cuenta_id = c.id
     WHERE c.user_id = $1
     ORDER BY ec.created_at DESC`,
    [userId],
  );
  return result.rows;
};

const insertTransaction = async (
  cuentaId,
  amount,
  type,
  balanceAfter,
  description,
  client = pool,
) => {
  const result = await client.query(
    `INSERT INTO estado_cuenta (cuenta_id, amount, type, description, balance_after)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, cuenta_id, amount, type, description, balance_after, created_at`,
    [cuentaId, amount, type, description, balanceAfter],
  );
  return result.rows[0];
};

module.exports = {
  findAllByUserId,
  insertTransaction,
};

