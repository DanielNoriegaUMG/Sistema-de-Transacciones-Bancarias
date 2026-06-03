const express = require("express");
const { check } = require("express-validator");
const { validateRequest } = require("../middlewares/validation.middleware");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const authController = require("../controllers/auth.controller");

// POST /api/auth/login  — público
router.post(
  "/login",
  [
    check("username").trim().notEmpty().withMessage("El usuario es requerido."),
    check("password").notEmpty().withMessage("La contraseña es requerida."),
    validateRequest,
  ],
  authController.login,
);

// POST /api/auth/logout — protegido
router.post("/logout", authMiddleware, authController.logout);

// GET  /api/auth/me     — protegido
router.get("/me", authMiddleware, authController.me);

module.exports = router;
