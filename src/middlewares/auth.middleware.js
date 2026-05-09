// src/middlewares/auth.middleware.js
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "banco_secret_dev_key";

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Acceso denegado. Token no proporcionado.",
      });
    }

    const token = authHeader.split(" ")[1];

    // Token simulado para el MVP (fase de pruebas sin BD)
    if (token === "simulated-token-admin") {
      req.user = {
        id: 1,
        username: "admin",
        name: "Administrador",
        role: "admin",
      };
      return next();
    }

    // Validación de JWT real (fases futuras)
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token inválido o expirado.",
    });
  }
};

module.exports = authMiddleware;
