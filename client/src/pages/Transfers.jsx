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
    <path d="M7 16V4m0 0L3 8m4-4l4 4" />
    <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
  </svg>
);

export default function Transfers() {
  return (
    <DevPlaceholder
      title="Transferencias"
      description="Este módulo permitirá realizar transferencias entre cuentas propias y a terceros, programar pagos y gestionar beneficiarios frecuentes."
      icon={icon}
    />
  );
}
