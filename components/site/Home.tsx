"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { photoFor, type Category, type Listing } from "@/lib/data";
import { Icon } from "@/lib/icons";
import { useApp } from "@/lib/store";
import { ROUTES } from "@/lib/routes";
import { CountTo } from "./CountTo";
import { ListingCard } from "./ListingCard";
import { ReviewCard } from "./ReviewCard";
import { useContent, useI18n, useSite, useVisibleListings } from "./SiteContext";

/** Destacados: hasta 2 fincas, un parque y una experiencia (Panaca y la Ruta del Café si están); completa hasta 4. */
function pickFeatured(listings: Listing[]): Listing[] {
  const first = (cat: Category, preferId: string) => {
    const items = listings.filter((l) => l.cat === cat);
    return items.find((l) => l.id === preferId) ?? items[0];
  };
  const fincas = listings.filter((l) => l.cat === "alojamientos").slice(0, 2);
  const picks = [...fincas, first("parques", "panaca"), first("tours", "ruta-cafe")].filter((l) => l !== undefined);
  return [...picks, ...listings.filter((l) => !picks.includes(l))].slice(0, 4);
}

function HeroPhoto({ src, alt, extraClass }: { src: string; alt: string; extraClass?: string }) {
  return (
    <div className={"hero-art-ring" + (extraClass ? " " + extraClass : "")}>
      <div className="hero-art">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} loading="lazy" />
      </div>
    </div>
  );
}

/** Panel del inicio con las experiencias activas (viajes programados), con su fecha si la tienen. */
function TripsPanel({ title, text, trips, onOpen, onAll }: {
  title: string; text: string; trips: Listing[]; onOpen: (l: Listing) => void; onAll: () => void;
}) {
  const { t: tr, price } = useI18n();
  return (
    <aside className="trips-panel" aria-labelledby="tripsTitle">
      <div className="trips-head">
        <span className="trips-badge"><Icon name="calendar" /> {tr("Agenda de salidas")}</span>
        <h2 id="tripsTitle">{title}</h2>
        {text && <p>{text}</p>}
      </div>
      {trips.length ? (
        <ul className="trips-list">
          {trips.map((t) => {
            const photo = photoFor(t);
            return (
              <li key={t.id}>
                <button type="button" className="trip-row" onClick={() => onOpen(t)}>
                  <span className={"trip-thumb tone-" + t.tone}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {photo ? <img src={photo} alt={t.name} loading="lazy" /> : <Icon name={t.icon} />}
                  </span>
                  <span className="trip-info">
                    <b>{t.name}</b>
                    <span>{[t.schedule || t.duration, t.town].filter(Boolean).join(" · ")}</span>
                  </span>
                  <span className="trip-price"><b>{price(t.price)}</b><span>{tr("por persona")}</span></span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : <p className="trips-empty">{tr("Muy pronto publicaremos las salidas de este año.")}</p>}
      <button type="button" className="trips-all" onClick={onAll}>{tr("Ver todas las experiencias")} <Icon name="arrow" /></button>
    </aside>
  );
}

function TrustItem({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return <div className="trust-item"><Icon name={icon} /><h4>{title}</h4><p>{desc}</p></div>;
}

function CatCardPhoto({ photo, title, desc, count, onClick }: { photo: string; title: string; desc: string; count: number; onClick: () => void }) {
  const { t } = useI18n();
  return (
    <div className="cat-card cat-card-photo reveal" onClick={onClick}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo} alt={title} loading="lazy" />
      <span className="cat-count">{count} {t(count === 1 ? "opción" : "opciones")}</span>
      <h3>{title}</h3><p>{desc}</p>
    </div>
  );
}

function DestCard({ town, photo, label, onClick }: { town: string; photo: string; label: string; onClick: () => void }) {
  return (
    <div className="dest-card reveal" onClick={onClick}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo} alt={town} loading="lazy" />
      <div className="dest-card-label"><b>{town}</b><span>{label}</span></div>
    </div>
  );
}

export function Home() {
  const router = useRouter();
  const { reviews } = useApp();
  const content = useContent();
  const { t } = useI18n();
  const { setCatalogTown } = useSite();
  const listings = useVisibleListings();
  const [searchTown, setSearchTown] = useState("todos");
  const [searchCat, setSearchCat] = useState<Category>("alojamientos");
  const reviewTrack = useRef<HTMLDivElement>(null);

  const trips = listings.filter((l) => l.cat === "tours");
  const featured = pickFeatured(listings);
  // Calificación promedio: solo con reseñas reales publicadas por el administrador.
  const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  function goCatalog(cat: Category) { router.push(ROUTES[cat]); }
  const catCount = (cat: Category) => listings.filter((l) => l.cat === cat).length;
  const deptCount = new Set(listings.map((l) => l.dept)).size;
  const towns = Array.from(new Set(listings.map((l) => l.town))).sort((a, b) => a.localeCompare(b, "es"));
  const townLabel = (town: string) => {
    const n = listings.filter((l) => l.town === town).length;
    return n + " " + t(n === 1 ? "opción" : "opciones");
  };
  // Destino: filtra el catálogo por pueblo, en la categoría del primer listado de ese pueblo
  const goTown = (town: string) => () => {
    const match = listings.find((l) => l.town === town);
    setCatalogTown(town);
    goCatalog(match ? match.cat : "alojamientos");
  };

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow hero-eyebrow" dangerouslySetInnerHTML={{ __html: content.heroEyebrow }} />
            <h1 dangerouslySetInnerHTML={{ __html: content.heroTitle }} />
            <p className="hero-lede" dangerouslySetInnerHTML={{ __html: content.heroLede }} />
            <div className="hero-actions">
              <button className="btn btn-accent" onClick={() => goCatalog("alojamientos")}>{t("Explorar fincas y cabañas")}</button>
              <button className="btn btn-ghost" onClick={() => goCatalog("tours")}>{t("Ver experiencias")}</button>
            </div>
            <div className="hero-stats">
              <div className="hero-stat"><CountTo to={listings.length} prefix="+" /><span>{t("Alojamientos y experiencias")}</span></div>
              {avgRating > 0 && <div className="hero-stat"><CountTo to={avgRating} decimals={1} /><span>{t("Calificación promedio")}</span></div>}
              <div className="hero-stat"><CountTo to={deptCount} /><span>{t("Departamentos de Colombia")}</span></div>
            </div>
            <div className="rnt-badge">
              <Icon name="shield" />
              <div><b>RNT {content.rnt}</b><span>{content.rntLabel}</span></div>
            </div>
          </div>
          <TripsPanel
            title={content.heroTripsTitle} text={content.heroTripsText} trips={trips}
            onAll={() => goCatalog("tours")}
            onOpen={(l) => (l.externalUrl ? window.open(l.externalUrl, "_blank", "noopener,noreferrer") : router.push(ROUTES.listing(l.id)))}
          />
        </div>
        <div className="container">
          <div className="search-card">
            <div className="field"><label>{t("Destino")}</label>
              <select id="searchTown" value={searchTown} onChange={(e) => setSearchTown(e.target.value)}>
                <option value="todos">{t("Toda Colombia")}</option>
                {towns.map((town) => <option key={town}>{town}</option>)}
              </select>
            </div>
            <div className="field"><label>{t("Tipo")}</label>
              <select id="searchCat" value={searchCat} onChange={(e) => setSearchCat(e.target.value as Category)}>
                <option value="alojamientos">{t("Fincas y Cabañas")}</option><option value="parques">{t("Parques Temáticos")}</option><option value="tours">{t("Experiencias")}</option>
              </select>
            </div>
            <div className="field"><label>{t("Huéspedes")}</label>
              <select id="searchGuests">{["2", "4", "6", "8+"].map((n) => <option key={n}>{n} {t("personas")}</option>)}</select>
            </div>
            <button className="btn btn-primary" id="searchGo" onClick={() => { setCatalogTown(searchTown); goCatalog(searchCat); }}>{t("Buscar")}</button>
          </div>
        </div>
      </section>

      <section className="section"><div className="container">
        <div className="section-head reveal"><div><p className="eyebrow">{t("Categorías")}</p><h2>{content.catSectionTitle}</h2></div></div>
        <div className="cat-grid">
          <CatCardPhoto count={catCount("alojamientos")} onClick={() => goCatalog("alojamientos")} photo="/photos/finca-a.jpg" title={content.catAlojTitle} desc={content.catAlojDesc} />
          <CatCardPhoto count={catCount("parques")} onClick={() => goCatalog("parques")} photo="/photos/parque-cafe.jpg" title={content.catParquesTitle} desc={content.catParquesDesc} />
          <CatCardPhoto count={catCount("tours")} onClick={() => goCatalog("tours")} photo="/photos/kayak-action.jpg" title={content.catToursTitle} desc={content.catToursDesc} />
        </div>
      </div></section>

      <section className="section section-sunken"><div className="container">
        <div className="section-head reveal">
          <div><p className="eyebrow">{t("Destacados")}</p><h2>{content.featuredTitle}</h2></div>
          <button className="btn btn-ghost btn-sm" onClick={() => goCatalog("alojamientos")}>{t("Ver todo")} <Icon name="arrow" /></button>
        </div>
        <div className="card-grid">{featured.map((l) => <ListingCard key={l.id} l={l} />)}</div>
      </div></section>

      <section className="section"><div className="container">
        <div className="section-head reveal"><div><p className="eyebrow">{t("Explora por destino")}</p><h2>{t("Destinos para empezar tu viaje")}</h2></div></div>
        <div className="dest-grid">
          <DestCard town="Salento" onClick={goTown("Salento")} photo="/photos/salento-calle.jpg" label={townLabel("Salento")} />
          <DestCard town="Filandia" onClick={goTown("Filandia")} photo="/photos/filandia-colina.jpg" label={townLabel("Filandia")} />
          <DestCard town="Manizales" onClick={goTown("Manizales")} photo="/photos/manizales-catedral.jpg" label={townLabel("Manizales")} />
          <DestCard town="Santa Rosa de Cabal" onClick={goTown("Santa Rosa de Cabal")} photo="/photos/termales.jpg" label={townLabel("Santa Rosa de Cabal")} />
        </div>
      </div></section>

      <section className="section section-sunken"><div className="container">
        <div className="section-head reveal"><div><p className="eyebrow">{t("Por qué reservar aquí")}</p><h2>{content.trustTitle}</h2></div></div>
        <div className="trust-grid">
          <TrustItem icon="shield" title={content.trust1Title} desc={content.trust1Desc} />
          <TrustItem icon="host" title={content.trust2Title} desc={content.trust2Desc} />
          <TrustItem icon="curation" title={content.trust3Title} desc={content.trust3Desc} />
          <TrustItem icon="chat" title={content.trust4Title} desc={content.trust4Desc} />
        </div>
      </div></section>

      {reviews.length > 0 && <section className="section" id="experiencias"><div className="container">
        <div className="section-head reveal"><div><p className="eyebrow">{t("Testimonios")}</p><h2>{content.reviewsTitle}</h2></div></div>
        <div className="carousel-wrap reveal">
          <div className="carousel-track" id="reviewTrack" ref={reviewTrack}>
            {reviews.map((r, i) => <ReviewCard key={r.name + i} r={r} />)}
          </div>
          <div className="carousel-arrows">
            <button type="button" className="carousel-arrow" aria-label={t("Anteriores reseñas")} onClick={() => reviewTrack.current?.scrollBy({ left: -340, behavior: "smooth" })}><Icon name="chevLeft" /></button>
            <button type="button" className="carousel-arrow" aria-label={t("Siguientes reseñas")} onClick={() => reviewTrack.current?.scrollBy({ left: 340, behavior: "smooth" })}><Icon name="chevRight" /></button>
          </div>
        </div>
      </div></section>}

      <section className="section" id="nosotros"><div className="container hero-grid">
        <div><HeroPhoto src="/photos/penol-guatape.jpg" alt={t("Paisaje colombiano de montaña y agua")} extraClass="hero-art-ring-sm" /></div>
        <div>
          <p className="eyebrow">{content.aboutEyebrow}</p>
          <h2 style={{ fontSize: "clamp(24px,3.2vw,34px)", marginTop: 10 }}>{content.aboutTitle}</h2>
          <p className="hero-lede" style={{ marginTop: 16 }}>{content.aboutText}</p>
          <button className="btn btn-primary" style={{ marginTop: 22 }} onClick={() => router.push(ROUTES.nosotros)}>{t("Conocer más sobre nosotros")}</button>
        </div>
      </div></section>
    </>
  );
}
