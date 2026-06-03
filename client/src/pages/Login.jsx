import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { token, login } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (token) {
      navigate("/dashboard", { replace: true });
      return;
    }
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, [navigate, token]);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError("Por favor complete todos los campos.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      await login(form);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("[Login] submit error:", err);
      setError(err.message || "No se pudo conectar con el servidor. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.root}>
      {/* Fondo */}
      <div style={s.bgGrid} />
      <div style={s.bgGlow1} />
      <div style={s.bgGlow2} />

      {/* ── Panel izquierdo: branding ────────────────────── */}
      <div
        style={{
          ...s.left,
          opacity: mounted ? 1 : 0,
          transform: mounted ? "none" : "translateX(-18px)",
          transition: "opacity 0.65s ease, transform 0.65s ease",
        }}
      >
        {/* Logo */}
        <div style={s.logoWrap}>
          <div style={s.logoIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7v2h18V7L12 2z" fill="rgba(10,22,40,0.95)" />
              <rect
                x="5"
                y="11"
                width="2.5"
                height="7"
                rx="1"
                fill="rgba(10,22,40,0.95)"
              />
              <rect
                x="10.75"
                y="11"
                width="2.5"
                height="7"
                rx="1"
                fill="rgba(10,22,40,0.95)"
              />
              <rect
                x="16.5"
                y="11"
                width="2.5"
                height="7"
                rx="1"
                fill="rgba(10,22,40,0.95)"
              />
              <rect
                x="3"
                y="19"
                width="18"
                height="2"
                rx="1"
                fill="rgba(10,22,40,0.95)"
              />
            </svg>
          </div>
          <span style={s.logoName}>BancoApp</span>
        </div>

        {/* Hero */}
        <div style={s.hero}>
          <h1 style={s.heroH}>
            Banca digital
            <br />a tu alcance
          </h1>
          <p style={s.heroP}>
            Gestiona tus finanzas con seguridad, claridad y control total desde
            cualquier dispositivo.
          </p>
        </div>

        {/* Features */}
        <ul style={s.featureList}>
          {[
            "Transferencias instantáneas",
            "Estado de cuenta en tiempo real",
            "Seguridad de nivel bancario",
          ].map((f) => (
            <li key={f} style={s.featureItem}>
              <span style={s.featureDot} />
              {f}
            </li>
          ))}
        </ul>

        <p style={s.secNote}>Plataforma segura · Cifrado TLS 1.3</p>
      </div>

      {/* ── Panel derecho: formulario ────────────────────── */}
      <div style={s.right}>
        <div
          style={{
            ...s.card,
            opacity: mounted ? 1 : 0,
            transform: mounted ? "none" : "translateY(22px)",
            transition: "opacity 0.65s ease 0.12s, transform 0.65s ease 0.12s",
          }}
        >
          <div style={s.cardHeader}>
            <h2 style={s.cardTitle}>Iniciar sesión</h2>
            <p style={s.cardSub}>Accede a tu cuenta bancaria</p>
          </div>

          <form onSubmit={handleSubmit} style={s.form} noValidate>
            {/* Usuario */}
            <div style={s.field}>
              <label style={s.label}>Usuario</label>
              <div style={s.inputRow}>
                <span style={s.inputIcon}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                  </svg>
                </span>
                <input
                  style={s.input}
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Ingresa tu usuario"
                  autoComplete="username"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Contraseña */}
            <div style={s.field}>
              <label style={s.label}>Contraseña</label>
              <div style={s.inputRow}>
                <span style={s.inputIcon}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  style={{ ...s.input, paddingRight: 46 }}
                  type={showPass ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Ingresa tu contraseña"
                  autoComplete="current-password"
                  disabled={loading}
                />
                {/* Ojo */}
                <button
                  type="button"
                  style={s.eyeBtn}
                  onClick={() => setShowPass((v) => !v)}
                  tabIndex={-1}
                  title={showPass ? "Ocultar" : "Mostrar"}
                >
                  {showPass ? (
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path
                        d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94
                               M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19
                               m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                      />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={s.errorBox}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ flexShrink: 0 }}
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            {/* Botón */}
            <button
              type="submit"
              style={{ ...s.submitBtn, opacity: loading ? 0.78 : 1 }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span style={s.spinner} />
                  Verificando...
                </>
              ) : (
                <>
                  Iniciar sesión
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.35; }
          50%       { opacity: 0.65; }
        }
        input:focus {
          border-color: var(--border-accent) !important;
          box-shadow: 0 0 0 3px rgba(201,168,76,0.1) !important;
        }
      `}</style>
    </div>
  );
}

// ── Estilos ──────────────────────────────────────────────────
const s = {
  root: {
    minHeight: "100vh",
    display: "flex",
    background: "var(--navy-900)",
    position: "relative",
    overflow: "hidden",
  },
  bgGrid: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)",
    backgroundSize: "32px 32px",
    pointerEvents: "none",
  },
  bgGlow1: {
    position: "absolute",
    top: "-8%",
    left: "-4%",
    width: "48%",
    height: "58%",
    borderRadius: "50%",
    background:
      "radial-gradient(ellipse, rgba(30,64,128,0.28) 0%, transparent 70%)",
    animation: "pulseGlow 6s ease-in-out infinite",
    pointerEvents: "none",
  },
  bgGlow2: {
    position: "absolute",
    bottom: "-8%",
    right: "-4%",
    width: "44%",
    height: "52%",
    borderRadius: "50%",
    background:
      "radial-gradient(ellipse, rgba(201,168,76,0.07) 0%, transparent 70%)",
    animation: "pulseGlow 9s ease-in-out infinite 2s",
    pointerEvents: "none",
  },
  left: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "48px 56px",
    borderRight: "1px solid var(--border)",
  },
  logoWrap: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  logoIcon: {
    width: 48,
    height: 48,
    background:
      "linear-gradient(135deg, var(--accent-gold), var(--accent-gold-light))",
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logoName: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 24,
    fontWeight: 700,
    color: "var(--text-primary)",
    letterSpacing: "-0.5px",
  },
  hero: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: 20,
    maxWidth: 420,
  },
  heroH: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "clamp(32px, 4vw, 48px)",
    fontWeight: 700,
    lineHeight: 1.15,
    color: "var(--text-primary)",
    letterSpacing: "-1px",
  },
  heroP: {
    fontSize: 16,
    lineHeight: 1.7,
    color: "var(--text-secondary)",
    fontWeight: 300,
  },
  featureList: {
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    fontSize: 14,
    color: "var(--text-secondary)",
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "var(--accent-gold)",
    flexShrink: 0,
  },
  secNote: {
    fontSize: 11,
    color: "var(--text-muted)",
    letterSpacing: "0.5px",
  },
  right: {
    width: 480,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 44px",
  },
  card: {
    width: "100%",
    background: "var(--surface)",
    borderRadius: "var(--radius)",
    border: "1px solid var(--border)",
    padding: "40px",
    boxShadow: "var(--shadow)",
  },
  cardHeader: {
    marginBottom: 32,
  },
  cardTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 26,
    fontWeight: 600,
    color: "var(--text-primary)",
    marginBottom: 6,
    letterSpacing: "-0.3px",
  },
  cardSub: {
    fontSize: 14,
    color: "var(--text-secondary)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 7,
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: "var(--text-secondary)",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },
  inputRow: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: 14,
    color: "var(--text-muted)",
    display: "flex",
    alignItems: "center",
    pointerEvents: "none",
  },
  input: {
    width: "100%",
    padding: "12px 14px 12px 42px",
    background: "var(--navy-900)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    color: "var(--text-primary)",
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  eyeBtn: {
    position: "absolute",
    right: 12,
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "var(--text-muted)",
    display: "flex",
    alignItems: "center",
    padding: 4,
    borderRadius: 4,
    transition: "color 0.15s",
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 14px",
    background: "rgba(240,90,90,0.08)",
    border: "1px solid rgba(240,90,90,0.25)",
    borderRadius: "var(--radius-sm)",
    color: "var(--error)",
    fontSize: 13,
    lineHeight: 1.5,
  },
  submitBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: "13px 24px",
    background:
      "linear-gradient(135deg, var(--accent-gold), var(--accent-gold-light))",
    border: "none",
    borderRadius: "var(--radius-sm)",
    color: "var(--navy-950)",
    fontSize: 15,
    fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif",
    transition: "opacity 0.2s, transform 0.15s",
    marginTop: 4,
    letterSpacing: "-0.2px",
  },
  spinner: {
    width: 16,
    height: 16,
    border: "2px solid rgba(10,22,40,0.25)",
    borderTop: "2px solid var(--navy-950)",
    borderRadius: "50%",
    display: "inline-block",
    animation: "spin 0.7s linear infinite",
  },
  hint: {
    marginTop: 22,
    paddingTop: 18,
    borderTop: "1px solid var(--border)",
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  hintLabel: {
    fontSize: 12,
    color: "var(--text-muted)",
  },
  hintCode: {
    fontSize: 12,
    background: "var(--navy-900)",
    border: "1px solid var(--border)",
    borderRadius: 4,
    padding: "3px 8px",
    color: "var(--accent-gold)",
    fontFamily: "monospace",
    letterSpacing: "0.3px",
  },
};
