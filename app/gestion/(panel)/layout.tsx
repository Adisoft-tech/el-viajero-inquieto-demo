"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Icon } from "@/lib/icons";
import { useApp } from "@/lib/store";
import { ROUTES } from "@/lib/routes";

const TABS = [
  ["calendario", "calendar", "Calendario"],
  ["documentos", "docFile", "Documentos"],
] as const;

export default function GestionPanelLayout({ children }: { children: React.ReactNode }) {
  const { authStatus, gestionAuthed, adminAuthed, fincaBookingsStatus, loadFincaBookings, logout } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const tab = pathname.split("/")[2] || "calendario";

  useEffect(() => {
    if (authStatus === "anon") router.replace(ROUTES.gestionLogin);
  }, [authStatus, router]);
  useEffect(() => {
    if (gestionAuthed && fincaBookingsStatus === "idle") void loadFincaBookings();
  }, [gestionAuthed, fincaBookingsStatus, loadFincaBookings]);
  if (!gestionAuthed) return null;

  return (
    <div id="adminShell">
      <aside id="adminSidebar">
        <div className="admin-brand">
          <div className="brand-mark" style={{ width: 28, height: 28 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/photos/logo-mark-white.png" alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
          <span>Gestión</span>
        </div>
        {TABS.map(([key, icon, label]) => (
          <Link key={key} href={ROUTES.gestionTab(key)} className={"admin-nav-item" + (tab === key ? " active" : "")}>
            <Icon name={icon} /><span>{label}</span>
          </Link>
        ))}
        <Link href={adminAuthed ? ROUTES.admin : ROUTES.adminLogin} className="admin-nav-item">
          <Icon name="dash" /><span>Ir a Panel administrativo</span>
        </Link>
        <button type="button" className="admin-exit admin-logout" onClick={() => void logout()}>
          <Icon name="logout" /> Cerrar sesión
        </button>
        <Link href={ROUTES.home} className="admin-exit"><Icon name="logout" /> Salir al sitio</Link>
      </aside>
      <main id="adminMain" className={tab === "calendario" ? "admin-main-wide" : undefined}>
        {children}
      </main>
    </div>
  );
}
