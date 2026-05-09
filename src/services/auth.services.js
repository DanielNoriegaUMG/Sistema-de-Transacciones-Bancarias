const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authModel = require("../models/auth.model");

const JWT_SECRET = process.env.JWT_SECRET || "banco_secret_dev_key";

const login = async (username, password) => {
  const user = await authModel.findByUsername(username);

  if (!user) {
    return {
      success: false,
      message: "Credenciales incorrectas. Verifique su usuario y contraseña.",
    };
  }

  const validPassword = await bcrypt.compare(password, user.password_hash);
  if (!validPassword) {
    return {
      success: false,
      message: "Credenciales incorrectas. Verifique su usuario y contraseña.",
    };
  }

  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "8h" },
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
