import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[ErrorBoundary] Error caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            background: "var(--navy-900)",
            color: "var(--text-primary)",
            padding: 24,
          }}
        >
          <div style={{ textAlign: "center", maxWidth: 480 }}>
            <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16 }}>
              Algo salió mal
            </h1>
            <p style={{ color: "var(--text-secondary)", marginBottom: 24, lineHeight: 1.6 }}>
              Hemos encontrado un error inesperado. Por favor, intenta recargar la página o contacta al soporte.
            </p>
            {process.env.NODE_ENV === "development" && (
              <details
                style={{
                  textAlign: "left",
                  padding: 12,
                  background: "rgba(242, 76, 76, 0.08)",
                  borderRadius: 12,
                  marginBottom: 20,
                  fontSize: 12,
                  color: "#f24343",
                }}
              >
                <summary style={{ cursor: "pointer", fontWeight: 600 }}>
                  Detalles del error
                </summary>
                <pre
                  style={{
                    marginTop: 8,
                    overflow: "auto",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {this.state.error?.toString()}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "12px 24px",
                borderRadius: 16,
                border: "none",
                background: "var(--accent-gold)",
                color: "var(--text-dark)",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
