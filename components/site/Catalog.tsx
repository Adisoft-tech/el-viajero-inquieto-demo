"use client";

import type { Category } from "@/lib/data";
import { ROUTES } from "@/lib/routes";
import { CrumbLink } from "./Crumb";
import { ListingCard } from "./ListingCard";
import { useI18n, useSite, useVisibleListings, type CatalogSort } from "./SiteContext";

const TITLES: Record<Category, [string, string]> = {
  alojamientos: ["Fincas y Cabañas", "Descansa en casonas cafeteras y refugios de montaña operados por anfitriones locales."],
  parques: ["Parques Temáticos", "Parques temáticos, naturaleza y aventura en todo Colombia, con entradas listas desde antes de llegar."],
  tours: ["Experiencias", "Caminatas, agua y miradores de Colombia, con guía y transporte incluidos."],
};

export function Catalog({ cat }: { cat: Category }) {
  const { catalogTown, setCatalogTown, catalogSort, setCatalogSort } = useSite();
  const listings = useVisibleListings();
  const { t: tr } = useI18n();

  let items = listings.filter((l) => l.cat === cat);
  const towns = Array.from(new Set(items.map((l) => l.town)));
  if (catalogTown !== "todos") items = items.filter((l) => l.town === catalogTown);
  if (catalogSort === "precio-asc") items = items.slice().sort((a, b) => a.price - b.price);
  if (catalogSort === "precio-desc") items = items.slice().sort((a, b) => b.price - a.price);
  if (catalogSort === "rating") items = items.slice().sort((a, b) => b.rating - a.rating);

  const t = TITLES[cat].map(tr);
  return (
    <section className="section" style={{ paddingTop: 40 }}><div className="container">
      <div className="crumb"><CrumbLink href={ROUTES.home}>{tr("Inicio")}</CrumbLink> / <span>{t[0]}</span></div>
      <div className="section-head"><div><p className="eyebrow">{tr("Catálogo")}</p><h2>{t[0]}</h2><p>{t[1]}</p></div></div>
      <div className="filter-bar">
        <select id="filterTown" value={catalogTown} onChange={(e) => setCatalogTown(e.target.value)}>
          <option value="todos">{tr("Todos los municipios")}</option>
          {towns.map((tw) => <option key={tw}>{tw}</option>)}
        </select>
        <select id="filterSort" value={catalogSort} onChange={(e) => setCatalogSort(e.target.value as CatalogSort)}>
          <option value="recomendado">{tr("Recomendados")}</option>
          <option value="precio-asc">{tr("Precio: menor a mayor")}</option>
          <option value="precio-desc">{tr("Precio: mayor a menor")}</option>
          <option value="rating">{tr("Mejor calificados")}</option>
        </select>
        <span className="filter-count">{items.length} {tr(items.length === 1 ? "resultado" : "resultados")}</span>
      </div>
      {items.length
        ? <div className="card-grid">{items.map((l) => <ListingCard key={l.id} l={l} />)}</div>
        : <p className="empty-note">{tr("No hay resultados para este filtro.")}</p>}
    </div></section>
  );
}
