const transferenciaService = require("../services/transferencia.services");

const getAll = async (req, res) => {
  try {
    const result = await transferenciaService.getAll(req.user);
    return res.status(200).json(result);
  } catch (error) {
    console.error("[transferencia.controller] getAll:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Error interno del servidor." });
  }
};

const create = async (req, res) => {
  try {
    const result = await transferenciaService.create(req.body, req.user);
    return res.status(200).json(result);
  } catch (error) {
    console.error("[transferencia.controller] create:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Error interno del servidor." });
  }
};

module.exports = { getAll, create };
