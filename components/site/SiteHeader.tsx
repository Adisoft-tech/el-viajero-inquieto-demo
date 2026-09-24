"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/lib/icons";
import { useApp } from "@/lib/store";
import { ROUTES } from "@/lib/routes";

const LINKS = [
  ["home", "Inicio"], ["alojamientos", "Fincas y Cabañas"], ["parques", "Parques Temáticos"],
  ["tours", "Tours"], ["experiencias", "Experiencias"], ["nosotros", "Nosotros"],
] as const;

export function SiteHeader() {
  const { favorites } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Cierra el menú móvil al cambiar de página
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const isActive = (key: (typeof LINKS)[number][0]) => pathname === ROUTES[key];
  const links = LINKS.map(([key, label]) => (
    <Link key={key} href={ROUTES[key]} className={"nav-link" + (isActive(key) ? " active" : "")} onClick={() => setMobileOpen(false)}>
      {label}
    </Link>
  ));

  return (
    <header id="siteHeader">
      <div className="container nav-row">
        <Link href={ROUTES.home} className="brand">
          <div className="brand-mark">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="logo-light" src="/photos/logo-mark-ink.png" alt="El Viajero Inquieto" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="logo-dark" src="/photos/logo-mark-white.png" alt="El Viajero Inquieto" />
          </div>
          <div><span className="brand-word">El Viajero Inquieto</span><span className="brand-sub">Tu aliado al viajar</span></div>
        </Link>
        <nav className="nav-links">{links}</nav>
        <div className="nav-cta">
          <button className={"nav-fav" + (pathname === ROUTES.favoritos ? " active" : "")} id="navFavBtn" aria-label="Ver favoritos" onClick={() => router.push(ROUTES.favoritos)}>
            <Icon name="heart" />
            {favorites.length > 0 && <span className="nav-fav-count">{favorites.length}</span>}
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => router.push(ROUTES.alojamientos)}>Reservar ahora</button>
          <button className="nav-burger" id="burgerBtn" aria-label="Abrir menú" onClick={() => setMobileOpen((o) => !o)}>
            <Icon name="dash" />
          </button>
        </div>
      </div>
      <div className="container"><div id="mobileNav" className={mobileOpen ? "open" : undefined}>{links}</div></div>
    </header>
  );
}
