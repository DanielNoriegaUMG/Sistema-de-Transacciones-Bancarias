const pool = require("../config/db");

const getRate = async (fromCurrency, toCurrency, client = pool) => {
  // If same currency, return rate of 1
  if (fromCurrency === toCurrency) {
    return 1;
  }

  const result = await client.query(
    `SELECT rate FROM exchange_rates 
     WHERE from_currency = $1 AND to_currency = $2`,
    [fromCurrency, toCurrency],
  );

  return result.rows[0]?.rate || null;
};

const getAllRates = async (client = pool) => {
  const result = await client.query("SELECT * FROM exchange_rates ORDER BY from_currency, to_currency");
  return result.rows;
};

const updateRate = async (fromCurrency, toCurrency, newRate, client = pool) => {
  const result = await client.query(
    `UPDATE exchange_rates 
     SET rate = $1, updated_at = current_timestamp
     WHERE from_currency = $2 AND to_currency = $3
     RETURNING *`,
    [newRate, fromCurrency, toCurrency],
  );
  return result.rows[0] || null;
};

module.exports = {
  getRate,
  getAllRates,
  updateRate,
};
