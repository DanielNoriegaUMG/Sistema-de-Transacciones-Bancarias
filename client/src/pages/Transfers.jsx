import React, { useState, useEffect, useCallback } from "react";

const CURRENCY_SYMBOLS = { USD: "$", GTQ: "Q", EUR: "€" };
const fmtMoney = (amount, currency = "USD") =>
  `${CURRENCY_SYMBOLS[currency] || ""}${Number(amount).toLocaleString("es-GT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const maskAccount = (accountNumber) =>
  accountNumber ? `**** **** **** ${accountNumber.slice(-4)}` : "";

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export default function Transfers() {
  const [accounts, setAccounts] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [form, setForm] = useState({
    fromAccountId: "",
    toAccountId: "",
    amount: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem("banco_token");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [accountsRes, transfersRes] = await Promise.all([
        fetch("/api/accounts", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/transfers", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const accountsData = await accountsRes.json();
      const transfersData = await transfersRes.json();

      if (!accountsData.success) {
        throw new Error(accountsData.message || "Error cargando cuentas.");
      }
      if (!transfersData.success) {
        throw new Error(transfersData.message || "Error cargando transferencias.");
      }

      setAccounts(accountsData.data);
      setTransfers(transfersData.data);
      if (!form.fromAccountId && accountsData.data.length > 0) {
        setForm((prev) => ({ ...prev, fromAccountId: String(accountsData.data[0].id), toAccountId: String(accountsData.data.length > 1 ? accountsData.data[1].id : accountsData.data[0].id) }));
      }
    } catch (err) {
      setError(err.message || "Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  }, [token, form.fromAccountId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formError) setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSuccessMsg("");

    if (!form.fromAccountId || !form.toAccountId || !form.amount) {
      setFormError("Completa todos los campos obligatorios.");
      return;
    }
    if (form.fromAccountId === form.toAccountId) {
      setFormError("La cuenta de origen y destino no pueden ser iguales.");
      return;
    }
    const amount = Number(form.amount);
    if (!amount || amount <= 0) {
      setFormError("Ingresa un monto válido mayor a cero.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/transfers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fromAccountId: Number(form.fromAccountId),
          toAccountId: Number(form.toAccountId),
          amount,
          description: form.description.trim(),
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setFormError(data.message || "No se pudo crear la transferencia.");
        return;
      }
      setSuccessMsg("Transferencia realizada correctamente.");
      setForm({ ...form, amount: "", description: "" });
      fetchData();
    } catch {
      setFormError("Error de conexión con el servidor.");
    } finally {
      setSubmitting(false);
    }
  };

  const originAccount = accounts.find((a) => String(a.id) === form.fromAccountId);

  return (
    <div style={s.root}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Transferencias</h1>
          <p style={s.subtitle}>Envía dinero entre tus cuentas o a otros beneficiarios registrados.</p>
        </div>
        <div style={s.actionRow}>
          <span style={s.smallText}>Tus cuentas registradas: {accounts.length}</span>
          <button style={s.primaryBtn} onClick={fetchData}>
            <PlusIcon /> Actualizar
          </button>
        </div>
      </div>

      {error && <div style={s.alertError}>{error}</div>}
      {successMsg && <div style={s.alertSuccess}>{successMsg}</div>}

      <div style={s.grid}>
        <section style={s.panel}>
          <h2 style={s.panelTitle}>Nueva transferencia</h2>
          <form onSubmit={handleSubmit} style={s.form}>
            <label style={s.label}>
              Cuenta de origen
              <select name="fromAccountId" value={form.fromAccountId} onChange={handleChange} style={s.select}>
                <option value="">Selecciona una cuenta</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {maskAccount(account.account_number)} — {account.alias || account.account_number} ({CURRENCY_SYMBOLS[account.currency]}{account.balance})
                  </option>
                ))}
              </select>
            </label>

            <label style={s.label}>
              Cuenta de destino
              <select name="toAccountId" value={form.toAccountId} onChange={handleChange} style={s.select}>
                <option value="">Selecciona una cuenta</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {maskAccount(account.account_number)} — {account.alias || account.account_number} ({account.currency})
                  </option>
                ))}
              </select>
            </label>

            <label style={s.label}>
              Monto
              <input
                type="number"
                step="0.01"
                min="0"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                style={s.input}
                placeholder="0.00"
              />
            </label>

            <label style={s.label}>
              Descripción opcional
              <input
                type="text"
                name="description"
                value={form.description}
                onChange={handleChange}
                style={s.input}
                placeholder="Pago de servicios, transferencia entre cuentas, etc."
              />
            </label>

            {originAccount && (
              <div style={s.balanceInfo}>
                <strong>Saldo disponible:</strong> {fmtMoney(originAccount.balance, originAccount.currency)}
              </div>
            )}

            {formError && <div style={s.formError}>{formError}</div>}

            <button type="submit" style={s.submitBtn} disabled={submitting || loading}>
              {submitting ? "Enviando..." : "Realizar transferencia"}
            </button>
          </form>
        </section>

        <section style={s.panel}>
          <div style={s.panelHeader}>
            <h2 style={s.panelTitle}>Últimas transferencias</h2>
            <span style={s.metaText}>{transfers.length} registros</span>
          </div>
          {loading ? (
            <p style={s.loadingText}>Cargando transferencias...</p>
          ) : transfers.length === 0 ? (
            <div style={s.emptyState}>
              <p>No hay transferencias registradas todavía.</p>
            </div>
          ) : (
            <div style={s.transferList}>
              {transfers.map((item) => (
                <article key={item.id} style={s.transferCard}>
                  <div style={s.transferRow}>
                    <span style={s.transferLabel}>Origen</span>
                    <strong>{maskAccount(item.from_account_number)}</strong>
                  </div>
                  <div style={s.transferRow}>
                    <span style={s.transferLabel}>Destino</span>
                    <strong>{maskAccount(item.to_account_number)}</strong>
                  </div>
                  <div style={s.transferRow}>
                    <span style={s.transferLabel}>Monto</span>
                    <strong>{fmtMoney(item.amount, originAccount?.currency)}</strong>
                  </div>
                  <div style={s.transferRow}>
                    <span style={s.transferLabel}>Estado</span>
                    <span style={item.status === "completed" ? s.statusSuccess : s.statusPending}>{item.status}</span>
                  </div>
                  <div style={s.transferFooter}>
                    <span>{new Date(item.created_at).toLocaleString("es-GT", { dateStyle: "medium", timeStyle: "short" })}</span>
                    {item.description && <span style={s.description}>{item.description}</span>}
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
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 16,
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
  actionRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  smallText: {
    color: "var(--text-muted)",
  },
  primaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "12px 18px",
    background: "var(--accent-gold)",
    color: "var(--text-dark)",
    border: "none",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 700,
  },
  alertError: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    background: "rgba(242, 76, 76, 0.12)",
    color: "#f24343",
  },
  alertSuccess: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    background: "rgba(82, 196, 26, 0.12)",
    color: "#2f8f1f",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 20,
  },
  panel: {
    background: "var(--surface)",
    borderRadius: 24,
    padding: 24,
    boxShadow: "0 20px 70px rgba(4, 19, 56, 0.12)",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  panelTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
  },
  metaText: {
    color: "var(--text-muted)",
    fontSize: 14,
  },
  form: {
    display: "grid",
    gap: 16,
  },
  label: {
    display: "grid",
    gap: 8,
    color: "var(--text-secondary)",
    fontSize: 14,
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "var(--navy-900)",
    color: "var(--text-primary)",
  },
  select: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "var(--navy-900)",
    color: "var(--text-primary)",
  },
  balanceInfo: {
    padding: "12px 16px",
    borderRadius: 14,
    background: "rgba(255,255,255,0.04)",
    color: "var(--text-secondary)",
  },
  formError: {
    padding: 12,
    borderRadius: 14,
    background: "rgba(242, 76, 76, 0.12)",
    color: "#f24343",
  },
  submitBtn: {
    marginTop: 4,
    width: "100%",
    padding: "14px 16px",
    borderRadius: 14,
    border: "none",
    background: "var(--accent-gold)",
    color: "var(--text-dark)",
    fontWeight: 700,
    cursor: "pointer",
  },
  loadingText: {
    color: "var(--text-muted)",
  },
  emptyState: {
    padding: 24,
    borderRadius: 18,
    background: "rgba(255,255,255,0.03)",
    color: "var(--text-muted)",
    textAlign: "center",
  },
  transferList: {
    display: "grid",
    gap: 16,
  },
  transferCard: {
    display: "grid",
    gap: 10,
    padding: 18,
    borderRadius: 18,
    background: "rgba(255,255,255,0.03)",
  },
  transferRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 8,
    color: "var(--text-secondary)",
  },
  transferLabel: {
    fontSize: 13,
  },
  transferFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    color: "var(--text-muted)",
    fontSize: 13,
    marginTop: 8,
  },
  statusSuccess: {
    color: "#4bb543",
    fontWeight: 700,
  },
  statusPending: {
    color: "#f2c94c",
    fontWeight: 700,
  },
};
