"use client";

import { LoginCard } from "@/components/LoginCard";
import { ROUTES } from "@/lib/routes";

export default function GestionLoginPage() {
  return (
    <LoginCard
      title="Panel de gestión"
      subtitle="Calendario de reservas y generación de documentos"
      next={ROUTES.gestion}
    />
  );
}
