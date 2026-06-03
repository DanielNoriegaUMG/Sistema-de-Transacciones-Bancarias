const express = require("express");
const { param } = require("express-validator");
const { validateRequest } = require("../middlewares/validation.middleware");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const cuentaController = require("../controllers/cuenta.controller");

// Todas las rutas de cuentas requieren autenticación
router.use(authMiddleware);

// GET /api/accounts
router.get("/", cuentaController.getAll);

// GET /api/accounts/:id
router.get(
  "/:id",
  [
    param("id")
      .isInt({ gt: 0 })
      .withMessage("El identificador de cuenta debe ser un número válido."),
    validateRequest,
  ],
  cuentaController.getById,
);

module.exports = router;
