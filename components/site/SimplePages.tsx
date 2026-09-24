"use client";

import { useRouter } from "next/navigation";
import { REVIEWS } from "@/lib/data";
import { useApp } from "@/lib/store";
import { ROUTES } from "@/lib/routes";
import { CrumbLink } from "./Crumb";
import { ListingCard } from "./ListingCard";
import { ReviewCard } from "./ReviewCard";
import { useVisibleListings } from "./SiteContext";

const panelTitle = { fontFamily: "var(--font-display)", fontSize: 20, marginBottom: 8 } as const;
const panelText = { color: "var(--text-muted)", fontSize: 14.5 } as const;

export function Nosotros() {
  const router = useRouter();
  return (
    <section className="section" style={{ paddingTop: 40 }}><div className="container">
      <div className="crumb"><CrumbLink href={ROUTES.home}>Inicio</CrumbLink> / <span>Nosotros</span></div>
      <div style={{ maxWidth: "70ch" }}>
        <p className="eyebrow">Nuestra esencia</p>
        <h1 style={{ fontSize: "clamp(30px,4.4vw,44px)", marginTop: 10 }}>El lujo de sentirse en casa</h1>
        <p className="detail-desc" style={{ marginTop: 20 }}>Diseñamos viajes memorables para compartir: fincas que se vuelven refugio, rutas que despiertan curiosidad y destinos vividos desde la emoción.</p>
        <div className="detail-art" style={{ maxWidth: 820, marginTop: 26 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/photos/finca-b.jpg" alt="Finca cafetera vista desde el aire" />
        </div>
        <div className="detail-highlights" style={{ marginTop: 30, gridTemplateColumns: "1fr 1fr" }}>
          <div className="panel" style={{ marginBottom: 0 }}>
            <h4 style={panelTitle}>Misión</h4>
            <p style={panelText}>Crear experiencias de viaje personalizadas y memorables en Colombia y el mundo, conectando de manera responsable a los viajeros con la riqueza cultural, natural y humana de cada destino.</p>
          </div>
          <div className="panel" style={{ marginBottom: 0 }}>
            <h4 style={panelTitle}>Visión</h4>
            <p style={panelText}>Ser la agencia de viajes líder en turismo receptivo y de autor en Colombia, reconocida por promover el desarrollo del territorio.</p>
          </div>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 30 }} onClick={() => router.push(ROUTES.alojamientos)}>Explorar experiencias</button>
      </div>
    </div></section>
  );
}

export function Experiencias() {
  return (
    <section className="section" style={{ paddingTop: 40 }}><div className="container">
      <div className="crumb"><CrumbLink href={ROUTES.home}>Inicio</CrumbLink> / <span>Experiencias</span></div>
      <div className="section-head"><div><p className="eyebrow">Experiencias</p><h2>Lo que cuentan quienes ya viajaron</h2></div></div>
      <div className="review-row">{REVIEWS.map((r) => <ReviewCard key={r.name} r={r} />)}</div>
    </div></section>
  );
}

export function Contacto() {
  const router = useRouter();
  return (
    <section className="section" style={{ paddingTop: 40 }}><div className="container">
      <div className="crumb"><CrumbLink href={ROUTES.home}>Inicio</CrumbLink> / <span>Contacto</span></div>
      <div style={{ maxWidth: "60ch" }}>
        <p className="eyebrow">Contacto</p>
        <h1 style={{ fontSize: "clamp(28px,4vw,40px)", marginTop: 10 }}>Hablemos de tu próximo viaje</h1>
        <p className="detail-desc" style={{ marginTop: 16 }}>hola@elviajeroinquieto.co · +57 300 000 0000 · Manizales, Caldas</p>
        <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={() => router.push(ROUTES.home)}>Volver al inicio</button>
      </div>
    </div></section>
  );
}

export function Favoritos() {
  const { isFavorite } = useApp();
  const items = useVisibleListings().filter((l) => isFavorite(l.id));
  return (
    <section className="section" style={{ paddingTop: 40 }}><div className="container">
      <div className="crumb"><CrumbLink href={ROUTES.home}>Inicio</CrumbLink> / <span>Favoritos</span></div>
      <div className="section-head"><div><p className="eyebrow">Tu selección</p><h2>Favoritos guardados</h2><p>Se guardan en este navegador — perfectos para comparar antes de reservar.</p></div></div>
      {items.length
        ? <div className="card-grid">{items.map((l) => <ListingCard key={l.id} l={l} />)}</div>
        : <p className="empty-note">Aún no has guardado nada. Toca el corazón en cualquier finca, parque o tour para agregarlo aquí.</p>}
    </div></section>
  );
}
