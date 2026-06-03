const estadoCuentaService = require("../services/estadoCuenta.services");

const getAll = async (req, res, next) => {
  try {
    const result = await estadoCuentaService.getAll(req.user);
    return res.status(200).json(result);
  } catch (error) {
    console.error("[estadoCuenta.controller] getAll:", error.message);
    return next(error);
  }
};

module.exports = { getAll };
