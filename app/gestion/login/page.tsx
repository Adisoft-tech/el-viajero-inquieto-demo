"use client";

import { useRouter } from "next/navigation";
import { LoginCard } from "@/components/LoginCard";
import { useApp } from "@/lib/store";
import { ROUTES } from "@/lib/routes";

export default function GestionLoginPage() {
  const { setGestionAuthed } = useApp();
  const router = useRouter();
  return (
    <LoginCard
      title="Panel de gestión"
      subtitle="Calendario de reservas y generación de documentos"
      onLogin={() => { setGestionAuthed(true); router.push(ROUTES.gestion); }}
    />
  );
}
