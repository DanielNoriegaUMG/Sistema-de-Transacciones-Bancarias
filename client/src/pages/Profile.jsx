import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, refreshProfile } = useAuth();
  const [profile, setProfile] = useState(user);
  const [loading, setLoading] = useState(!user);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setProfile(user);
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await refreshProfile();
        if (data?.user) {
          setProfile(data.user);
        }
      } catch (err) {
        console.error("[Profile] loadProfile:", err);
        setError(err.message || "Error al cargar perfil.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [refreshProfile, user]);

  const handleLogout = () => {
    logout();
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
      ) : profile ? (
        <div style={s.content}>
          <section style={s.profileCard}>
            <div style={s.profileHeader}>
              <div style={s.avatar}>{profile?.name ? profile.name.charAt(0).toUpperCase() : "U"}</div>
              <div>
                <h2 style={s.profileName}>{profile?.name || "Usuario"}</h2>
                <p style={s.profileEmail}>{profile?.email || "Sin correo registrado"}</p>
              </div>
            </div>

            <div style={s.fieldsGrid}>
              <div style={s.fieldBox}>
                <span style={s.fieldLabel}>Usuario</span>
                <strong style={s.fieldValue}>{profile?.username || "-"}</strong>
              </div>
              <div style={s.fieldBox}>
                <span style={s.fieldLabel}>Rol</span>
                <strong style={s.fieldValue}>{profile?.role || "Cliente"}</strong>
              </div>
              <div style={s.fieldBox}>
                <span style={s.fieldLabel}>Registrado el</span>
                <strong style={s.fieldValue}>{profile?.created_at ? new Date(profile.created_at).toLocaleDateString("es-GT") : "-"}</strong>
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
