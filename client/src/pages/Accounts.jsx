import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../api";
import { useAuth } from "../context/AuthContext";

const CURRENCY_SYMBOLS = { USD: "$", GTQ: "Q", EUR: "€" };
const fmtMoney = (amount, currency = "USD") =>
  `${CURRENCY_SYMBOLS[currency] || ""}${Number(amount).toLocaleString("es-GT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const maskAccount = (account) =>
  account ? `**** **** **** ${account.slice(-4)}` : "";

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { logout } = useAuth();
  const navigate = useNavigate();

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await apiGet("/accounts");
      setAccounts(data.data || []);
    } catch (err) {
      if (err?.unauthorized) {
        logout();
        navigate("/login", { replace: true });
        return;
      }
      setError(err.message || "Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  }, [logout, navigate]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const balanceSummary = accounts.reduce((summary, account) => {
    const currency = account.currency || "USD";
    summary[currency] = (summary[currency] || 0) + Number(account.balance || 0);
    return summary;
  }, {});

  return (
    <div style={s.root}>
      <header style={s.header}>
        <div>
          <h1 style={s.title}>Mis cuentas</h1>
          <p style={s.subtitle}>Revisa tus saldos, alias y tipos de cuenta desde un solo lugar.</p>
        </div>
        <button style={s.refreshBtn} onClick={fetchAccounts} disabled={loading}>
          {loading ? "Actualizando..." : "Actualizar"}
        </button>
      </header>

      {error && <div style={s.alertError}>{error}</div>}

      <section style={s.summaryGrid}>
        <article style={s.summaryCard}>
          <span style={s.summaryLabel}>Total de cuentas</span>
          <strong style={s.summaryValue}>{accounts.length}</strong>
        </article>
        {Object.entries(balanceSummary).map(([currency, amount]) => (
          <article key={currency} style={s.summaryCard}>
            <span style={s.summaryLabel}>Saldo total ({currency})</span>
            <strong style={s.summaryValue}>{fmtMoney(amount, currency)}</strong>
          </article>
        ))}
      </section>

      <section style={s.grid}>
        {loading ? (
          <div style={s.loadingState}>Cargando cuentas...</div>
        ) : accounts.length === 0 ? (
          <div style={s.emptyState}>
            <h2 style={s.emptyTitle}>Aún no tienes cuentas registradas</h2>
            <p style={s.emptyText}>Una vez inicies sesión, tus cuentas aparecerán aquí automáticamente.</p>
          </div>
        ) : (
          accounts.map((account) => (
            <article key={account.id} style={s.accountCard}>
              <div style={s.accountHeader}>
                <div>
                  <span style={s.accountType}>{account.type || "Cuenta"}</span>
                  <h2 style={s.accountTitle}>{account.alias || `Cuenta ${account.id}`}</h2>
                </div>
                <span style={s.currencyTag}>{account.currency || "USD"}</span>
              </div>
              <p style={s.accountNumber}>{maskAccount(account.account_number)}</p>
              <div style={s.accountRow}>
                <span style={s.accountLabel}>Saldo disponible</span>
                <strong style={s.accountBalance}>{fmtMoney(account.balance, account.currency)}</strong>
              </div>
              <div style={s.accountRow}> 
                <span style={s.accountLabel}>Número de cuenta</span>
                <span style={s.accountValue}>{account.account_number}</span>
              </div>
            </article>
          ))
        )}
      </section>
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
    alignItems: "center",
    justifyContent: "space-between",
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
  refreshBtn: {
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
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16,
    marginBottom: 28,
  },
  summaryCard: {
    padding: 22,
    borderRadius: 20,
    background: "var(--surface)",
    boxShadow: "0 20px 60px rgba(4, 19, 56, 0.08)",
  },
  summaryLabel: {
    display: "block",
    color: "var(--text-muted)",
    marginBottom: 10,
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: 700,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 20,
  },
  loadingState: {
    gridColumn: "1 / -1",
    padding: 32,
    borderRadius: 22,
    background: "var(--surface)",
    color: "var(--text-muted)",
    textAlign: "center",
  },
  emptyState: {
    gridColumn: "1 / -1",
    padding: 32,
    borderRadius: 22,
    background: "var(--surface)",
    color: "var(--text-muted)",
    textAlign: "center",
  },
  emptyTitle: {
    margin: 0,
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 8,
  },
  emptyText: {
    margin: 0,
    lineHeight: 1.75,
  },
  accountCard: {
    padding: 24,
    borderRadius: 24,
    background: "var(--surface)",
    boxShadow: "0 18px 50px rgba(4, 19, 56, 0.08)",
  },
  accountHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 18,
  },
  accountType: {
    display: "inline-flex",
    padding: "6px 12px",
    borderRadius: 999,
    background: "rgba(255, 255, 255, 0.06)",
    color: "var(--text-muted)",
    fontSize: 12,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  accountTitle: {
    margin: "8px 0 0",
    fontSize: 20,
    fontWeight: 700,
  },
  currencyTag: {
    padding: "8px 12px",
    borderRadius: 16,
    background: "rgba(255, 255, 255, 0.05)",
    color: "var(--text-primary)",
    fontWeight: 700,
  },
  accountNumber: {
    margin: 0,
    color: "var(--text-secondary)",
    letterSpacing: "0.2em",
    fontSize: 14,
    marginBottom: 20,
  },
  accountRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
    marginTop: 12,
  },
  accountLabel: {
    color: "var(--text-muted)",
    fontSize: 13,
  },
  accountBalance: {
    fontSize: 18,
    fontWeight: 700,
  },
  accountValue: {
    color: "var(--text-primary)",
    fontWeight: 600,
  },
};
