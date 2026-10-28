"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { galleryFor, hasRating, type Listing } from "@/lib/data";
import { catLabel } from "@/lib/format";
import { Icon } from "@/lib/icons";
import { useApp } from "@/lib/store";
import { ROUTES } from "@/lib/routes";
import { CrumbLink } from "./Crumb";
import { useI18n, useSite, useVisibleListing } from "./SiteContext";

export function NotFound() {
  const router = useRouter();
  const { t } = useI18n();
  return (
    <div className="container section">
      <p>{t("No encontramos esta experiencia.")}</p>
      <button className="btn btn-ghost" onClick={() => router.push(ROUTES.home)}>{t("Volver al inicio")}</button>
    </div>
  );
}

export function Detail({ id }: { id: string }) {
  const l = useVisibleListing(id);
  const { isFavorite, toggleFavorite } = useApp();
  const [photoIndex, setPhotoIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const { t } = useI18n();
  const gallery = l ? galleryFor(l) : [];
  const n = gallery.length;

  // Teclado en el lightbox: Esc cierra, ←/→ cambian de foto
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      else if (e.key === "ArrowLeft" && n > 1) setPhotoIndex((i) => (i - 1 + n) % n);
      else if (e.key === "ArrowRight" && n > 1) setPhotoIndex((i) => (i + 1) % n);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [lightbox, n]);

  // Si alguien llega directo a esta URL (en vez de la tarjeta del catálogo), igual lo mandamos
  // a la página externa del aliado en vez de mostrar nuestro propio detalle.
  useEffect(() => {
    if (l?.externalUrl) window.location.replace(l.externalUrl);
  }, [l]);
  if (l?.externalUrl) return null;

  if (!l) return <NotFound />;
  const isStay = l.cat === "alojamientos";
  const activeSrc = gallery[photoIndex] || gallery[0];

  return (
    <>
      <section className="section" style={{ paddingTop: 36 }}><div className="container">
        <div className="crumb">
          <CrumbLink href={ROUTES.home}>{t("Inicio")}</CrumbLink> / <CrumbLink href={ROUTES[l.cat]}>{t(catLabel(l.cat))}</CrumbLink> / <span>{l.name}</span>
        </div>
        <div className="detail-grid">
          <div>
            <div className="gallery-wrap">
              <div className={"detail-art tone-" + l.tone} id="galleryMain" onClick={() => setLightbox(true)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {activeSrc ? <img src={activeSrc} alt={l.name} /> : <Icon name={l.icon} />}
                <button
                  type="button"
                  className={"gallery-fav" + (isFavorite(l.id) ? " active" : "")}
                  aria-label={t("Guardar en favoritos")}
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(l.id); }}
                >
                  <Icon name="heart" />
                </button>
                {n > 1 && <span className="gallery-count">{photoIndex + 1} / {n}</span>}
              </div>
              {n > 1 && (
                <div className="gallery-thumbs">
                  {gallery.map((src, i) => (
                    <button key={src} type="button" className={"gthumb" + (i === photoIndex ? " active" : "")} onClick={() => setPhotoIndex(i)}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt={`${l.name}, foto ${i + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="detail-title-row">
              <div>
                <h1>{l.name}</h1>
                <div className="detail-loc">
                  <Icon name="pin" /> {l.town}, {l.dept}{isStay ? " · " + t("hasta") + " " + l.cap + " " + t("huéspedes") : (l.duration ? " · " + l.duration : "")}
                </div>
              </div>
              {hasRating(l) && (
                <div className="detail-rating">
                  ★ {l.rating.toFixed(1)} <span style={{ color: "var(--text-muted)", fontWeight: 400, fontSize: 13.5 }}>({l.reviews} {t("reseñas")})</span>
                </div>
              )}
            </div>
            <div className="detail-highlights">
              {l.highlights.map((h) => <div key={h} className="hl-item"><Icon name="check" /><span>{h}</span></div>)}
            </div>
            <p className="detail-desc">{l.desc}</p>
          </div>
          <div><BookCard l={l} /></div>
        </div>
      </div></section>
      {lightbox && (
        <Lightbox
          gallery={gallery}
          index={photoIndex}
          onClose={() => setLightbox(false)}
          onPrev={() => setPhotoIndex((i) => (i - 1 + n) % n)}
          onNext={() => setPhotoIndex((i) => (i + 1) % n)}
        />
      )}
    </>
  );
}

function Lightbox({ gallery, index, onClose, onPrev, onNext }: {
  gallery: string[]; index: number; onClose: () => void; onPrev: () => void; onNext: () => void;
}) {
  const multi = gallery.length > 1;
  const { t } = useI18n();
  return (
    <div className="lightbox" id="lightbox" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <button type="button" className="lightbox-close" aria-label={t("Cerrar")} onClick={onClose}><Icon name="close" /></button>
      {multi && <button type="button" className="lightbox-nav prev" aria-label={t("Anterior")} onClick={onPrev}><Icon name="chevLeft" /></button>}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={gallery[index]} alt="" />
      {multi && <button type="button" className="lightbox-nav next" aria-label={t("Siguiente")} onClick={onNext}><Icon name="chevRight" /></button>}
      {multi && <span className="lightbox-count">{index + 1} / {gallery.length}</span>}
    </div>
  );
}

function BookCard({ l }: { l: Listing }) {
  const router = useRouter();
  const { booking, updateBooking } = useSite();
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [date, setDate] = useState("");
  const isStay = l.cat === "alojamientos";
  const g = booking.guests;
  const { t, price } = useI18n();

  function reserve() {
    updateBooking({
      listingId: l.id, step: 1,
      ...(isStay ? { checkin, checkout } : { date }),
    });
    router.push(ROUTES.booking(l.id));
  }

  return (
    <div className="book-card">
      <div className="book-price"><b>{price(l.price)}</b><span> / {t(l.unit)}</span></div>
      {isStay ? (
        <div className="book-fields">
          <div className="field"><label>{t("Llegada")}</label><input type="date" id="bookCheckin" value={checkin} onChange={(e) => setCheckin(e.target.value)} /></div>
          <div className="field"><label>{t("Salida")}</label><input type="date" id="bookCheckout" value={checkout} onChange={(e) => setCheckout(e.target.value)} /></div>
        </div>
      ) : (
        <div className="field"><label>{t("Fecha")}</label><input type="date" id="bookDate" value={date} onChange={(e) => setDate(e.target.value)} /></div>
      )}
      <div className="field" style={{ marginTop: 12 }}>
        <label>{t("Huéspedes")}</label>
        <div className="stepper">
          <button type="button" onClick={() => updateBooking({ guests: Math.max(1, g - 1) })}>−</button>
          <span id="gCount" className="tabular">{g}</span>
          <button type="button" onClick={() => updateBooking({ guests: Math.min(20, g + 1) })}>+</button>
        </div>
      </div>
      <div className="book-breakdown">
        <div className="row"><span>{price(l.price)} × {g} {t(isStay ? "huésped(es)" : "persona(s)")}</span><span className="tabular">{price(l.price * g)}</span></div>
        <div className="row total"><span>{t("Total")}</span><span className="tabular">{price(l.price * g)}</span></div>
      </div>
      <button className="btn btn-accent btn-block" style={{ marginTop: 18 }} id="reserveBtn" onClick={reserve}>{t("Reservar ahora")}</button>
      <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 12, textAlign: "center" }}>{t("No se te cobrará todavía")}</p>
    </div>
  );
}
