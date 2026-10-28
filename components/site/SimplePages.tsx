"use client";

import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { ROUTES } from "@/lib/routes";
import { CrumbLink } from "./Crumb";
import { ListingCard } from "./ListingCard";
import { ReviewCard } from "./ReviewCard";
import { useContent, useI18n, useVisibleListings } from "./SiteContext";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { whatsappUrl } from "@/lib/whatsapp";

const panelTitle = { fontFamily: "var(--font-display)", fontSize: 20, marginBottom: 8 } as const;
const panelText = { color: "var(--text-muted)", fontSize: 14.5 } as const;

/** Botones a WhatsApp, Facebook e Instagram de la agencia (enlaces editables desde Contenido del sitio). */
function SocialLinks() {
  const content = useContent();
  const wa = whatsappUrl(content.whatsappMessage, content.whatsappNumber);
  return (
    <div style={{ marginTop: 34, textAlign: "center" }}>
      <p className="eyebrow">{content.socialTitle}</p>
      <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 14, flexWrap: "wrap" }}>
        <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
          <WhatsAppIcon />
          WhatsApp
        </a>
        <a href={content.facebookUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3l-.5 3H13v6.8c4.56-.93 8-4.96 8-9.8z" /></svg>
          Facebook
        </a>
        <a href={content.instagramUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.3" cy="6.7" r="0.9" fill="currentColor" stroke="none" /></svg>
          Instagram
        </a>
      </div>
    </div>
  );
}

/** Texto con párrafos separados por una línea en blanco. */
function Paragraphs({ text }: { text: string }) {
  return <>{text.split(/\n\s*\n/).map((p, i) => <p key={i} style={{ ...panelText, marginTop: i ? 10 : 0 }}>{p}</p>)}</>;
}

export function Nosotros() {
  const router = useRouter();
  const c = useContent();
  const { t } = useI18n();
  return (
    <section className="section" style={{ paddingTop: 40 }}><div className="container">
      <div className="crumb"><CrumbLink href={ROUTES.home}>{t("Inicio")}</CrumbLink> / <span>{t("Nosotros")}</span></div>
      <div>
        <p className="eyebrow">{c.nosEyebrow}</p>
        <div style={{ textAlign: "center", margin: "10px 0 34px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/photos/logo-stacked-ink.png" alt="El Viajero Inquieto" style={{ width: 220, maxWidth: "60%", height: "auto", margin: "0 auto" }} />
        </div>
        <h1 style={{ fontSize: "clamp(26px,3.6vw,36px)", textAlign: "center", whiteSpace: "pre-line" }}>{c.nosName}</h1>
        <p style={{ margin: "16px auto 0", maxWidth: "32ch", textAlign: "center", fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "clamp(24px,3.4vw,34px)", lineHeight: 1.25, color: "var(--accent)" }}>{c.nosMotto}</p>

        <div className="detail-highlights" style={{ marginTop: 40, gridTemplateColumns: "1fr 1fr" }}>
          <div className="panel" style={{ marginBottom: 0 }}>
            <h4 style={panelTitle}>{c.nosMissionTitle}</h4>
            <Paragraphs text={c.nosMission} />
          </div>
          <div className="panel" style={{ marginBottom: 0 }}>
            <h4 style={panelTitle}>{c.nosVisionTitle}</h4>
            <Paragraphs text={c.nosVision} />
          </div>
        </div>

        <div className="panel" style={{ marginTop: 24 }}>
          <h4 style={panelTitle}>{c.nosPurposeTitle}</h4>
          <Paragraphs text={c.nosPurpose} />
        </div>

        <button className="btn btn-primary" style={{ marginTop: 30 }} onClick={() => router.push(ROUTES.tours)}>{t("Explorar experiencias")}</button>

        <SocialLinks />
      </div>
    </div></section>
  );
}

export function Experiencias() {
  const { reviews } = useApp();
  const content = useContent();
  const { t } = useI18n();
  return (
    <section className="section" style={{ paddingTop: 40 }}><div className="container">
      <div className="crumb"><CrumbLink href={ROUTES.home}>{t("Inicio")}</CrumbLink> / <span>{t("Testimonios")}</span></div>
      <div className="section-head"><div><p className="eyebrow">{t("Testimonios")}</p><h1>{content.reviewsTitle}</h1></div></div>
      {reviews.length
        ? <div className="review-row">{reviews.map((r, i) => <ReviewCard key={r.name + i} r={r} />)}</div>
        : <p className="empty-note">{t("Pronto publicaremos aquí las opiniones de quienes ya viajaron con nosotros.")}</p>}
    </div></section>
  );
}

export function Contacto() {
  const router = useRouter();
  const c = useContent();
  const { t } = useI18n();
  return (
    <section className="section" style={{ paddingTop: 40 }}><div className="container">
      <div className="crumb"><CrumbLink href={ROUTES.home}>{t("Inicio")}</CrumbLink> / <span>{t("Contacto")}</span></div>
      <div style={{ maxWidth: "60ch" }}>
        <p className="eyebrow">{c.contactEyebrow}</p>
        <h1 style={{ fontSize: "clamp(28px,4vw,40px)", marginTop: 10 }}>{c.contactTitle}</h1>
        <p className="detail-desc" style={{ marginTop: 16 }}>{c.contactEmail} · {c.contactPhone} · {c.contactCity}</p>
        <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={() => router.push(ROUTES.home)}>{t("Volver al inicio")}</button>

        <SocialLinks />
      </div>
    </div></section>
  );
}

export function Favoritos() {
  const { isFavorite } = useApp();
  const { t } = useI18n();
  const items = useVisibleListings().filter((l) => isFavorite(l.id));
  return (
    <section className="section" style={{ paddingTop: 40 }}><div className="container">
      <div className="crumb"><CrumbLink href={ROUTES.home}>{t("Inicio")}</CrumbLink> / <span>{t("Favoritos")}</span></div>
      <div className="section-head"><div><p className="eyebrow">{t("Tu selección")}</p><h1>{t("Favoritos guardados")}</h1><p>{t("Se guardan en este navegador — perfectos para comparar antes de reservar.")}</p></div></div>
      {items.length
        ? <div className="card-grid">{items.map((l) => <ListingCard key={l.id} l={l} />)}</div>
        : <p className="empty-note">{t("Aún no has guardado nada. Toca el corazón en cualquier finca, parque o experiencia para agregarlo aquí.")}</p>}
    </div></section>
  );
}
