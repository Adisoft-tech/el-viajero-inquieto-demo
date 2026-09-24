"use client";

import { useRouter } from "next/navigation";
import { LoginCard } from "@/components/LoginCard";
import { useApp } from "@/lib/store";
import { ROUTES } from "@/lib/routes";

export default function AdminLoginPage() {
  const { setAdminAuthed } = useApp();
  const router = useRouter();
  return (
    <LoginCard
      title="Panel administrativo"
      subtitle="Acceso para el equipo de El Viajero Inquieto"
      onLogin={() => { setAdminAuthed(true); router.push(ROUTES.admin); }}
    />
  );
}
