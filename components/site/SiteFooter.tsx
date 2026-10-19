"use client";

import Link from "next/link";
import { useApp } from "@/lib/store";
import { ROUTES } from "@/lib/routes";
import { useContent, useI18n } from "./SiteContext";

export function SiteFooter() {
  const { adminAuthed, gestionAuthed } = useApp();
  const content = useContent();
  const { t } = useI18n();
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
              {content.footerTagline}
            </p>
          </div>
          <div>
            <h5>{t("Explorar")}</h5>
            <Link href={ROUTES.alojamientos} className="foot-link">{t("Fincas y Cabañas")}</Link>
            <Link href={ROUTES.parques} className="foot-link">{t("Parques Temáticos")}</Link>
            <Link href={ROUTES.tours} className="foot-link">{t("Experiencias")}</Link>
          </div>
          <div>
            <h5>{t("Agencia")}</h5>
            <Link href={ROUTES.nosotros} className="foot-link">{t("Nosotros")}</Link>
            <Link href={ROUTES.experiencias} className="foot-link">{t("Testimonios")}</Link>
            <Link href={ROUTES.notiviajero} className="foot-link">Notiviajero</Link>
            <Link href={ROUTES.contacto} className="foot-link">{t("Contacto")}</Link>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 El Viajero Inquieto — {t("sitio de demostración preparado por AdiSoft")}</span>
          <span className="foot-admin-group">
            <Link href={adminAuthed ? ROUTES.admin : ROUTES.adminLogin} className="foot-admin">{t("Panel administrativo (demo)")} →</Link>
            <Link href={gestionAuthed ? ROUTES.gestion : ROUTES.gestionLogin} className="foot-admin">{t("Panel de gestión (demo)")} →</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
