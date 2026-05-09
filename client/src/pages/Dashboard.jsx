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
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

export default function Dashboard() {
  return (
    <DevPlaceholder
      title="Dashboard"
      description="El panel principal mostrará un resumen de tus cuentas, movimientos recientes, alertas y métricas financieras en tiempo real."
      icon={icon}
    />
  );
}
