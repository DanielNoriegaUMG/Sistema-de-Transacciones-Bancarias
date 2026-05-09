const estadoCuentaModel = require("../models/estadoCuenta.model");

const getAll = async (user) => {
  const entries = await estadoCuentaModel.findAllByUserId(user.id);
  return {
    success: true,
    message: "Estado de cuenta obtenido correctamente.",
    data: entries,
  };
};

module.exports = { getAll }; 
