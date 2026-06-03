import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("banco_token");

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "No se pudo obtener la información del perfil.");
        }

        setUser(data.user);
      } catch (err) {
        console.error("[Profile] loadProfile:", err);
        setError(err.message || "Error al cargar perfil.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("banco_token");
    localStorage.removeItem("banco_user");
    navigate("/login", { replace: true });
  };

  return (
    <div style={s.root}>
      <header style={s.header}>
        <div>
          <h1 style={s.title}>Perfil</h1>
          <p style={s.subtitle}>Administra tus datos de usuario, seguridad y preferencias de acceso.</p>
        </div>
        <button style={s.logoutBtn} onClick={handleLogout}>
          Cerrar sesión
        </button>
      </header>

      {error && <div style={s.alertError}>{error}</div>}

      {loading ? (
        <div style={s.loading}>Cargando perfil...</div>
      ) : user ? (
        <div style={s.content}>
          <section style={s.profileCard}>
            <div style={s.profileHeader}>
              <div style={s.avatar}>{user.name ? user.name.charAt(0).toUpperCase() : "U"}</div>
              <div>
                <h2 style={s.profileName}>{user.name || "Usuario"}</h2>
                <p style={s.profileEmail}>{user.email || "Sin correo registrado"}</p>
              </div>
            </div>

            <div style={s.fieldsGrid}>
              <div style={s.fieldBox}>
                <span style={s.fieldLabel}>Usuario</span>
                <strong style={s.fieldValue}>{user.username || "-"}</strong>
              </div>
              <div style={s.fieldBox}>
                <span style={s.fieldLabel}>Rol</span>
                <strong style={s.fieldValue}>{user.role || "Cliente"}</strong>
              </div>
              <div style={s.fieldBox}>
                <span style={s.fieldLabel}>Registrado el</span>
                <strong style={s.fieldValue}>{user.created_at ? new Date(user.created_at).toLocaleDateString("es-GT") : "-"}</strong>
              </div>
            </div>
          </section>

          <section style={s.sectionCard}>
            <h2 style={s.sectionTitle}>Seguridad y acceso</h2>
            <p style={s.sectionText}>Puedes cerrar sesión si estás usando un equipo compartido. Revisa también tus tokens y autorizaciones en el backend.</p>
          </section>

          <section style={s.sectionCard}>
            <h2 style={s.sectionTitle}>Preferencias</h2>
            <p style={s.sectionText}>Más adelante podrás gestionar notificaciones, temas y otras opciones de personalización.</p>
          </section>
        </div>
      ) : (
        <div style={s.emptyState}>No se encontró información de usuario.</div>
      )}
    </div>
  );
}

const s = {
  root: {
    padding: 24,
    color: "var(--text-primary)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 20,
    marginBottom: 24,
  },
  title: {
    margin: 0,
    fontSize: "2rem",
    fontWeight: 700,
  },
  subtitle: {
    margin: "8px 0 0",
    color: "var(--text-muted)",
  },
  logoutBtn: {
    padding: "12px 20px",
    borderRadius: 16,
    border: "none",
    background: "var(--accent-gold)",
    color: "var(--text-dark)",
    fontWeight: 700,
    cursor: "pointer",
  },
  alertError: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    background: "rgba(242, 76, 76, 0.12)",
    color: "#f24343",
  },
  loading: {
    padding: 28,
    color: "var(--text-muted)",
  },
  content: {
    display: "grid",
    gap: 20,
  },
  profileCard: {
    padding: 28,
    borderRadius: 24,
    background: "var(--surface)",
    boxShadow: "0 20px 65px rgba(4, 19, 56, 0.08)",
  },
  profileHeader: {
    display: "flex",
    alignItems: "center",
    gap: 20,
    marginBottom: 24,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: "50%",
    background: "var(--accent-gold)",
    color: "var(--text-dark)",
    display: "grid",
    placeItems: "center",
    fontSize: 28,
    fontWeight: 800,
  },
  profileName: {
    margin: 0,
    fontSize: 24,
    fontWeight: 700,
  },
  profileEmail: {
    margin: "6px 0 0",
    color: "var(--text-muted)",
  },
  fieldsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 18,
  },
  fieldBox: {
    padding: 18,
    borderRadius: 20,
    background: "rgba(255,255,255,0.04)",
  },
  fieldLabel: {
    display: "block",
    color: "var(--text-muted)",
    marginBottom: 8,
    fontSize: 13,
  },
  fieldValue: {
    fontSize: 16,
    fontWeight: 700,
  },
  sectionCard: {
    padding: 24,
    borderRadius: 24,
    background: "var(--surface)",
    boxShadow: "0 20px 65px rgba(4, 19, 56, 0.08)",
  },
  sectionTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 12,
  },
  sectionText: {
    margin: 0,
    color: "var(--text-muted)",
    lineHeight: 1.75,
  },
  emptyState: {
    padding: 28,
    borderRadius: 20,
    background: "rgba(255,255,255,0.04)",
    color: "var(--text-muted)",
    textAlign: "center",
  },
};
