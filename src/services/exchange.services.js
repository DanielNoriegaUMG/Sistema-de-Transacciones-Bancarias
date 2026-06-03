const exchangeModel = require("../models/exchange.model");

/**
 * Convert amount from one currency to another
 * @param {number} amount - Amount in source currency
 * @param {string} fromCurrency - Source currency code (e.g., 'USD')
 * @param {string} toCurrency - Target currency code (e.g., 'GTQ')
 * @param {pool} client - Optional database client for transaction
 * @returns {Promise<number>} Converted amount
 */
const convert = async (amount, fromCurrency, toCurrency, client = null) => {
  if (fromCurrency === toCurrency) {
    return Number(amount);
  }

  const rate = await exchangeModel.getRate(fromCurrency, toCurrency, client);

  if (rate === null) {
    throw new Error(
      `No exchange rate found for ${fromCurrency} to ${toCurrency}. Please contact support.`,
    );
  }

  const converted = Number(amount) * Number(rate);
  return Math.round(converted * 100) / 100; // Round to 2 decimals
};

/**
 * Get conversion info with rate
 * @param {number} amount - Amount in source currency
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @param {pool} client - Optional database client for transaction
 * @returns {Promise<Object>} { originalAmount, convertedAmount, rate, fromCurrency, toCurrency }
 */
const getConversionInfo = async (amount, fromCurrency, toCurrency, client = null) => {
  if (fromCurrency === toCurrency) {
    return {
      originalAmount: Number(amount),
      convertedAmount: Number(amount),
      rate: 1,
      fromCurrency,
      toCurrency,
    };
  }

  const rate = await exchangeModel.getRate(fromCurrency, toCurrency, client);

  if (rate === null) {
    throw new Error(
      `No exchange rate found for ${fromCurrency} to ${toCurrency}. Please contact support.`,
    );
  }

  const convertedAmount = Math.round(Number(amount) * Number(rate) * 100) / 100;

  return {
    originalAmount: Number(amount),
    convertedAmount,
    rate: Number(rate),
    fromCurrency,
    toCurrency,
  };
};

module.exports = {
  convert,
  getConversionInfo,
};
