const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const estadoCuentaController = require("../controllers/estadoCuenta.controller");

router.use(authMiddleware);

// GET /api/transactions
router.get("/", estadoCuentaController.getAll);

module.exports = router;
