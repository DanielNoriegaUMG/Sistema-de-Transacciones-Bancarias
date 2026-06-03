const pool = require("../config/db");

const findAllByUserId = async (userId) => {
  const result = await pool.query(
    `SELECT t.id,
            t.from_account_id,
            fa.account_number AS from_account_number,
            COALESCE(t.from_currency, fa.currency) AS from_currency,
            t.to_account_id,
            ta.account_number AS to_account_number,
            COALESCE(t.to_currency, ta.currency) AS to_currency,
            t.amount,
            COALESCE(t.amount_received, t.amount) AS amount_received,
            COALESCE(t.exchange_rate, 1) AS exchange_rate,
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
  amountReceived,
  exchangeRate,
  fromCurrency,
  toCurrency,
  description,
  client = pool,
) => {
  const result = await client.query(
    `INSERT INTO transferencias (from_account_id, to_account_id, amount, amount_received, exchange_rate, from_currency, to_currency, description)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, from_account_id, to_account_id, amount, amount_received, exchange_rate, from_currency, to_currency, description, status, created_at`,
    [
      fromAccountId,
      toAccountId,
      amount,
      amountReceived,
      exchangeRate,
      fromCurrency,
      toCurrency,
      description,
    ],
  );
  return result.rows[0];
};

module.exports = {
  findAllByUserId,
  createTransfer,
};
