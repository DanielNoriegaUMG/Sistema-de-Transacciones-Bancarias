import React, { useState } from "react";

const getUser = () => {
  try { return JSON.parse(localStorage.getItem("banco_user")); }
  catch { return null; }
};

// ── Sección reutilizable ─────────────────────────────────────
function Section({ title, children }) {
  return (
    <div style={s.section}>
      <div style={s.sectionTitle}>{title}</div>
      {children}
    </div>
  );
}

// ── Campo de solo lectura ────────────────────────────────────
function ReadField({ label, value, mono }) {
  return (
    <div style={s.fieldGroup}>
      <label style={s.label}>{label}</label>
      <div style={{ ...s.readBox, fontFamily: mono ? "monospace" : "inherit" }}>
        {value || "—"}
      </div>
    </div>
  );
}

// ── Campo editable ───────────────────────────────────────────
function EditField({ label, value, onChange, type = "text", placeholder }) {
  return (
    <div style={s.fieldGroup}>
      <label style={s.label}>{label}</label>
      <input
        style={s.input}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={(e) => { e.target.style.borderColor = "var(--border-accent)"; e.target.style.boxShadow = "0 0 0 3px rgba(201,168,76,0.08)"; }}
        onBlur={(e)  => { e.target.style.borderColor = "var(--border)";        e.target.style.boxShadow = "none"; }}
      />
    </div>
  );
}

// ── Toggle de ajuste ─────────────────────────────────────────
function ToggleSetting({ label, description, value, onChange }) {
  return (
    <div style={s.toggleRow}>
      <div style={{ flex: 1 }}>
        <div style={s.toggleLabel}>{label}</div>
        <div style={s.toggleDesc}>{description}</div>
      </div>
      <div
        style={{ ...s.toggle, background: value ? "var(--accent-gold)" : "var(--border)" }}
        onClick={() => onChange(!value)}
      >
        <div style={{ ...s.toggleKnob, transform: value ? "translateX(18px)" : "translateX(2px)" }} />
      </div>
    </div>
  );
}

// ── Página principal ─────────────────────────────────────────
export default function Profile() {
  const user = getUser();

  // Estado edición de perfil
  const [name,  setName]  = useState(user?.name  ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Estado cambio de contraseña
  const [pwCurrent, setPwCurrent]   = useState("");
  const [pwNew,     setPwNew]       = useState("");
  const [pwConfirm, setPwConfirm]   = useState("");
  const [pwMsg,     setPwMsg]       = useState(null);
  const [pwSaving,  setPwSaving]    = useState(false);

  // Ajustes de notificaciones
  const [notifTransfer, setNotifTransfer] = useState(true);
  const [notifLogin,    setNotifLogin]    = useState(true);
  const [notifResumen,  setNotifResumen]  = useState(false);

  // Tema
  const [darkMode, setDarkMode] = useState(true);

  // ── Guardar perfil ────────────────────────────────────────
  const handleSaveProfile = () => {
    if (!name.trim()) return;
    setSaving(true);
    setTimeout(() => {
      const updated = { ...user, name: name.trim(), email: email.trim() };
      localStorage.setItem("banco_user", JSON.stringify(updated));
      setSaved(true);
      setSaving(false);
      setTimeout(() => setSaved(false), 2500);
    }, 800);
  };

  // ── Cambiar contraseña ────────────────────────────────────
  const handleChangePassword = () => {
    setPwMsg(null);
    if (!pwCurrent || !pwNew || !pwConfirm) {
      setPwMsg({ type: "error", text: "Completá todos los campos" });
      return;
    }
    if (pwNew.length < 8) {
      setPwMsg({ type: "error", text: "La contraseña debe tener al menos 8 caracteres" });
      return;
    }
    if (pwNew !== pwConfirm) {
      setPwMsg({ type: "error", text: "Las contraseñas nuevas no coinciden" });
      return;
    }
    setPwSaving(true);
    // Aquí iría la llamada real al API: PUT /api/auth/change-password
    setTimeout(() => {
      setPwSaving(false);
      setPwMsg({ type: "success", text: "Contraseña actualizada correctamente" });
      setPwCurrent(""); setPwNew(""); setPwConfirm("");
    }, 1000);
  };

  const initials = (user?.name ?? "A").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div style={s.page}>

      {/* ── Encabezado ─────────────────────────────────── */}
      <div style={s.pageHeader}>
        <div style={s.pageTitle}>Perfil y Ajustes</div>
        <div style={s.pageSub}>Administrá tu información personal y preferencias</div>
      </div>

      {/* ── Avatar + datos básicos ─────────────────────── */}
      <div style={s.avatarCard}>
        <div style={s.heroBg} />
        <div style={s.avatarWrap}>
          <div style={s.avatar}>{initials}</div>
          <div>
            <div style={s.avatarName}>{user?.name ?? "Usuario"}</div>
            <div style={s.avatarEmail}>{user?.email ?? "—"}</div>
            <div style={s.roleBadge}>{user?.role ?? "cliente"}</div>
          </div>
        </div>
      </div>

      <div style={s.grid}>

        {/* ── Izquierda ─────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Información personal */}
          <Section title="Información personal">
            <ReadField label="Nombre de usuario" value={user?.username} mono />
            <ReadField label="Rol en el sistema"  value={user?.role} />
            <ReadField label="ID de usuario"       value={user?.id} mono />
            <div style={s.divider} />
            <EditField label="Nombre completo" value={name} onChange={setName} placeholder="Tu nombre completo" />
            <EditField label="Correo electrónico" value={email} onChange={setEmail} type="email" placeholder="correo@ejemplo.com" />
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button
                style={{ ...s.btnPrimary, opacity: saving ? 0.7 : 1 }}
                onClick={handleSaveProfile}
                disabled={saving}
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
              {saved && (
                <div style={s.savedMsg}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Guardado
                </div>
              )}
            </div>
          </Section>

          {/* Cambio de contraseña */}
          <Section title="Cambiar contraseña">
            <EditField label="Contraseña actual"    value={pwCurrent} onChange={setPwCurrent} type="password" placeholder="••••••••" />
            <EditField label="Nueva contraseña"     value={pwNew}     onChange={setPwNew}     type="password" placeholder="Mínimo 8 caracteres" />
            <EditField label="Confirmar contraseña" value={pwConfirm} onChange={setPwConfirm} type="password" placeholder="Repetí la nueva contraseña" />
            {pwMsg && (
              <div style={{ ...s.msg, background: pwMsg.type === "success" ? "rgba(74,222,128,0.08)" : "rgba(240,90,90,0.08)", borderColor: pwMsg.type === "success" ? "rgba(74,222,128,0.25)" : "rgba(240,90,90,0.25)", color: pwMsg.type === "success" ? "var(--success)" : "var(--error)" }}>
                {pwMsg.text}
              </div>
            )}
            <button
              style={{ ...s.btnPrimary, marginTop: 4, opacity: pwSaving ? 0.7 : 1 }}
              onClick={handleChangePassword}
              disabled={pwSaving}
            >
              {pwSaving ? "Actualizando..." : "Actualizar contraseña"}
            </button>
          </Section>

        </div>

        {/* ── Derecha ───────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Notificaciones */}
          <Section title="Notificaciones">
            <ToggleSetting
              label="Transferencias"
              description="Recibir alerta por cada transferencia realizada o recibida"
              value={notifTransfer}
              onChange={setNotifTransfer}
            />
            <div style={s.divider} />
            <ToggleSetting
              label="Inicio de sesión"
              description="Notificar cuando se acceda desde un nuevo dispositivo"
              value={notifLogin}
              onChange={setNotifLogin}
            />
            <div style={s.divider} />
            <ToggleSetting
              label="Resumen mensual"
              description="Enviar resumen de movimientos al final de cada mes"
              value={notifResumen}
              onChange={setNotifResumen}
            />
          </Section>

          {/* Apariencia */}
          <Section title="Apariencia">
            <ToggleSetting
              label="Modo oscuro"
              description="Usar tema oscuro en toda la aplicación"
              value={darkMode}
              onChange={setDarkMode}
            />
            <div style={s.divider} />
            <div style={s.fieldGroup}>
              <label style={s.label}>Idioma</label>
              <select style={s.input}>
                <option value="es">Español (Guatemala)</option>
                <option value="en">English</option>
              </select>
            </div>
          </Section>

          {/* Seguridad */}
          <Section title="Seguridad">
            <div style={s.securityItem}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <div>
                <div style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>Autenticación JWT activa</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Sesión segura con token de 30 minutos</div>
              </div>
            </div>
            <div style={s.divider} />
            <div style={s.securityItem}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <div>
                <div style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>Contraseña encriptada con bcrypt</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Hash unidireccional, nadie puede verla</div>
              </div>
            </div>
            <div style={s.divider} />
            <button
              style={s.btnDanger}
              onClick={() => {
                if (window.confirm("¿Cerrar sesión en todos los dispositivos?")) {
                  localStorage.removeItem("banco_token");
                  localStorage.removeItem("banco_user");
                  window.location.href = "/login";
                }
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Cerrar sesión en todos los dispositivos
            </button>
          </Section>

          {/* Acerca de */}
          <Section title="Acerca del sistema">
            {[
              ["Aplicación",  "Sistema de Transacciones Bancarias"],
              ["Versión",     "1.0.0"],
              ["Equipo",      "Equipo 4 — UMG 2026"],
              ["Curso",       "Ingeniería de Software (042)"],
              ["Backend",     "Node.js + Express + PostgreSQL"],
              ["Frontend",    "React + Vite"],
            ].map(([k, v]) => (
              <div key={k} style={s.aboutRow}>
                <span style={s.aboutKey}>{k}</span>
                <span style={s.aboutVal}>{v}</span>
              </div>
            ))}
          </Section>

        </div>
      </div>
    </div>
  );
}

// ── Estilos ──────────────────────────────────────────────────
const s = {
  page: {
    padding: "32px 36px", maxWidth: 1000, margin: "0 auto",
  },
  pageHeader: { marginBottom: 28 },
  pageTitle: {
    fontSize: 22, fontWeight: 600, color: "var(--text-primary)",
    fontFamily: "'Playfair Display', serif", letterSpacing: "-0.3px",
  },
  pageSub: { fontSize: 13, color: "var(--text-muted)", marginTop: 4 },
  avatarCard: {
    position: "relative", overflow: "hidden",
    background: "linear-gradient(135deg, var(--navy-900) 0%, var(--navy-800) 100%)",
    border: "1px solid var(--border-accent)", borderRadius: "var(--radius)",
    padding: "24px 28px", marginBottom: 20,
  },
  heroBg: {
    position: "absolute", top: -40, right: -40,
    width: 180, height: 180, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  avatarWrap: { display: "flex", alignItems: "center", gap: 18 },
  avatar: {
    width: 64, height: 64, borderRadius: "50%", flexShrink: 0,
    background: "linear-gradient(135deg, var(--navy-600), var(--navy-700))",
    border: "2px solid var(--border-accent)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 22, fontWeight: 700, color: "var(--accent-gold)",
    fontFamily: "'Playfair Display', serif",
  },
  avatarName: {
    fontSize: 18, fontWeight: 600, color: "var(--text-primary)",
    fontFamily: "'Playfair Display', serif",
  },
  avatarEmail: { fontSize: 13, color: "var(--text-muted)", marginTop: 3 },
  roleBadge: {
    display: "inline-block", marginTop: 6, fontSize: 10, fontWeight: 600,
    textTransform: "uppercase", letterSpacing: "1.5px",
    background: "var(--accent-gold-dim)", color: "var(--accent-gold)",
    border: "1px solid var(--border-accent)", padding: "2px 9px", borderRadius: 10,
  },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  section: {
    background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: "var(--radius)", padding: "20px 22px",
  },
  sectionTitle: {
    fontSize: 12, fontWeight: 600, color: "var(--text-muted)",
    textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 18,
  },
  fieldGroup: { marginBottom: 14 },
  label: {
    display: "block", fontSize: 11, color: "var(--text-muted)",
    textTransform: "uppercase", letterSpacing: "1px", fontWeight: 500, marginBottom: 6,
  },
  readBox: {
    padding: "10px 14px", background: "var(--surface-2)",
    border: "1px solid var(--border)", borderRadius: "var(--radius-sm)",
    fontSize: 13, color: "var(--text-secondary)", letterSpacing: "0.3px",
  },
  input: {
    width: "100%", boxSizing: "border-box",
    padding: "10px 14px", background: "var(--surface-2)",
    border: "1px solid var(--border)", borderRadius: "var(--radius-sm)",
    fontSize: 13, color: "var(--text-primary)", fontFamily: "inherit",
    outline: "none", transition: "border-color 0.15s, box-shadow 0.15s",
  },
  divider: { height: 1, background: "var(--border)", margin: "14px 0" },
  btnPrimary: {
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "10px 20px", borderRadius: "var(--radius-sm)",
    background: "linear-gradient(135deg, var(--accent-gold), var(--accent-gold-light))",
    border: "none", color: "var(--navy-950)", fontSize: 13, fontWeight: 600,
    fontFamily: "inherit", cursor: "pointer", transition: "opacity 0.15s",
  },
  savedMsg: {
    display: "inline-flex", alignItems: "center", gap: 6,
    fontSize: 13, color: "var(--success)", padding: "10px 0",
  },
  msg: {
    padding: "10px 14px", borderRadius: "var(--radius-sm)",
    border: "1px solid", fontSize: 13, marginBottom: 4,
  },
  btnDanger: {
    display: "flex", alignItems: "center", gap: 8, width: "100%",
    padding: "10px 14px", borderRadius: "var(--radius-sm)",
    border: "1px solid rgba(240,90,90,0.25)", background: "rgba(240,90,90,0.06)",
    color: "var(--error)", fontSize: 13, fontWeight: 500,
    fontFamily: "inherit", cursor: "pointer", marginTop: 4,
    transition: "background 0.15s",
  },
  toggleRow: {
    display: "flex", alignItems: "center", gap: 16, padding: "4px 0",
  },
  toggleLabel: { fontSize: 13, color: "var(--text-primary)", fontWeight: 500 },
  toggleDesc:  { fontSize: 11, color: "var(--text-muted)", marginTop: 2 },
  toggle: {
    width: 42, height: 24, borderRadius: 12, position: "relative",
    cursor: "pointer", transition: "background 0.2s", flexShrink: 0,
  },
  toggleKnob: {
    position: "absolute", top: 3, width: 18, height: 18,
    borderRadius: "50%", background: "#fff",
    boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
    transition: "transform 0.2s",
  },
  securityItem: {
    display: "flex", alignItems: "flex-start", gap: 12, padding: "4px 0",
  },
  aboutRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "8px 0", borderBottom: "1px solid var(--border)",
  },
  aboutKey: { fontSize: 12, color: "var(--text-muted)", fontWeight: 500 },
  aboutVal: { fontSize: 12, color: "var(--text-secondary)" },
};
