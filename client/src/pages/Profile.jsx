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
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

export default function Profile() {
  return (
    <DevPlaceholder
      title="Perfil / Ajustes"
      description="Administra tus datos personales, preferencias de notificación, seguridad de la cuenta y configuración de acceso desde este panel."
      icon={icon}
    />
  );
}
