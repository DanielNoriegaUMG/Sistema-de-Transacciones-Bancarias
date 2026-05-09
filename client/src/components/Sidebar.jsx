import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// ── Ítems de navegación ──────────────────────────────────────
const NAV_ITEMS = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    path: "/accounts",
    label: "Cuentas",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
      </svg>
    ),
  },
  {
    path: "/transfers",
    label: "Transferencias",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7 16V4m0 0L3 8m4-4l4 4" />
        <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    ),
  },
  {
    path: "/transactions",
    label: "Estado de cuenta",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 12h6M9 16h4" />
      </svg>
    ),
  },
  {
    path: "/profile",
    label: "Perfil / Ajustes",
    icon: (
      <svg
        width="18"
        height="18"
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
    ),
  },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [logoutHover, setLogoutHover] = useState(false);

  // Leer datos del usuario guardados en localStorage
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("banco_user"));
    } catch {
      return null;
    }
  })();

  const handleLogout = () => {
    localStorage.removeItem("banco_token");
    localStorage.removeItem("banco_user");
    navigate("/login", { replace: true });
  };

  return (
    <aside style={s.sidebar}>
      {/* Decoración de fondo */}
      <div style={s.bgDeco} />

      {/* ── Brand ─────────────────────────────────────────── */}
      <div style={s.brand}>
        <div style={s.brandInner}>
          <div style={s.brandIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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
          <div>
            <div style={s.brandName}>BancoApp</div>
            <div style={s.brandTag}>Banca Digital</div>
          </div>
        </div>
      </div>

      {/* ── Navegación ────────────────────────────────────── */}
      <nav style={s.nav}>
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.path;
          return (
            <div
              key={item.path}
              style={{
                ...s.navItem,
                color: active ? "var(--accent-gold)" : "var(--text-secondary)",
                background: active ? "var(--accent-gold-dim)" : "transparent",
                border: active
                  ? "1px solid var(--border-accent)"
                  : "1px solid transparent",
                fontWeight: active ? 500 : 400,
              }}
              onClick={() => navigate(item.path)}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.color = "var(--text-primary)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.color = "var(--text-secondary)";
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              {item.icon}
              <span style={s.navLabel}>{item.label}</span>
              {active && <span style={s.activeDot} />}
            </div>
          );
        })}
      </nav>

      {/* ── Footer: usuario + cerrar sesión ──────────────── */}
      <div style={s.footer}>
        <div style={s.userCard}>
          <div style={s.avatar}>
            {user?.name?.charAt(0)?.toUpperCase() ?? "A"}
          </div>
          <div style={{ overflow: "hidden" }}>
            <div style={s.userName}>{user?.name ?? "Administrador"}</div>
            <div style={s.userRole}>{user?.role ?? "admin"}</div>
          </div>
        </div>

        <button
          style={{
            ...s.logoutBtn,
            ...(logoutHover
              ? {
                  background: "rgba(240,90,90,0.12)",
                  borderColor: "rgba(240,90,90,0.4)",
                }
              : {}),
          }}
          onClick={handleLogout}
          onMouseEnter={() => setLogoutHover(true)}
          onMouseLeave={() => setLogoutHover(false)}
        >
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
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

// ── Estilos ──────────────────────────────────────────────────
const s = {
  sidebar: {
    width: "var(--sidebar-w)",
    minWidth: "var(--sidebar-w)",
    height: "100vh",
    background: "var(--navy-950)",
    borderRight: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    overflow: "hidden",
  },
  bgDeco: {
    position: "absolute",
    bottom: 80,
    left: -50,
    width: 140,
    height: 140,
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  brand: {
    padding: "26px 20px 22px",
    borderBottom: "1px solid var(--border)",
  },
  brandInner: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  brandIcon: {
    width: 40,
    height: 40,
    background:
      "linear-gradient(135deg, var(--accent-gold), var(--accent-gold-light))",
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  brandName: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 20,
    fontWeight: 700,
    color: "var(--text-primary)",
    letterSpacing: "-0.3px",
  },
  brandTag: {
    fontSize: 10,
    color: "var(--accent-gold)",
    letterSpacing: "2px",
    textTransform: "uppercase",
    marginTop: 1,
    fontWeight: 500,
  },
  nav: {
    flex: 1,
    padding: "18px 12px",
    display: "flex",
    flexDirection: "column",
    gap: 2,
    overflowY: "auto",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 14px",
    borderRadius: "var(--radius-sm)",
    cursor: "pointer",
    transition: "all 0.15s ease",
    fontSize: 14,
    userSelect: "none",
  },
  navLabel: {
    letterSpacing: "-0.1px",
    flex: 1,
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: "50%",
    background: "var(--accent-gold)",
    flexShrink: 0,
  },
  footer: {
    padding: "14px 12px 22px",
    borderTop: "1px solid var(--border)",
  },
  userCard: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    background: "var(--surface)",
    borderRadius: "var(--radius-sm)",
    marginBottom: 10,
    overflow: "hidden",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "linear-gradient(135deg, var(--navy-600), var(--navy-700))",
    border: "1.5px solid var(--border-accent)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 600,
    color: "var(--accent-gold)",
    flexShrink: 0,
  },
  userName: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--text-primary)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  userRole: {
    fontSize: 11,
    color: "var(--text-muted)",
    marginTop: 1,
  },
  logoutBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 14px",
    borderRadius: "var(--radius-sm)",
    border: "1px solid rgba(240,90,90,0.2)",
    background: "rgba(240,90,90,0.06)",
    color: "var(--error)",
    fontSize: 14,
    fontWeight: 500,
    transition: "all 0.15s ease",
    fontFamily: "inherit",
  },
};
