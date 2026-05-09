const cuentaService = require("../services/cuenta.services");

const getAll = async (req, res) => {
  try {
    const result = await cuentaService.getAll(req.user);
    return res.status(200).json(result);
  } catch (error) {
    console.error("[cuenta.controller] getAll:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Error interno del servidor." });
  }
};

const getById = async (req, res) => {
  try {
    const result = await cuentaService.getById(req.params.id, req.user);
    return res.status(200).json(result);
  } catch (error) {
    console.error("[cuenta.controller] getById:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Error interno del servidor." });
  }
};

module.exports = { getAll, getById };
