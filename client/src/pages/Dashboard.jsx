import React, { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const getToken = () => localStorage.getItem("banco_token");
const getUser  = () => {
  try { return JSON.parse(localStorage.getItem("banco_user")); }
  catch { return null; }
};

const apiFetch = (path) =>
  fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  }).then((r) => r.json());

const fmt = (n) =>
  new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ" }).format(n ?? 0);

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("es-GT", {
    day: "2-digit", month: "short", year: "numeric",
  });

// ── Componentes pequeños ─────────────────────────────────────

function StatCard({ label, value, sub, accent, icon }) {
  return (
    <div style={{ ...s.card, flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={s.cardLabel}>{label}</div>
          <div style={{ ...s.cardValue, color: accent ?? "var(--text-primary)" }}>{value}</div>
          {sub && <div style={s.cardSub}>{sub}</div>}
        </div>
        <div style={{ ...s.iconBox, background: accent ? `${accent}18` : "var(--surface-2)" }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function TxRow({ tx, accountIds }) {
  const isCredit = accountIds.includes(String(tx.to_account_id));
  const color    = isCredit ? "var(--success)" : "var(--error)";
  const sign     = isCredit ? "+" : "-";

  return (
    <div style={s.txRow}>
      <div style={{ ...s.txDot, background: isCredit ? "rgba(74,222,128,0.12)" : "rgba(240,90,90,0.12)" }}>
        {isCredit ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={s.txTitle}>{isCredit ? "Transferencia recibida" : "Transferencia enviada"}</div>
        <div style={s.txSub}>{tx.description || "Sin descripción"}</div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ ...s.txAmount, color }}>{sign}{fmt(tx.amount)}</div>
        <div style={s.txDate}>{fmtDate(tx.created_at)}</div>
      </div>
    </div>
  );
}

function AccountChip({ account }) {
  const typeColors = {
    monetaria: "var(--accent-gold)",
    ahorro:    "var(--success)",
    corriente: "#7C9EFF",
  };
  const color = typeColors[account.type] ?? "var(--accent-gold)";

  return (
    <div style={s.accountChip}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={s.accountNum}>{account.account_number}</div>
          <div style={{ ...s.accountType, color }}>{account.type ?? "—"}</div>
        </div>
        <div style={{ ...s.accountBadge, borderColor: `${color}40`, color }}>
          {account.currency ?? "GTQ"}
        </div>
      </div>
      <div style={{ ...s.accountBalance, color }}>{fmt(account.balance)}</div>
    </div>
  );
}

// ── Página principal ─────────────────────────────────────────

export default function Dashboard() {
  const user = getUser();

  const [accounts, setAccounts]   = useState([]);
  const [txs, setTxs]             = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  useEffect(() => {
    Promise.all([
      apiFetch("/api/accounts"),
      apiFetch("/api/transactions"),
    ])
      .then(([accs, txData]) => {
        setAccounts(Array.isArray(accs) ? accs : accs.data ?? []);
        setTxs(Array.isArray(txData) ? txData : txData.data ?? []);
      })
      .catch(() => setError("No se pudo cargar la información"))
      .finally(() => setLoading(false));
  }, []);

  const totalSaldo   = accounts.reduce((s, a) => s + Number(a.balance ?? 0), 0);
  const accountIds   = accounts.map((a) => String(a.id));
  const recent       = txs.slice(0, 6);
  const totalCredits = txs.filter((t) => accountIds.includes(String(t.to_account_id)))
                          .reduce((s, t) => s + Number(t.amount ?? 0), 0);
  const totalDebits  = txs.filter((t) => accountIds.includes(String(t.from_account_id)))
                          .reduce((s, t) => s + Number(t.amount ?? 0), 0);

  const hora = new Date().getHours();
  const saludo = hora < 12 ? "Buenos días" : hora < 19 ? "Buenas tardes" : "Buenas noches";

  if (loading) return (
    <div style={s.center}>
      <div style={s.spinner} />
    </div>
  );

  if (error) return (
    <div style={s.center}>
      <div style={{ color: "var(--error)", fontSize: 14 }}>{error}</div>
    </div>
  );

  return (
    <div style={s.page}>

      {/* ── Encabezado ─────────────────────────────────── */}
      <div style={s.header}>
        <div>
          <div style={s.greeting}>{saludo}, {user?.name ?? "Usuario"} 👋</div>
          <div style={s.greetingSub}>Aquí está el resumen de tus finanzas</div>
        </div>
        <div style={s.dateBadge}>
          {new Date().toLocaleDateString("es-GT", { weekday: "long", day: "numeric", month: "long" })}
        </div>
      </div>

      {/* ── Saldo total hero ───────────────────────────── */}
      <div style={s.heroCard}>
        <div style={s.heroBg} />
        <div style={s.heroLabel}>Saldo total consolidado</div>
        <div style={s.heroAmount}>{fmt(totalSaldo)}</div>
        <div style={s.heroSub}>{accounts.length} cuenta{accounts.length !== 1 ? "s" : ""} activa{accounts.length !== 1 ? "s" : ""}</div>
      </div>

      {/* ── Stats ──────────────────────────────────────── */}
      <div style={s.statsRow}>
        <StatCard
          label="Ingresos"
          value={fmt(totalCredits)}
          sub={`${txs.filter(t => accountIds.includes(String(t.to_account_id))).length} transacciones`}
          accent="var(--success)"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
            </svg>
          }
        />
        <StatCard
          label="Egresos"
          value={fmt(totalDebits)}
          sub={`${txs.filter(t => accountIds.includes(String(t.from_account_id))).length} transacciones`}
          accent="var(--error)"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--error)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" />
            </svg>
          }
        />
        <StatCard
          label="Movimientos"
          value={txs.length}
          sub="historial total"
          accent="var(--accent-gold)"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 16V4m0 0L3 8m4-4l4 4"/><path d="M17 8v12m0 0l4-4m-4 4l-4-4"/>
            </svg>
          }
        />
        <StatCard
          label="Cuentas"
          value={accounts.length}
          sub="cuentas registradas"
          accent="#7C9EFF"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C9EFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>
            </svg>
          }
        />
      </div>

      {/* ── Grid inferior ──────────────────────────────── */}
      <div style={s.grid}>

        {/* Cuentas */}
        <div style={s.card}>
          <div style={s.sectionHeader}>
            <div style={s.sectionTitle}>Mis cuentas</div>
            <span style={s.badge}>{accounts.length}</span>
          </div>
          {accounts.length === 0 ? (
            <div style={s.empty}>No tenés cuentas registradas</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {accounts.map((a) => <AccountChip key={a.id} account={a} />)}
            </div>
          )}
        </div>

        {/* Movimientos recientes */}
        <div style={s.card}>
          <div style={s.sectionHeader}>
            <div style={s.sectionTitle}>Últimos movimientos</div>
            <span style={s.badge}>{recent.length}</span>
          </div>
          {recent.length === 0 ? (
            <div style={s.empty}>Sin movimientos registrados</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {recent.map((tx) => (
                <TxRow key={tx.id} tx={tx} accountIds={accountIds} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// ── Estilos ──────────────────────────────────────────────────
const s = {
  page: {
    padding: "32px 36px",
    maxWidth: 1100,
    margin: "0 auto",
    minHeight: "100vh",
  },
  center: {
    display: "flex", alignItems: "center", justifyContent: "center",
    height: "100%", minHeight: 300,
  },
  spinner: {
    width: 28, height: 28, borderRadius: "50%",
    border: "2.5px solid var(--border)",
    borderTopColor: "var(--accent-gold)",
    animation: "spin 0.8s linear infinite",
  },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    marginBottom: 28,
  },
  greeting: {
    fontSize: 22, fontWeight: 600, color: "var(--text-primary)",
    fontFamily: "'Playfair Display', serif", letterSpacing: "-0.3px",
  },
  greetingSub: {
    fontSize: 13, color: "var(--text-muted)", marginTop: 4,
  },
  dateBadge: {
    fontSize: 12, color: "var(--text-secondary)",
    background: "var(--surface)", border: "1px solid var(--border)",
    padding: "6px 14px", borderRadius: 20,
    textTransform: "capitalize",
  },
  heroCard: {
    position: "relative", overflow: "hidden",
    background: "linear-gradient(135deg, var(--navy-900) 0%, var(--navy-800) 100%)",
    border: "1px solid var(--border-accent)",
    borderRadius: "var(--radius)", padding: "28px 32px", marginBottom: 20,
  },
  heroBg: {
    position: "absolute", top: -40, right: -40,
    width: 200, height: 200, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  heroLabel: {
    fontSize: 11, color: "var(--accent-gold)", textTransform: "uppercase",
    letterSpacing: "2px", fontWeight: 500, marginBottom: 8,
  },
  heroAmount: {
    fontSize: 38, fontWeight: 700, color: "var(--text-primary)",
    fontFamily: "'Playfair Display', serif", letterSpacing: "-1px", marginBottom: 6,
  },
  heroSub: { fontSize: 13, color: "var(--text-muted)" },
  statsRow: {
    display: "flex", gap: 14, marginBottom: 20,
  },
  card: {
    background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: "var(--radius)", padding: "22px 24px",
  },
  cardLabel: {
    fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase",
    letterSpacing: "1.5px", fontWeight: 500, marginBottom: 8,
  },
  cardValue: {
    fontSize: 22, fontWeight: 700, letterSpacing: "-0.5px",
  },
  cardSub: { fontSize: 11, color: "var(--text-muted)", marginTop: 4 },
  iconBox: {
    width: 36, height: 36, borderRadius: 10,
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  grid: {
    display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16,
  },
  sectionHeader: {
    display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14, fontWeight: 600, color: "var(--text-primary)",
  },
  badge: {
    fontSize: 11, fontWeight: 600, background: "var(--accent-gold-dim)",
    color: "var(--accent-gold)", border: "1px solid var(--border-accent)",
    padding: "2px 8px", borderRadius: 10,
  },
  empty: {
    textAlign: "center", padding: "32px 0",
    fontSize: 13, color: "var(--text-muted)",
  },
  accountChip: {
    background: "var(--surface-2)", border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)", padding: "14px 16px",
  },
  accountNum: {
    fontFamily: "monospace", fontSize: 12, color: "var(--text-secondary)",
    letterSpacing: "0.5px", marginBottom: 2,
  },
  accountType: {
    fontSize: 12, fontWeight: 500, textTransform: "capitalize",
  },
  accountBadge: {
    fontSize: 10, fontWeight: 600, border: "1px solid",
    padding: "2px 7px", borderRadius: 8, letterSpacing: "0.5px",
  },
  accountBalance: {
    fontSize: 20, fontWeight: 700, marginTop: 10,
    fontFamily: "'Playfair Display', serif",
  },
  txRow: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "12px 0", borderBottom: "1px solid var(--border)",
  },
  txDot: {
    width: 32, height: 32, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  txTitle: { fontSize: 13, fontWeight: 500, color: "var(--text-primary)" },
  txSub:   { fontSize: 11, color: "var(--text-muted)", marginTop: 2 },
  txAmount:{ fontSize: 13, fontWeight: 700 },
  txDate:  { fontSize: 11, color: "var(--text-muted)", marginTop: 2 },
};
