const authService = require("../services/auth.services");

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const result = await authService.login(username, password);

    if (!result.success) {
      return res.status(401).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("[auth.controller] login:", error.message);
    return next(error);
  }
};

const logout = async (req, res, next) => {
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

const me = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.error("[auth.controller] me:", error.message);
    return next(error);
  }
};

module.exports = { login, logout, me };
