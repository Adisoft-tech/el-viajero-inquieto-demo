"use client";

import { LoginCard } from "@/components/LoginCard";
import { ROUTES } from "@/lib/routes";

export default function AdminLoginPage() {
  return (
    <LoginCard
      title="Panel administrativo"
      subtitle="Acceso para el equipo de El Viajero Inquieto"
      next={ROUTES.admin}
    />
  );
}
