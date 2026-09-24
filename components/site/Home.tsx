"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { REVIEWS, type Category } from "@/lib/data";
import { Icon } from "@/lib/icons";
import { useApp } from "@/lib/store";
import { ROUTES } from "@/lib/routes";
import { CountTo } from "./CountTo";
import { ListingCard } from "./ListingCard";
import { ReviewCard } from "./ReviewCard";
import { useSite, useVisibleListings } from "./SiteContext";

const FEATURED = ["finca-serrana", "parque-cafe", "ruta-cafe", "termales-otun"];

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

function TrustItem({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return <div className="trust-item"><Icon name={icon} /><h4>{title}</h4><p>{desc}</p></div>;
}

function CatCardPhoto({ photo, title, desc, count, onClick }: { photo: string; title: string; desc: string; count: number; onClick: () => void }) {
  return (
    <div className="cat-card cat-card-photo reveal" onClick={onClick}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo} alt="" loading="lazy" />
      <span className="cat-count">{count} opciones</span>
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
  const { content } = useApp();
  const { setCatalogTown } = useSite();
  const listings = useVisibleListings();
  const [searchTown, setSearchTown] = useState("todos");
  const [searchCat, setSearchCat] = useState<Category>("alojamientos");
  const reviewTrack = useRef<HTMLDivElement>(null);

  const featured = FEATURED.map((id) => listings.find((l) => l.id === id)).filter((l) => l !== undefined);

  function goCatalog(cat: Category) { router.push(ROUTES[cat]); }
  const catCount = (cat: Category) => listings.filter((l) => l.cat === cat).length;
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
              <button className="btn btn-accent" onClick={() => goCatalog("alojamientos")}>Explorar fincas y cabañas</button>
              <button className="btn btn-ghost" onClick={() => document.getElementById("experiencias")?.scrollIntoView({ behavior: "smooth" })}>Ver experiencias</button>
            </div>
            <div className="hero-stats">
              <div className="hero-stat"><CountTo to={listings.length} prefix="+" /><span>Alojamientos y experiencias</span></div>
              <div className="hero-stat"><CountTo to={4.8} decimals={1} /><span>Calificación promedio</span></div>
              <div className="hero-stat"><CountTo to={3} /><span>Departamentos del eje cafetero</span></div>
            </div>
          </div>
          <div><HeroPhoto src="/photos/finca-a.jpg" alt="Finca cafetera en el eje cafetero, con vista a las montañas de Quindío" /></div>
        </div>
        <div className="container">
          <div className="search-card">
            <div className="field"><label>Destino</label>
              <select id="searchTown" value={searchTown} onChange={(e) => setSearchTown(e.target.value)}>
                <option value="todos">Todo el eje cafetero</option>
                <option>Salento</option><option>Filandia</option><option>Circasia</option><option>Manizales</option><option>Santa Rosa de Cabal</option>
              </select>
            </div>
            <div className="field"><label>Tipo</label>
              <select id="searchCat" value={searchCat} onChange={(e) => setSearchCat(e.target.value as Category)}>
                <option value="alojamientos">Fincas y Cabañas</option><option value="parques">Parques Temáticos</option><option value="tours">Tours</option>
              </select>
            </div>
            <div className="field"><label>Huéspedes</label>
              <select id="searchGuests"><option>2 personas</option><option>4 personas</option><option>6 personas</option><option>8+ personas</option></select>
            </div>
            <button className="btn btn-primary" id="searchGo" onClick={() => { setCatalogTown(searchTown); goCatalog(searchCat); }}>Buscar</button>
          </div>
        </div>
      </section>

      <section className="section"><div className="container">
        <div className="section-head reveal"><div><p className="eyebrow">Categorías</p><h2>Tres formas de recorrer el eje cafetero</h2></div></div>
        <div className="cat-grid">
          <CatCardPhoto count={catCount("alojamientos")} onClick={() => goCatalog("alojamientos")} photo="/photos/finca-a.jpg" title="Fincas y Cabañas" desc="Casonas cafeteras, cabañas de montaña y refugios con anfitriones reales." />
          <CatCardPhoto count={catCount("parques")} onClick={() => goCatalog("parques")} photo="/photos/parque-cafe.jpg" title="Parques Temáticos" desc="Café, agro y naturaleza en los parques más visitados de la región." />
          <CatCardPhoto count={catCount("tours")} onClick={() => goCatalog("tours")} photo="/photos/kayak-action.jpg" title="Tours y Actividades" desc="Caminatas, kayak, avistamiento de aves y rutas guiadas de un día." />
        </div>
      </div></section>

      <section className="section section-sunken"><div className="container">
        <div className="section-head reveal">
          <div><p className="eyebrow">Destacados</p><h2>Lo que más reservan nuestros viajeros</h2></div>
          <button className="btn btn-ghost btn-sm" onClick={() => goCatalog("alojamientos")}>Ver todo <Icon name="arrow" /></button>
        </div>
        <div className="card-grid">{featured.map((l) => <ListingCard key={l.id} l={l} />)}</div>
      </div></section>

      <section className="section"><div className="container">
        <div className="section-head reveal"><div><p className="eyebrow">Explora por destino</p><h2>Cuatro pueblos, un mismo territorio</h2></div></div>
        <div className="dest-grid">
          <DestCard town="Salento" onClick={goTown("Salento")} photo="/photos/salento-calle.jpg" label="6 opciones" />
          <DestCard town="Filandia" onClick={goTown("Filandia")} photo="/photos/filandia-colina.jpg" label="3 opciones" />
          <DestCard town="Manizales" onClick={goTown("Manizales")} photo="/photos/manizales-catedral.jpg" label="1 opción" />
          <DestCard town="Santa Rosa de Cabal" onClick={goTown("Santa Rosa de Cabal")} photo="/photos/termales.jpg" label="2 opciones" />
        </div>
      </div></section>

      <section className="section section-sunken"><div className="container">
        <div className="section-head reveal"><div><p className="eyebrow">Por qué reservar aquí</p><h2>Anfitrión atento, no una vitrina más</h2></div></div>
        <div className="trust-grid">
          <TrustItem icon="shield" title="Pago seguro con Wompi" desc="Tarjeta, PSE o Nequi, procesado por una pasarela colombiana certificada." />
          <TrustItem icon="host" title="Anfitriones reales" desc="Cada finca y tour lo opera gente del territorio, no un intermediario anónimo." />
          <TrustItem icon="curation" title="Curaduría local" desc="Seleccionamos cada experiencia por calidad, no por comisión." />
          <TrustItem icon="chat" title="Atención humana" desc="Antes, durante y después del viaje, alguien responde de verdad." />
        </div>
      </div></section>

      <section className="section" id="experiencias"><div className="container">
        <div className="section-head reveal"><div><p className="eyebrow">Experiencias</p><h2>Voces de quienes ya viajaron</h2></div></div>
        <div className="carousel-wrap reveal">
          <div className="carousel-track" id="reviewTrack" ref={reviewTrack}>
            {REVIEWS.map((r) => <ReviewCard key={r.name} r={r} />)}
          </div>
          <div className="carousel-arrows">
            <button type="button" className="carousel-arrow" aria-label="Anteriores reseñas" onClick={() => reviewTrack.current?.scrollBy({ left: -340, behavior: "smooth" })}><Icon name="chevLeft" /></button>
            <button type="button" className="carousel-arrow" aria-label="Siguientes reseñas" onClick={() => reviewTrack.current?.scrollBy({ left: 340, behavior: "smooth" })}><Icon name="chevRight" /></button>
          </div>
        </div>
      </div></section>

      <section className="section" id="nosotros"><div className="container hero-grid">
        <div><HeroPhoto src="/photos/penol-guatape.jpg" alt="Paisaje colombiano de montaña y agua" extraClass="hero-art-ring-sm" /></div>
        <div>
          <p className="eyebrow">Nuestra esencia</p>
          <h2 style={{ fontSize: "clamp(24px,3.2vw,34px)", marginTop: 10 }}>El lujo de sentirse en casa</h2>
          <p className="hero-lede" style={{ marginTop: 16 }}>Creamos experiencias de viaje personalizadas y memorables en Colombia, conectando de manera responsable a los viajeros con la riqueza cultural, natural y humana de cada destino. Viajar juntos: la experiencia empieza antes de llegar y continúa en la memoria.</p>
          <button className="btn btn-primary" style={{ marginTop: 22 }} onClick={() => router.push(ROUTES.nosotros)}>Conocer más sobre nosotros</button>
        </div>
      </div></section>
    </>
  );
}
