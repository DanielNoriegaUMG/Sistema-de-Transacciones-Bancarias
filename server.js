require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

const authRoutes = require("./src/routes/auth.routes");
const accountsRoutes = require("./src/routes/accounts.routes");
const transfersRoutes = require("./src/routes/transfers.routes");
const transactionsRoutes = require("./src/routes/transactions.routes");
const errorHandler = require("./src/middlewares/error.middleware");

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middlewares globales ──────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Rutas API ─────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/accounts", accountsRoutes);
app.use("/api/transfers", transfersRoutes);
app.use("/api/transactions", transactionsRoutes);

// ── Health check ──────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    status: "OK",
    message: "Banco API running",
    timestamp: new Date().toISOString(),
  });
});

// ── Producción: servir cliente React ──────────────────────────
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client/build")));
  app.get("*", (_req, res) =>
    res.sendFile(path.join(__dirname, "client/build", "index.html")),
  );
}

// ── Middleware de errores global ───────────────────────────────
app.use(errorHandler);

// ── Iniciar servidor ──────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🏦  Banco API corriendo en http://localhost:${PORT}`);
});

module.exports = app;
