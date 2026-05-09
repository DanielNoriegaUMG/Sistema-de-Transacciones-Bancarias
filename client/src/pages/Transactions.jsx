import React from "react";
import DevPlaceholder from "../components/DevPlaceholder";

const icon = (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
    <rect x="9" y="3" width="6" height="4" rx="1" />
    <path d="M9 12h6M9 16h4" />
  </svg>
);

export default function Transactions() {
  return (
    <DevPlaceholder
      title="Estado de cuenta"
      description="Consulta el historial completo de tus movimientos, descarga estados de cuenta en PDF y aplica filtros por fecha, tipo o monto."
      icon={icon}
    />
  );
}
