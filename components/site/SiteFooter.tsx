"use client";

import Link from "next/link";
import { useApp } from "@/lib/store";
import { ROUTES } from "@/lib/routes";

export function SiteFooter() {
  const { adminAuthed, gestionAuthed } = useApp();
  return (
    <footer id="siteFooter">
      <div className="container">
        <div className="foot-grid">
          <div>
            <div className="brand" style={{ marginBottom: 14 }}>
              <div className="brand-mark">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/photos/logo-mark-white.png" alt="El Viajero Inquieto" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              </div>
              <span className="brand-word" style={{ color: "#F7F5EF" }}>El Viajero Inquieto</span>
            </div>
            <p style={{ color: "#B9C7C2", fontSize: 13.5, maxWidth: "34ch" }}>
              Turismo familiar, fincas y experiencias con raíz colombiana, en el eje cafetero y en el exterior.
            </p>
          </div>
          <div>
            <h5>Explorar</h5>
            <Link href={ROUTES.alojamientos} className="foot-link">Fincas y Cabañas</Link>
            <Link href={ROUTES.parques} className="foot-link">Parques Temáticos</Link>
            <Link href={ROUTES.tours} className="foot-link">Tours</Link>
          </div>
          <div>
            <h5>Agencia</h5>
            <Link href={ROUTES.nosotros} className="foot-link">Nosotros</Link>
            <Link href={ROUTES.experiencias} className="foot-link">Experiencias</Link>
            <Link href={ROUTES.contacto} className="foot-link">Contacto</Link>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 El Viajero Inquieto — sitio de demostración preparado por AdiSoft</span>
          <span className="foot-admin-group">
            <Link href={adminAuthed ? ROUTES.admin : ROUTES.adminLogin} className="foot-admin">Panel administrativo (demo) →</Link>
            <Link href={gestionAuthed ? ROUTES.gestion : ROUTES.gestionLogin} className="foot-admin">Panel de gestión (demo) →</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
