const cuentaModel = require("../models/cuenta.model");

const getAll = async (user) => {
  const accounts = await cuentaModel.findAllByUserId(user.id);
  return {
    success: true,
    message: "Cuentas obtenidas correctamente.",
    data: accounts,
  };
};

const getById = async (id, user) => {
  const account = await cuentaModel.findById(id);
  if (!account || account.user_id !== user.id) {
    return {
      success: false,
      message: "Cuenta no encontrada o no autorizada.",
      data: null,
    };
  }

  return {
    success: true,
    message: "Cuenta obtenida correctamente.",
    data: account,
  };
};

module.exports = { getAll, getById }; 
