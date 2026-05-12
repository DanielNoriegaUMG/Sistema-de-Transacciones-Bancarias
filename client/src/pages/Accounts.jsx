import React, { useState, useEffect, useCallback } from "react";

const TYPE_LABELS = {
  checking: "Cuenta corriente",
  savings: "Cuenta de ahorros",
};
const CURRENCY_LABELS = {
  USD: "USD — Dólar",
  GTQ: "GTQ — Quetzal",
  EUR: "EUR — Euro",
};
const CURRENCY_SYMBOLS = { USD: "$", GTQ: "Q", EUR: "€" };

// Formatea número como moneda
const fmt = (amount, currency = "USD") =>
  `${CURRENCY_SYMBOLS[currency] || ""}${parseFloat(amount).toLocaleString(
    "en-US",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  )}`;

// Formatea fecha
const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("es-GT", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

// Enmascara número de cuenta mostrando solo los últimos 4 dígitos
const maskAccount = (num) => `**** **** **** ${num.slice(-4)}`;

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null); // cuenta en detalle
  const [form, setForm] = useState({
    alias: "",
    currency: "USD",
    type: "checking",
  });
  const [formError, setFormError] = useState("");
  const [creating, setCreating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const token = localStorage.getItem("banco_token");

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/accounts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setAccounts(data.data);
      } else {
        setError(data.message || "No se pudieron cargar las cuentas.");
      }
    } catch {
      setError("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError("");
    setCreating(true);
    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setForm({ alias: "", currency: "USD", type: "checking" });
        setSuccessMsg("Cuenta creada correctamente.");
        setTimeout(() => setSuccessMsg(""), 4000);
        fetchAccounts();
      } else {
        setFormError(data.message || "No se pudo crear la cuenta.");
      }
    } catch {
      setFormError("Error de conexión con el servidor.");
    } finally {
      setCreating(false);
    }
  };

  // Calcular totales por moneda para el resumen
  const totals = accounts.reduce((acc, c) => {
    acc[c.currency] = (acc[c.currency] || 0) + parseFloat(c.balance);
    return acc;
  }, {});

  return (
    <div style={s.root}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.pageTitle}>Mis cuentas</h1>
          <p style={s.pageSub}>
            {accounts.length === 0 && !loading
              ? "No tienes cuentas registradas."
              : `${accounts.length} cuenta${accounts.length !== 1 ? "s" : ""} registrada${accounts.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button
          style={s.btnPrimary}
          onClick={() => {
            setShowModal(true);
            setFormError("");
          }}
        >
          <PlusIcon /> Nueva cuenta
        </button>
      </div>

      {/* Mensaje de éxito */}
      {successMsg && (
        <div style={s.successBanner}>
          <CheckIcon size={15} /> {successMsg}
        </div>
      )}

      {/* Error de carga */}
      {error && (
        <div style={s.errorBanner}>
          <AlertIcon size={15} /> {error}
          <button style={s.retryBtn} onClick={fetchAccounts}>
            Reintentar
          </button>
        </div>
      )}

      {/* Estado de carga */}
      {loading && (
        <div style={s.loadingWrap}>
          <div style={s.spinner} />
          <span style={s.loadingText}>Cargando cuentas...</span>
        </div>
      )}

      {/* Resumen de saldos por moneda */}
      {!loading && accounts.length > 0 && (
        <div style={s.summaryRow}>
          {Object.entries(totals).map(([cur, total]) => (
            <div key={cur} style={s.summaryCard}>
              <span style={s.summaryLabel}>Total {cur}</span>
              <span style={s.summaryAmount}>{fmt(total, cur)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Grid de cuentas */}
      {!loading && !error && accounts.length > 0 && (
        <div style={s.grid}>
          {accounts.map((cuenta) => (
            <AccountCard
              key={cuenta.id}
              cuenta={cuenta}
              onDetail={() => setSelected(cuenta)}
            />
          ))}
        </div>
      )}

      {/* Estado vacío */}
      {!loading && !error && accounts.length === 0 && (
        <div style={s.emptyState}>
          <div style={s.emptyIcon}>
            <CardIcon size={32} />
          </div>
          <p style={s.emptyTitle}>No tienes cuentas aún</p>
          <p style={s.emptySub}>
            Crea tu primera cuenta para comenzar a operar.
          </p>
          <button style={s.btnPrimary} onClick={() => setShowModal(true)}>
            <PlusIcon /> Crear cuenta
          </button>
        </div>
      )}

      {/* Modal — nueva cuenta */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <h2 style={s.modalTitle}>Nueva cuenta</h2>
          <p style={s.modalSub}>
            La cuenta se creará con saldo inicial de $0.00
          </p>

          <form onSubmit={handleCreate} style={s.form} noValidate>
            <Field label="Alias (opcional)">
              <input
                style={s.input}
                type="text"
                placeholder="Ej. Cuenta principal"
                value={form.alias}
                onChange={(e) =>
                  setForm((p) => ({ ...p, alias: e.target.value }))
                }
                maxLength={50}
              />
            </Field>

            <Field label="Tipo de cuenta">
              <select
                style={s.select}
                value={form.type}
                onChange={(e) =>
                  setForm((p) => ({ ...p, type: e.target.value }))
                }
              >
                {Object.entries(TYPE_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Moneda">
              <select
                style={s.select}
                value={form.currency}
                onChange={(e) =>
                  setForm((p) => ({ ...p, currency: e.target.value }))
                }
              >
                {Object.entries(CURRENCY_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </Field>

            {formError && (
              <div style={s.formError}>
                <AlertIcon size={13} /> {formError}
              </div>
            )}

            <div style={s.modalActions}>
              <button
                type="button"
                style={s.btnSecondary}
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>
              <button
                type="submit"
                style={{ ...s.btnPrimary, opacity: creating ? 0.75 : 1 }}
                disabled={creating}
              >
                {creating ? (
                  <>
                    <span style={s.spinnerSm} /> Creando...
                  </>
                ) : (
                  "Crear cuenta"
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal — detalle de cuenta */}
      {selected && (
        <Modal onClose={() => setSelected(null)}>
          <h2 style={s.modalTitle}>Detalle de cuenta</h2>
          <div style={s.detailGrid}>
            <DetailRow
              label="Número de cuenta"
              value={selected.account_number}
              mono
            />
            <DetailRow label="Alias" value={selected.alias || "—"} />
            <DetailRow
              label="Tipo"
              value={TYPE_LABELS[selected.type] || selected.type}
            />
            <DetailRow label="Moneda" value={selected.currency} />
            <DetailRow
              label="Saldo disponible"
              value={fmt(selected.balance, selected.currency)}
              highlight
            />
            <DetailRow
              label="Fecha de apertura"
              value={fmtDate(selected.created_at)}
            />
          </div>
          <button
            style={{ ...s.btnSecondary, marginTop: 24, width: "100%" }}
            onClick={() => setSelected(null)}
          >
            Cerrar
          </button>
        </Modal>
      )}

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0%{opacity:.5} 50%{opacity:1} 100%{opacity:.5} }
      `}</style>
    </div>
  );
}

// ── Sub-componentes ───────────────────────────────────────────

function AccountCard({ cuenta, onDetail }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      style={{
        ...s.card,
        ...(hover ? s.cardHover : {}),
        animation: "fadeUp .35s ease forwards",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div style={s.cardTop}>
        <div style={s.cardTypeWrap}>
          <span style={s.cardTypeBadge}>
            {TYPE_LABELS[cuenta.type] || cuenta.type}
          </span>
          <span style={s.cardCurrency}>{cuenta.currency}</span>
        </div>
        <button style={s.detailBtn} onClick={onDetail}>
          Ver detalle
        </button>
      </div>

      <div style={s.cardBalance}>{fmt(cuenta.balance, cuenta.currency)}</div>
      <div style={s.cardLabel}>Saldo disponible</div>

      <div style={s.cardDivider} />

      <div style={s.cardFooter}>
        <div>
          <div style={s.cardMeta}>Número de cuenta</div>
          <div style={s.cardNumber}>{maskAccount(cuenta.account_number)}</div>
        </div>
        {cuenta.alias && (
          <div style={{ textAlign: "right" }}>
            <div style={s.cardMeta}>Alias</div>
            <div style={s.cardAlias}>{cuenta.alias}</div>
          </div>
        )}
      </div>

      <div style={s.cardDate}>Apertura: {fmtDate(cuenta.created_at)}</div>
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div
      style={s.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={s.modal}>
        <button style={s.closeBtn} onClick={onClose}>
          <CloseIcon />
        </button>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={s.field}>
      <label style={s.label}>{label}</label>
      {children}
    </div>
  );
}

function DetailRow({ label, value, mono, highlight }) {
  return (
    <div style={s.detailRow}>
      <span style={s.detailLabel}>{label}</span>
      <span
        style={{
          ...s.detailValue,
          ...(mono ? { fontFamily: "monospace", letterSpacing: "0.5px" } : {}),
          ...(highlight
            ? { color: "var(--accent-gold)", fontWeight: 600, fontSize: 16 }
            : {}),
        }}
      >
        {value}
      </span>
    </div>
  );
}

// ── Iconos SVG ────────────────────────────────────────────────
const PlusIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const CardIcon = ({ size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20" />
  </svg>
);
const CloseIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const AlertIcon = ({ size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    style={{ flexShrink: 0 }}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const CheckIcon = ({ size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0 }}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// ── Estilos ───────────────────────────────────────────────────
const s = {
  root: {
    padding: "40px 48px",
    minHeight: "100vh",
    animation: "fadeUp .4s ease forwards",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 32,
    gap: 16,
    flexWrap: "wrap",
  },
  pageTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 28,
    fontWeight: 700,
    color: "var(--text-primary)",
    letterSpacing: "-0.5px",
    marginBottom: 4,
  },
  pageSub: {
    fontSize: 14,
    color: "var(--text-secondary)",
  },
  summaryRow: {
    display: "flex",
    gap: 16,
    marginBottom: 32,
    flexWrap: "wrap",
  },
  summaryCard: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    padding: "14px 20px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    minWidth: 160,
  },
  summaryLabel: {
    fontSize: 11,
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    fontWeight: 600,
  },
  summaryAmount: {
    fontSize: 22,
    fontWeight: 600,
    color: "var(--accent-gold)",
    letterSpacing: "-0.3px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: 20,
  },
  card: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: "24px",
    transition: "border-color .2s, box-shadow .2s",
    cursor: "default",
  },
  cardHover: {
    borderColor: "var(--border-accent)",
    boxShadow: "var(--shadow-gold)",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  cardTypeWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  cardTypeBadge: {
    fontSize: 11,
    fontWeight: 600,
    color: "var(--accent-gold)",
    background: "var(--accent-gold-dim)",
    border: "1px solid var(--border-accent)",
    borderRadius: 100,
    padding: "3px 10px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  cardCurrency: {
    fontSize: 11,
    color: "var(--text-muted)",
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: 100,
    padding: "3px 10px",
    fontWeight: 500,
  },
  detailBtn: {
    background: "none",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    color: "var(--text-secondary)",
    fontSize: 12,
    padding: "5px 12px",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all .15s",
  },
  cardBalance: {
    fontSize: 30,
    fontWeight: 700,
    color: "var(--text-primary)",
    letterSpacing: "-0.8px",
    marginBottom: 4,
  },
  cardLabel: {
    fontSize: 12,
    color: "var(--text-muted)",
    marginBottom: 18,
  },
  cardDivider: {
    height: 1,
    background: "var(--border)",
    marginBottom: 16,
  },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 12,
  },
  cardMeta: {
    fontSize: 10,
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.7px",
    marginBottom: 3,
    fontWeight: 600,
  },
  cardNumber: {
    fontSize: 14,
    color: "var(--text-secondary)",
    fontFamily: "monospace",
    letterSpacing: "1px",
  },
  cardAlias: {
    fontSize: 13,
    color: "var(--text-secondary)",
  },
  cardDate: {
    fontSize: 11,
    color: "var(--text-muted)",
    marginTop: 14,
  },
  // Estados
  loadingWrap: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "48px 0",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 14,
    color: "var(--text-secondary)",
  },
  spinner: {
    width: 22,
    height: 22,
    border: "2px solid var(--border)",
    borderTop: "2px solid var(--accent-gold)",
    borderRadius: "50%",
    animation: "spin .8s linear infinite",
    flexShrink: 0,
  },
  spinnerSm: {
    width: 14,
    height: 14,
    border: "2px solid rgba(10,22,40,.3)",
    borderTop: "2px solid var(--navy-950)",
    borderRadius: "50%",
    display: "inline-block",
    animation: "spin .7s linear infinite",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 20px",
    gap: 12,
    textAlign: "center",
  },
  emptyIcon: {
    width: 64,
    height: 64,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--text-muted)",
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: "var(--text-primary)",
  },
  emptySub: {
    fontSize: 14,
    color: "var(--text-secondary)",
    marginBottom: 8,
  },
  // Banners
  successBanner: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 16px",
    background: "rgba(45,212,160,.08)",
    border: "1px solid rgba(45,212,160,.25)",
    borderRadius: "var(--radius-sm)",
    color: "var(--success)",
    fontSize: 13,
    marginBottom: 24,
  },
  errorBanner: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 16px",
    background: "rgba(240,90,90,.08)",
    border: "1px solid rgba(240,90,90,.25)",
    borderRadius: "var(--radius-sm)",
    color: "var(--error)",
    fontSize: 13,
    marginBottom: 24,
  },
  retryBtn: {
    marginLeft: "auto",
    background: "none",
    border: "1px solid rgba(240,90,90,.4)",
    borderRadius: 6,
    color: "var(--error)",
    fontSize: 12,
    padding: "3px 10px",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  // Botones
  btnPrimary: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    padding: "10px 20px",
    background:
      "linear-gradient(135deg, var(--accent-gold), var(--accent-gold-light))",
    border: "none",
    borderRadius: "var(--radius-sm)",
    color: "var(--navy-950)",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
  },
  btnSecondary: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    padding: "10px 20px",
    background: "none",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    color: "var(--text-secondary)",
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  // Modal
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(5,13,26,.75)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    padding: 20,
  },
  modal: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: "36px 40px",
    width: "100%",
    maxWidth: 460,
    position: "relative",
    boxShadow: "var(--shadow)",
    animation: "fadeUp .25s ease forwards",
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    background: "none",
    border: "none",
    color: "var(--text-muted)",
    cursor: "pointer",
    padding: 4,
    display: "flex",
    alignItems: "center",
  },
  modalTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 22,
    fontWeight: 600,
    color: "var(--text-primary)",
    marginBottom: 6,
    letterSpacing: "-0.3px",
  },
  modalSub: {
    fontSize: 13,
    color: "var(--text-secondary)",
    marginBottom: 28,
  },
  // Formulario
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 7,
  },
  label: {
    fontSize: 11,
    fontWeight: 600,
    color: "var(--text-secondary)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  input: {
    width: "100%",
    padding: "11px 14px",
    background: "var(--navy-900)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    color: "var(--text-primary)",
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none",
  },
  select: {
    width: "100%",
    padding: "11px 14px",
    background: "var(--navy-900)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    color: "var(--text-primary)",
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none",
    cursor: "pointer",
  },
  formError: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    padding: "9px 12px",
    background: "rgba(240,90,90,.08)",
    border: "1px solid rgba(240,90,90,.25)",
    borderRadius: "var(--radius-sm)",
    color: "var(--error)",
    fontSize: 13,
  },
  modalActions: {
    display: "flex",
    gap: 12,
    justifyContent: "flex-end",
    marginTop: 6,
  },
  // Detalle
  detailGrid: {
    display: "flex",
    flexDirection: "column",
    gap: 0,
    marginTop: 20,
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    overflow: "hidden",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    borderBottom: "1px solid var(--border)",
    gap: 16,
  },
  detailLabel: {
    fontSize: 12,
    color: "var(--text-muted)",
    fontWeight: 500,
    flexShrink: 0,
  },
  detailValue: {
    fontSize: 14,
    color: "var(--text-primary)",
    textAlign: "right",
  },
};
