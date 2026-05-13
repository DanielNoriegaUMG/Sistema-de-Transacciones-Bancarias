// Rutas para gestión de cuentas bancarias
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const cuentaController = require("../controllers/cuenta.controller");

router.use(authMiddleware);

router.get("/", cuentaController.getAll);
router.get("/:id", cuentaController.getById);
router.post("/", cuentaController.create);

module.exports = router;
