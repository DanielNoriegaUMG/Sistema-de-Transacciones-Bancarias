const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const transferenciaController = require("../controllers/transferencia.controller");

router.use(authMiddleware);

// GET  /api/transfers
router.get("/", transferenciaController.getAll);

// POST /api/transfers
router.post("/", transferenciaController.create);

module.exports = router;
