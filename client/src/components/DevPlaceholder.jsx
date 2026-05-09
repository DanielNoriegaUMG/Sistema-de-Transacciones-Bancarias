//Componente reutilizable para vistas en desarrollo.

import React from "react";

export default function DevPlaceholder({ title, description, icon }) {
  return (
    <div style={s.root}>
      <div style={s.card}>
        {/* Icono */}
        <div style={s.iconWrap}>
          {icon}
          <div style={s.iconGlow} />
        </div>

        {/* Título */}
        <h1 style={s.title}>{title}</h1>

        {/* Badge */}
        <div style={s.badge}>
          <span style={s.badgeDot} />
          Fase en desarrollo
        </div>

        {/* Descripción */}
        <p style={s.description}>
          {description ??
            "Este módulo está siendo desarrollado por el equipo de ingeniería. Estará disponible próximamente."}
        </p>

        {/* Barra de progreso animada */}
        <div style={s.progressWrap}>
          <div style={s.progressBar}>
            <div style={s.progressFill} />
          </div>
          <span style={s.progressLabel}>En construcción</span>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

const s = {
  root: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    animation: "fadeUp 0.45s ease forwards",
  },
  card: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 20,
    padding: "56px 64px",
    maxWidth: 480,
    width: "100%",
    textAlign: "center",
    boxShadow: "var(--shadow)",
    position: "relative",
    overflow: "hidden",
  },
  iconWrap: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 72,
    height: 72,
    background: "var(--navy-800)",
    borderRadius: 20,
    border: "1px solid var(--border-accent)",
    marginBottom: 24,
    color: "var(--accent-gold)",
  },
  iconGlow: {
    position: "absolute",
    inset: -1,
    borderRadius: 20,
    background:
      "radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.18) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 26,
    fontWeight: 600,
    color: "var(--text-primary)",
    marginBottom: 14,
    letterSpacing: "-0.4px",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    padding: "5px 14px",
    borderRadius: 100,
    background: "var(--accent-gold-dim)",
    border: "1px solid var(--border-accent)",
    fontSize: 12,
    fontWeight: 600,
    color: "var(--accent-gold)",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    marginBottom: 20,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "var(--accent-gold)",
    display: "inline-block",
    animation: "pulseDot 1.8s ease-in-out infinite",
  },
  description: {
    fontSize: 14,
    lineHeight: 1.75,
    color: "var(--text-secondary)",
    marginBottom: 36,
  },
  progressWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  progressBar: {
    height: 4,
    background: "var(--navy-800)",
    borderRadius: 2,
    overflow: "hidden",
    position: "relative",
  },
  progressFill: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "60%",
    height: "100%",
    background:
      "linear-gradient(90deg, transparent, var(--accent-gold), transparent)",
    animation: "shimmer 2.2s ease-in-out infinite",
  },
  progressLabel: {
    fontSize: 11,
    color: "var(--text-muted)",
    letterSpacing: "0.5px",
  },
};
