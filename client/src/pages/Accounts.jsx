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
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20" />
  </svg>
);

export default function Accounts() {
  return (
    <DevPlaceholder
      title="Cuentas"
      description="Aquí podrás visualizar y administrar todas tus cuentas bancarias, saldos disponibles, números de cuenta y productos financieros asociados."
      icon={icon}
    />
  );
}
