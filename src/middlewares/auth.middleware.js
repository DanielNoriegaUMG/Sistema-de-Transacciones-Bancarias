// src/middlewares/auth.middleware.js
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "banco_secret_dev_key";

const createAuthError = (message) => {
  const error = new Error(message);
  error.status = 401;
  return error;
};

const authMiddleware = (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(createAuthError("Acceso denegado. Token no proporcionado."));
  }

  const token = authHeader.split(" ")[1];

  if (token === "simulated-token-admin") {
    req.user = {
      id: 1,
      username: "admin",
      name: "Administrador",
      role: "admin",
    };
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (error) {
    return next(createAuthError("Token inválido o expirado."));
  }
};

module.exports = authMiddleware;
