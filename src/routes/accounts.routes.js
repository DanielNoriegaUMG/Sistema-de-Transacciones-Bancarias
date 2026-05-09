const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const cuentaController = require("../controllers/cuenta.controller");

// Todas las rutas de cuentas requieren autenticación
router.use(authMiddleware);

// GET /api/accounts
router.get("/", cuentaController.getAll);

// GET /api/accounts/:id
router.get("/:id", cuentaController.getById);

module.exports = router;
