"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/lib/icons";
import { useApp } from "@/lib/store";
import { ROUTES } from "@/lib/routes";

const LINKS = [["home", "Inicio"], ["experiencias", "Experiencias"], ["notiviajero", "Notiviajero"], ["nosotros", "Nosotros"]] as const;
type LinkKey = (typeof LINKS)[number][0];
const SERVICES = [["alojamientos", "Fincas y Cabañas"], ["parques", "Parques Temáticos"], ["tours", "Tours"]] as const;

function Chevron({ open }: { open: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      style={{ transition: "transform .2s ease", transform: open ? "rotate(180deg)" : undefined }}><path d="M2.5 4.5 6 8l3.5-3.5" /></svg>
  );
}

/** Botón "Servicios" con flecha: reúne Fincas y Cabañas, Parques Temáticos y Tours. */
function ServicesMenu({ pathname, onNavigate, inline }: { pathname: string; onNavigate: () => void; inline?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = SERVICES.some(([key]) => pathname === ROUTES[key]);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open || inline) return;
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open, inline]);

  return (
    <div className={"nav-dropdown" + (inline ? " inline" : "")} ref={ref}>
      <button type="button" className={"nav-link nav-dropdown-btn" + (active ? " active" : "")} aria-expanded={open} aria-haspopup="true" onClick={() => setOpen((o) => !o)}>
        Servicios <Chevron open={open} />
      </button>
      {open && (
        <div className="nav-dropdown-menu" role="menu">
          {SERVICES.map(([key, label]) => (
            <Link key={key} href={ROUTES[key]} role="menuitem" className={"nav-dropdown-item" + (pathname === ROUTES[key] ? " active" : "")} onClick={onNavigate}>{label}</Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function SiteHeader() {
  const { favorites } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Cierra el menú móvil al cambiar de página
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const isActive = (key: LinkKey) => pathname === ROUTES[key] || (key === "notiviajero" && pathname.startsWith(ROUTES.notiviajero + "/"));
  const navLink = ([key, label]: readonly [LinkKey, string]) => (
    <Link key={key} href={ROUTES[key]} className={"nav-link" + (isActive(key) ? " active" : "")} onClick={() => setMobileOpen(false)}>
      {label}
    </Link>
  );
  const links = (inline: boolean) => (
    <>
      {navLink(LINKS[0])}
      <ServicesMenu pathname={pathname} inline={inline} onNavigate={() => setMobileOpen(false)} />
      {LINKS.slice(1).map(navLink)}
    </>
  );

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
        <nav className="nav-links">{links(false)}</nav>
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
      <div className="container"><div id="mobileNav" className={mobileOpen ? "open" : undefined}>{links(true)}</div></div>
    </header>
  );
}
