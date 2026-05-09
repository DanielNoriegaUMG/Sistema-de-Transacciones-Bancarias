const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const authController = require("../controllers/auth.controller");

// POST /api/auth/login  — público
router.post("/login", authController.login);

// POST /api/auth/logout — protegido
router.post("/logout", authMiddleware, authController.logout);

// GET  /api/auth/me     — protegido
router.get("/me", authMiddleware, authController.me);

module.exports = router;
