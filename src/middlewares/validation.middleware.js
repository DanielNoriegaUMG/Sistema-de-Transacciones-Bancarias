const { validationResult } = require("express-validator");

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const details = errors.array().map(({ param, msg }) => ({ field: param, message: msg }));

  return res.status(422).json({
    success: false,
    message: "Los datos enviados no son válidos.",
    details,
  });
};

module.exports = { validateRequest };
