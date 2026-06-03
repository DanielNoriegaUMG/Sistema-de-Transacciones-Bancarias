import React, { useEffect, useMemo, useState } from "react";

const currencySymbol = (currency) => {
  if (currency === "GTQ") return "Q";
  if (currency === "EUR") return "€";
  return "$";
};

const fmt = (value, currency = "USD") =>
  `${currencySymbol(currency)}${Number(value).toLocaleString("es-GT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value) =>
  new Date(value).toLocaleDateString("es-GT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function Dashboard() {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("banco_token");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");

      try {
        const [accountsRes, transactionsRes, transfersRes] = await Promise.all([
          fetch("/api/accounts", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/transactions", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/transfers", { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const [accountsData, transactionsData, transfersData] = await Promise.all([
          accountsRes.json(),
          transactionsRes.json(),
          transfersRes.json(),
        ]);

        if (!accountsRes.ok || !accountsData.success) {
          throw new Error(accountsData.message || "Error al cargar cuentas.");
        }
        if (!transactionsRes.ok || !transactionsData.success) {
          throw new Error(transactionsData.message || "Error al cargar movimientos.");
        }
        if (!transfersRes.ok || !transfersData.success) {
          throw new Error(transfersData.message || "Error al cargar transferencias.");
        }

        setAccounts(accountsData.data || []);
        setTransactions(transactionsData.data || []);
        setTransfers(transfersData.data || []);
      } catch (err) {
        setError(err.message || "No se pudieron cargar los datos del dashboard.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token]);

  const summary = useMemo(() => {
    const totalBalance = accounts.reduce((sum, account) => sum + Number(account.balance || 0), 0);
    const totalAccounts = accounts.length;
    const totalTransactions = transactions.length;
    const totalTransfers = transfers.length;
    const recentMovement = transactions[0] || null;
    const recentTransfer = transfers[0] || null;
    return { totalBalance, totalAccounts, totalTransactions, totalTransfers, recentMovement, recentTransfer };
  }, [accounts, transactions, transfers]);

  return (
    <div style={s.root}>
      <header style={s.header}>
        <div>
          <h1 style={s.title}>Dashboard</h1>
          <p style={s.subtitle}>Resumen de cuentas, actividad reciente y transferencias más recientes.</p>
        </div>
      </header>

      {error && <div style={s.alertError}>{error}</div>}

      <section style={s.cardsGrid}>
        <article style={s.card}>
          <span style={s.cardLabel}>Cuentas activas</span>
          <strong style={s.cardValue}>{summary.totalAccounts}</strong>
        </article>
        <article style={s.card}>
          <span style={s.cardLabel}>Saldo total</span>
          <strong style={s.cardValue}>{fmt(summary.totalBalance, accounts[0]?.currency || "GTQ")}</strong>
        </article>
        <article style={s.card}>
          <span style={s.cardLabel}>Movimientos recientes</span>
          <strong style={s.cardValue}>{summary.totalTransactions}</strong>
        </article>
        <article style={s.card}>
          <span style={s.cardLabel}>Transferencias</span>
          <strong style={s.cardValue}>{summary.totalTransfers}</strong>
        </article>
      </section>

      <div style={s.grid}>
        <section style={s.panel}>
          <div style={s.panelHeader}>
            <div>
              <h2 style={s.panelTitle}>Últimos movimientos</h2>
              <p style={s.panelSubtitle}>Los movimientos más recientes en tus cuentas.</p>
            </div>
            <span style={s.metaText}>{transactions.length} registros</span>
          </div>

          {loading ? (
            <p style={s.loading}>Cargando movimientos...</p>
          ) : transactions.length === 0 ? (
            <div style={s.emptyState}>No hay movimientos recientes.</div>
          ) : (
            <div style={s.list}>
              {transactions.slice(0, 5).map((tx) => (
                <article key={tx.id} style={s.listItem}>
                  <div>
                    <strong style={s.itemTitle}>{tx.description || "Movimiento"}</strong>
                    <p style={s.itemMeta}>{tx.account_number} • {formatDate(tx.created_at)}</p>
                  </div>
                  <div style={s.itemRight}>
                    <span style={s.amount}>{fmt(tx.amount, "GTQ")}</span>
                    <span style={s.typeBadge}>{tx.type}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section style={s.panel}>
          <div style={s.panelHeader}>
            <div>
              <h2 style={s.panelTitle}>Transferencias recientes</h2>
              <p style={s.panelSubtitle}>Revisa los últimos envíos entre cuentas.</p>
            </div>
            <span style={s.metaText}>{transfers.length} registros</span>
          </div>

          {loading ? (
            <p style={s.loading}>Cargando transferencias...</p>
          ) : transfers.length === 0 ? (
            <div style={s.emptyState}>No hay transferencias recientes.</div>
          ) : (
            <div style={s.list}>
              {transfers.slice(0, 5).map((transfer) => (
                <article key={transfer.id} style={s.listItem}>
                  <div>
                    <strong style={s.itemTitle}>De {transfer.from_account_number} a {transfer.to_account_number}</strong>
                    <p style={s.itemMeta}>{formatDate(transfer.created_at)}</p>
                  </div>
                  <div style={s.itemRight}>
                    <span style={s.amount}>{fmt(transfer.amount, "GTQ")}</span>
                    <span style={s.typeBadge}>{transfer.status}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

const s = {
  root: {
    padding: 24,
    color: "var(--text-primary)",
  },
  header: {
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
  alertError: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    background: "rgba(242, 76, 76, 0.12)",
    color: "#f24343",
  },
  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 16,
    marginBottom: 24,
  },
  card: {
    padding: 22,
    borderRadius: 24,
    background: "var(--surface)",
    boxShadow: "0 20px 60px rgba(4, 19, 56, 0.08)",
  },
  cardLabel: {
    display: "block",
    color: "var(--text-muted)",
    marginBottom: 10,
    fontSize: 13,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: 700,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1.3fr 0.9fr",
    gap: 20,
  },
  panel: {
    padding: 24,
    borderRadius: 24,
    background: "var(--surface)",
    boxShadow: "0 20px 60px rgba(4, 19, 56, 0.08)",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 18,
  },
  panelTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
  },
  panelSubtitle: {
    margin: "6px 0 0",
    color: "var(--text-muted)",
    fontSize: 14,
  },
  metaText: {
    color: "var(--text-muted)",
    fontSize: 13,
  },
  loading: {
    padding: 28,
    color: "var(--text-muted)",
  },
  emptyState: {
    padding: 28,
    borderRadius: 20,
    background: "rgba(255,255,255,0.04)",
    color: "var(--text-muted)",
    textAlign: "center",
  },
  list: {
    display: "grid",
    gap: 16,
  },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    padding: 18,
    borderRadius: 18,
    background: "rgba(255,255,255,0.03)",
  },
  itemTitle: {
    margin: 0,
    fontSize: 15,
    fontWeight: 700,
  },
  itemMeta: {
    margin: "8px 0 0",
    color: "var(--text-muted)",
    fontSize: 13,
  },
  itemRight: {
    display: "grid",
    alignItems: "end",
    gap: 8,
    textAlign: "right",
  },
  amount: {
    fontSize: 16,
    fontWeight: 700,
  },
  typeBadge: {
    display: "inline-flex",
    padding: "6px 12px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.08)",
    color: "var(--text-primary)",
    fontSize: 12,
    fontWeight: 700,
    textTransform: "uppercase",
  },
};
