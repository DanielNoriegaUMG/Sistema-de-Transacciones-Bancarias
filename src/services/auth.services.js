// Lógica de negocio para autenticación
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authModel = require("../models/auth.model");

const login = async (username, password) => {
  const user = await authModel.findByUsername(username);

  // Mismo mensaje para usuario no encontrado y contraseña incorrecta,
  // evita enumerar usuarios válidos.
  if (!user) {
    return {
      success: false,
      message: "Credenciales incorrectas. Verifique su usuario y contraseña.",
    };
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return {
      success: false,
      message: "Credenciales incorrectas. Verifique su usuario y contraseña.",
    };
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, name: user.name, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "24h" },
  );

  return {
    success: true,
    message: "Sesión iniciada correctamente.",
    token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

module.exports = { login };
