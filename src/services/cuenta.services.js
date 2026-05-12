// Lógica de negocio para cuentas bancarias
const cuentaModel = require("../models/cuenta.model");

const VALID_TYPES = ["checking", "savings"];
const VALID_CURRENCIES = ["USD", "GTQ", "EUR"];

/**
 * Genera un número de cuenta de 16 dígitos único.
 * Combina timestamp y valor aleatorio, reintentando si ya existe en BD.
 */
const generateAccountNumber = async () => {
  let attempts = 0;
  while (attempts < 5) {
    const ts = Date.now().toString();
    const rand = Math.floor(Math.random() * 100000)
      .toString()
      .padStart(5, "0");
    const num = (ts + rand).slice(-16);
    const exists = await cuentaModel.existsByAccountNumber(num);
    if (!exists) return num;
    attempts++;
  }
  throw new Error("No se pudo generar un número de cuenta único.");
};

const getAll = async (user) => {
  const data = await cuentaModel.findAllByUser(user.id);
  return { success: true, data };
};

const getById = async (id, user) => {
  const data = await cuentaModel.findById(id, user.id);
  if (!data) {
    return { success: false, message: "Cuenta no encontrada." };
  }
  return { success: true, data };
};

const create = async ({ alias, currency, type }, user) => {
  if (!type || !VALID_TYPES.includes(type)) {
    return {
      success: false,
      message: `Tipo de cuenta inválido. Valores permitidos: ${VALID_TYPES.join(", ")}.`,
    };
  }
  if (!currency || !VALID_CURRENCIES.includes(currency)) {
    return {
      success: false,
      message: `Moneda inválida. Valores permitidos: ${VALID_CURRENCIES.join(", ")}.`,
    };
  }

  const accountNumber = await generateAccountNumber();
  const data = await cuentaModel.create({
    userId: user.id,
    accountNumber,
    alias: alias?.trim() || null,
    currency,
    type,
  });

  return { success: true, message: "Cuenta creada correctamente.", data };
};

module.exports = { getAll, getById, create };
