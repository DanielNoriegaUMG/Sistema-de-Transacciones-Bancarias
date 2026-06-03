const express = require("express");
const { check } = require("express-validator");
const { validateRequest } = require("../middlewares/validation.middleware");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const transferenciaController = require("../controllers/transferencia.controller");

router.use(authMiddleware);

// GET  /api/transfers
router.get("/", transferenciaController.getAll);

// POST /api/transfers
router.post(
  "/",
  [
    check("fromAccountId")
      .notEmpty()
      .withMessage("La cuenta de origen es requerida.")
      .isInt({ gt: 0 })
      .withMessage("El ID de la cuenta de origen debe ser un número válido."),
    check("toAccountId")
      .notEmpty()
      .withMessage("La cuenta de destino es requerida.")
      .isInt({ gt: 0 })
      .withMessage("El ID de la cuenta de destino debe ser un número válido."),
    check("amount")
      .notEmpty()
      .withMessage("El monto es requerido.")
      .isFloat({ gt: 0 })
      .withMessage("El monto debe ser un número mayor a cero."),
    validateRequest,
  ],
  transferenciaController.create,
);

module.exports = router;
