const estadoCuentaService = require("../services/estadoCuenta.services");

const getAll = async (req, res) => {
  try {
    const result = await estadoCuentaService.getAll(req.user);
    return res.status(200).json(result);
  } catch (error) {
    console.error("[estadoCuenta.controller] getAll:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Error interno del servidor." });
  }
};

module.exports = { getAll };
