const authService = require("../services/auth.services");

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Usuario y contraseña son requeridos.",
      });
    }

    const result = await authService.login(username, password);

    if (!result.success) {
      return res.status(401).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("[auth.controller] login:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor.",
    });
  }
};

const logout = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Sesión cerrada correctamente.",
    });
  } catch (error) {
    console.error("[auth.controller] logout:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Error interno del servidor." });
  }
};

const me = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.error("[auth.controller] me:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Error interno del servidor." });
  }
};

module.exports = { login, logout, me };
