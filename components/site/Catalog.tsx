"use client";

import type { Category } from "@/lib/data";
import { ROUTES } from "@/lib/routes";
import { CrumbLink } from "./Crumb";
import { ListingCard } from "./ListingCard";
import { useSite, useVisibleListings, type CatalogSort } from "./SiteContext";

const TITLES: Record<Category, [string, string]> = {
  alojamientos: ["Fincas y Cabañas", "Descansa en casonas cafeteras y refugios de montaña operados por anfitriones locales."],
  parques: ["Parques Temáticos", "Café, agro y naturaleza en un solo día, con entradas listas desde antes de llegar."],
  tours: ["Tours y Actividades", "Caminatas, agua y miradores del eje cafetero, con guía y transporte incluidos."],
};

export function Catalog({ cat }: { cat: Category }) {
  const { catalogTown, setCatalogTown, catalogSort, setCatalogSort } = useSite();
  const listings = useVisibleListings();

  let items = listings.filter((l) => l.cat === cat);
  const towns = Array.from(new Set(items.map((l) => l.town)));
  if (catalogTown !== "todos") items = items.filter((l) => l.town === catalogTown);
  if (catalogSort === "precio-asc") items = items.slice().sort((a, b) => a.price - b.price);
  if (catalogSort === "precio-desc") items = items.slice().sort((a, b) => b.price - a.price);
  if (catalogSort === "rating") items = items.slice().sort((a, b) => b.rating - a.rating);

  const t = TITLES[cat];
  return (
    <section className="section" style={{ paddingTop: 40 }}><div className="container">
      <div className="crumb"><CrumbLink href={ROUTES.home}>Inicio</CrumbLink> / <span>{t[0]}</span></div>
      <div className="section-head"><div><p className="eyebrow">Catálogo</p><h2>{t[0]}</h2><p>{t[1]}</p></div></div>
      <div className="filter-bar">
        <select id="filterTown" value={catalogTown} onChange={(e) => setCatalogTown(e.target.value)}>
          <option value="todos">Todos los municipios</option>
          {towns.map((tw) => <option key={tw}>{tw}</option>)}
        </select>
        <select id="filterSort" value={catalogSort} onChange={(e) => setCatalogSort(e.target.value as CatalogSort)}>
          <option value="recomendado">Recomendados</option>
          <option value="precio-asc">Precio: menor a mayor</option>
          <option value="precio-desc">Precio: mayor a menor</option>
          <option value="rating">Mejor calificados</option>
        </select>
        <span className="filter-count">{items.length} resultado{items.length === 1 ? "" : "s"}</span>
      </div>
      {items.length
        ? <div className="card-grid">{items.map((l) => <ListingCard key={l.id} l={l} />)}</div>
        : <p className="empty-note">No hay resultados para este filtro.</p>}
    </div></section>
  );
}
