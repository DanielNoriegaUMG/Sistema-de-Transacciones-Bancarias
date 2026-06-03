const cuentaService = require("../services/cuenta.services");

const getAll = async (req, res, next) => {
  try {
    const result = await cuentaService.getAll(req.user);
    return res.status(200).json(result);
  } catch (error) {
    console.error("[cuenta.controller] getAll:", error.message);
    return next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const result = await cuentaService.getById(req.params.id, req.user);
    return res.status(200).json(result);
  } catch (error) {
    console.error("[cuenta.controller] getById:", error.message);
    return next(error);
  }
};

module.exports = { getAll, getById };
