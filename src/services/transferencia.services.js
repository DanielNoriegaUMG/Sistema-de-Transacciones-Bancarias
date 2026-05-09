const pool = require("../config/db");
const cuentaModel = require("../models/cuenta.model");
const transferenciaModel = require("../models/transferencia.model");
const estadoCuentaModel = require("../models/estadoCuenta.model");

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

    const newFromBalance = Number(fromAccount.balance) - parsedAmount;
    const newToBalance = Number(toAccount.balance) + parsedAmount;

    await cuentaModel.updateBalance(fromAccountId, newFromBalance, client);
    await cuentaModel.updateBalance(toAccountId, newToBalance, client);

    const transfer = await transferenciaModel.createTransfer(
      fromAccountId,
      toAccountId,
      parsedAmount,
      description,
      client,
    );

    await estadoCuentaModel.insertTransaction(
      fromAccountId,
      -parsedAmount,
      "DEBIT",
      newFromBalance,
      `Transferencia a cuenta ${toAccount.account_number}: ${description}`,
      client,
    );

    await estadoCuentaModel.insertTransaction(
      toAccountId,
      parsedAmount,
      "CREDIT",
      newToBalance,
      `Transferencia desde cuenta ${fromAccount.account_number}: ${description}`,
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
