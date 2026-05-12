// Controlador de cuentas — recibe HTTP, delega al service, responde JSON
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
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res
        .status(400)
        .json({ success: false, message: "ID de cuenta inválido." });
    }
    const result = await cuentaService.getById(id, req.user);
    return res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    console.error("[cuenta.controller] getById:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Error interno del servidor." });
  }
};

const create = async (req, res) => {
  try {
    const { alias, currency, type } = req.body;
    const result = await cuentaService.create(
      { alias, currency, type },
      req.user,
    );
    return res.status(result.success ? 201 : 400).json(result);
  } catch (error) {
    console.error("[cuenta.controller] create:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Error interno del servidor." });
  }
};

module.exports = { getAll, getById, create };
