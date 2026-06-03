import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../api";
import { useAuth } from "../context/AuthContext";

const TYPE_LABELS = {
  credit: "Depósito",
  debit: "Retiro",
  transfer: "Transferencia",
};

const formatCurrency = (value, currency = "USD") =>
  `${currency === "GTQ" ? "Q" : currency === "EUR" ? "€" : "$"}${Number(value).toLocaleString("es-GT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value) =>
  new Date(value).toLocaleString("es-GT", {
    dateStyle: "medium",
    timeStyle: "short",
  });

const badgeStyle = (type) => ({
  credit: s.badgeCredit,
  debit: s.badgeDebit,
  transfer: s.badgeTransfer,
}[type] || s.badgeNeutral);

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadTransactions = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await apiGet("/transactions");
        setTransactions(data.data || []);
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
    };

    loadTransactions();
  }, [logout, navigate]);

  const filteredTransactions = useMemo(() => {
    if (filter === "all") return transactions;
    return transactions.filter((item) => item.type === filter);
  }, [filter, transactions]);

  const totals = useMemo(() => {
    return transactions.reduce(
      (acc, tx) => {
        const amount = Number(tx.amount || 0);
        if (tx.type === "credit") acc.inflow += amount;
        if (tx.type === "debit") acc.outflow += amount;
        if (tx.type === "transfer") acc.transfer += amount;
        acc.balance = Number(tx.balance_after || acc.balance);
        return acc;
      },
      { inflow: 0, outflow: 0, transfer: 0, balance: 0 },
    );
  }, [transactions]);

  return (
    <div style={s.root}>
      <header style={s.header}>
        <div>
          <h1 style={s.title}>Estado de cuenta</h1>
          <p style={s.subtitle}>Consulta los movimientos recientes, revisa tus transacciones y filtra por tipo.</p>
        </div>
        <select style={s.select} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">Todos</option>
          <option value="credit">Depósitos</option>
          <option value="debit">Retiros</option>
          <option value="transfer">Transferencias</option>
        </select>
      </header>

      <section style={s.statsGrid}>
        <article style={s.statCard}>
          <span style={s.statLabel}>Ingresos</span>
          <strong style={s.statValue}>{formatCurrency(totals.inflow, "GTQ")}</strong>
        </article>
        <article style={s.statCard}>
          <span style={s.statLabel}>Egresos</span>
          <strong style={s.statValue}>{formatCurrency(totals.outflow, "GTQ")}</strong>
        </article>
        <article style={s.statCard}>
          <span style={s.statLabel}>Transferencias</span>
          <strong style={s.statValue}>{formatCurrency(totals.transfer, "GTQ")}</strong>
        </article>
        <article style={s.statCard}>
          <span style={s.statLabel}>Saldo último</span>
          <strong style={s.statValue}>{formatCurrency(totals.balance, "GTQ")}</strong>
        </article>
      </section>

      {error && <div style={s.alertError}>{error}</div>}

      <div style={s.tableWrap}>
        {loading ? (
          <div style={s.loading}>Cargando movimientos...</div>
        ) : filteredTransactions.length === 0 ? (
          <div style={s.emptyState}>
            <h2 style={s.emptyTitle}>No hay movimientos para mostrar</h2>
            <p style={s.emptyText}>Cambia el filtro o revisa más tarde.</p>
          </div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Fecha</th>
                <th style={s.th}>Cuenta</th>
                <th style={s.th}>Descripción</th>
                <th style={s.th}>Tipo</th>
                <th style={s.th}>Monto</th>
                <th style={s.th}>Saldo</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((movement) => (
                <tr key={movement.id} style={s.tr}>
                  <td style={s.td}>{formatDate(movement.created_at)}</td>
                  <td style={s.td}>{movement.account_number}</td>
                  <td style={s.td}>{movement.description || "-"}</td>
                  <td style={s.td}>
                    <span style={{ ...s.badge, ...badgeStyle(movement.type) }}>
                      {TYPE_LABELS[movement.type] || movement.type}
                    </span>
                  </td>
                  <td style={s.td}>{formatCurrency(movement.amount, "GTQ")}</td>
                  <td style={s.td}>{formatCurrency(movement.balance_after, "GTQ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 24,
    marginBottom: 22,
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
  select: {
    minWidth: 180,
    padding: "12px 14px",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "var(--navy-900)",
    color: "var(--text-primary)",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    padding: 22,
    borderRadius: 20,
    background: "var(--surface)",
    boxShadow: "0 20px 60px rgba(4, 19, 56, 0.08)",
  },
  statLabel: {
    display: "block",
    fontSize: 13,
    color: "var(--text-muted)",
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 700,
  },
  alertError: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    background: "rgba(242, 76, 76, 0.12)",
    color: "#f24343",
  },
  tableWrap: {
    overflowX: "auto",
    borderRadius: 24,
    background: "var(--surface)",
    boxShadow: "0 20px 60px rgba(4, 19, 56, 0.08)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    padding: "18px 20px",
    textAlign: "left",
    fontSize: 13,
    letterSpacing: "0.03em",
    color: "var(--text-muted)",
    textTransform: "uppercase",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  tr: {
    transition: "background 0.2s ease",
  },
  td: {
    padding: "18px 20px",
    color: "var(--text-primary)",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    verticalAlign: "middle",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 12px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.02em",
  },
  badgeCredit: {
    background: "rgba(20, 163, 108, 0.14)",
    color: "#14a36c",
  },
  badgeDebit: {
    background: "rgba(242, 76, 76, 0.14)",
    color: "#f24343",
  },
  badgeTransfer: {
    background: "rgba(95, 73, 255, 0.14)",
    color: "#5f49ff",
  },
  badgeNeutral: {
    background: "rgba(148, 163, 184, 0.14)",
    color: "#94a3b8",
  },
  loading: {
    padding: 32,
    textAlign: "center",
    color: "var(--text-muted)",
  },
  emptyState: {
    padding: 32,
    textAlign: "center",
    color: "var(--text-muted)",
  },
  emptyTitle: {
    margin: 0,
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 10,
  },
  emptyText: {
    margin: 0,
    lineHeight: 1.75,
  },
};
