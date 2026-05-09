const pool = require("../config/db");

const findAllByUserId = async (userId) => {
  const result = await pool.query(
    `SELECT t.id,
            t.from_account_id,
            fa.account_number AS from_account_number,
            t.to_account_id,
            ta.account_number AS to_account_number,
            t.amount,
            t.description,
            t.status,
            t.created_at
     FROM transferencias t
     JOIN cuentas fa ON t.from_account_id = fa.id
     JOIN cuentas ta ON t.to_account_id = ta.id
     WHERE fa.user_id = $1 OR ta.user_id = $1
     ORDER BY t.created_at DESC`,
    [userId],
  );
  return result.rows;
};

const createTransfer = async (
  fromAccountId,
  toAccountId,
  amount,
  description,
  client = pool,
) => {
  const result = await client.query(
    `INSERT INTO transferencias (from_account_id, to_account_id, amount, description)
     VALUES ($1, $2, $3, $4)
     RETURNING id, from_account_id, to_account_id, amount, description, status, created_at`,
    [fromAccountId, toAccountId, amount, description],
  );
  return result.rows[0];
};

module.exports = {
  findAllByUserId,
  createTransfer,
};

