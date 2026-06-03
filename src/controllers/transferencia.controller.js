const transferenciaService = require("../services/transferencia.services");

const getAll = async (req, res, next) => {
  try {
    const result = await transferenciaService.getAll(req.user);
    return res.status(200).json(result);
  } catch (error) {
    console.error("[transferencia.controller] getAll:", error.message);
    return next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const result = await transferenciaService.create(req.body, req.user);
    return res.status(200).json(result);
  } catch (error) {
    console.error("[transferencia.controller] create:", error.message);
    return next(error);
  }
};

module.exports = { getAll, create };
