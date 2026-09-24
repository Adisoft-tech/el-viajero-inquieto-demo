"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Icon } from "@/lib/icons";
import { useApp } from "@/lib/store";
import { ROUTES } from "@/lib/routes";

const TABS = [
  ["resumen", "dash", "Resumen"],
  ["reservas", "bookings", "Reservas"],
  ["inventario", "inventory", "Inventario"],
  ["contenido", "content", "Contenido del sitio"],
] as const;

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const { authStatus, adminAuthed, gestionAuthed, logout } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const tab = pathname.split("/")[2] || "resumen";

  useEffect(() => {
    if (authStatus === "anon") router.replace(ROUTES.adminLogin);
  }, [authStatus, router]);
  if (!adminAuthed) return null;

  return (
    <div id="adminShell">
      <aside id="adminSidebar">
        <div className="admin-brand">
          <div className="brand-mark" style={{ width: 28, height: 28 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/photos/logo-mark-white.png" alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
          <span>Admin</span>
        </div>
        {TABS.map(([key, icon, label]) => (
          <Link key={key} href={ROUTES.adminTab(key)} className={"admin-nav-item" + (tab === key ? " active" : "")}>
            <Icon name={icon} /><span>{label}</span>
          </Link>
        ))}
        <Link href={gestionAuthed ? ROUTES.gestion : ROUTES.gestionLogin} className="admin-nav-item">
          <Icon name="calendar" /><span>Ir a Panel de gestión</span>
        </Link>
        <button type="button" className="admin-exit admin-logout" onClick={() => void logout()}>
          <Icon name="logout" /> Cerrar sesión
        </button>
        <Link href={ROUTES.home} className="admin-exit"><Icon name="logout" /> Salir al sitio</Link>
      </aside>
      <main id="adminMain">{children}</main>
    </div>
  );
}
