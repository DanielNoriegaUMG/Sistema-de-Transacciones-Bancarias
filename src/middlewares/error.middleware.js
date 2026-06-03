const errorHandler = (err, _req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  console.error("[error.middleware]", err);

  const status = err.status || 500;
  const payload = {
    success: false,
    message: err.message || "Ocurrió un error interno del servidor.",
  };

  if (err.details) {
    payload.details = err.details;
  }

  res.status(status).json(payload);
};

module.exports = errorHandler;
