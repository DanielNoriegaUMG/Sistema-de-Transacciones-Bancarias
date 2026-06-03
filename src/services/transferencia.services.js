const pool = require("../config/db");
const cuentaModel = require("../models/cuenta.model");
const transferenciaModel = require("../models/transferencia.model");
const estadoCuentaModel = require("../models/estadoCuenta.model");
const exchangeServices = require("./exchange.services");

const roundCurrency = (value) => Math.round(Number(value) * 100) / 100;

const getAll = async (user) => {
  const transfers = await transferenciaModel.findAllByUserId(user.id);
  return {
    success: true,
    message: "Transferencias obtenidas correctamente.",
    data: transfers,
  };
};

const create = async (body, user) => {
  const { fromAccountId, toAccountId, amount, description = "" } = body;
  const parsedAmount = Number(amount);

  if (!fromAccountId || !toAccountId || !parsedAmount || parsedAmount <= 0) {
    return {
      success: false,
      message: "Datos de transferencia inválidos.",
      data: null,
    };
  }

  if (fromAccountId === toAccountId) {
    return {
      success: false,
      message: "La cuenta de origen y destino no pueden ser la misma.",
      data: null,
    };
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const fromAccount = await cuentaModel.findById(fromAccountId, client);
    const toAccount = await cuentaModel.findById(toAccountId, client);

    if (!fromAccount || !toAccount) {
      await client.query("ROLLBACK");
      return {
        success: false,
        message: "Alguna de las cuentas no existe.",
        data: null,
      };
    }

    if (fromAccount.user_id !== user.id) {
      await client.query("ROLLBACK");
      return {
        success: false,
        message: "No autorizado para mover fondos desde la cuenta de origen.",
        data: null,
      };
    }

    if (Number(fromAccount.balance) < parsedAmount) {
      await client.query("ROLLBACK");
      return {
        success: false,
        message: "Fondos insuficientes en la cuenta de origen.",
        data: null,
      };
    }

    // Convert amount if currencies are different
    let amountReceived = parsedAmount;
    let exchangeRate = 1;

    if (fromAccount.currency !== toAccount.currency) {
      try {
        const conversionInfo = await exchangeServices.getConversionInfo(
          parsedAmount,
          fromAccount.currency,
          toAccount.currency,
          client,
        );
        amountReceived = conversionInfo.convertedAmount;
        exchangeRate = conversionInfo.rate;
      } catch (error) {
        await client.query("ROLLBACK");
        return {
          success: false,
          message: error.message,
          data: null,
        };
      }
    }

    const newFromBalance = roundCurrency(Number(fromAccount.balance) - parsedAmount);
    const newToBalance = roundCurrency(Number(toAccount.balance) + amountReceived);

    await cuentaModel.updateBalance(fromAccountId, newFromBalance, client);
    await cuentaModel.updateBalance(toAccountId, newToBalance, client);

    const transfer = await transferenciaModel.createTransfer(
      fromAccountId,
      toAccountId,
      parsedAmount,
      amountReceived,
      exchangeRate,
      fromAccount.currency,
      toAccount.currency,
      description,
      client,
    );

    const debitDescription =
      fromAccount.currency !== toAccount.currency
        ? `Transferencia a cuenta ${toAccount.account_number} (${fromAccount.currency} ${parsedAmount} = ${toAccount.currency} ${amountReceived} @ ${exchangeRate}): ${description}`
        : `Transferencia a cuenta ${toAccount.account_number}: ${description}`;

    const creditDescription =
      fromAccount.currency !== toAccount.currency
        ? `Transferencia desde cuenta ${fromAccount.account_number} (${fromAccount.currency} ${parsedAmount} = ${toAccount.currency} ${amountReceived} @ ${exchangeRate}): ${description}`
        : `Transferencia desde cuenta ${fromAccount.account_number}: ${description}`;

    await estadoCuentaModel.insertTransaction(
      fromAccountId,
      -parsedAmount,
      "DEBIT",
      newFromBalance,
      debitDescription,
      client,
    );

    await estadoCuentaModel.insertTransaction(
      toAccountId,
      amountReceived,
      "CREDIT",
      newToBalance,
      creditDescription,
      client,
    );

    await client.query("COMMIT");

    return {
      success: true,
      message: "Transferencia realizada correctamente.",
      data: transfer,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

module.exports = { getAll, create };
