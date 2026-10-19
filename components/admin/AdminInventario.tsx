"use client";

import { useMemo, useState } from "react";
import type { Category, Listing } from "@/lib/data";
import { cop } from "@/lib/format";
import { Icon } from "@/lib/icons";
import { useApp } from "@/lib/store";
import { deleteFinca } from "@/lib/actions/gestion";
import { saveCatalog, saveFincaFull } from "@/lib/actions/cms";
import { InventoryRow } from "./InventoryRow";
import { ListingEditor } from "./ListingEditor";

type Editing = { listing: Listing | null; cat: Category } | null;

/** Alta, edición, visibilidad y borrado de fincas, parques y tours. Las fincas son las mismas del calendario de gestión. */
export function InventoryManager() {
  const { listings, setListings, authed, toast } = useApp();
  const [editing, setEditing] = useState<Editing>(null);
  const [cat, setCat] = useState<"todas" | Category>("todas");
  const [q, setQ] = useState("");

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return listings.filter((l) => (cat === "todas" || l.cat === cat) && (!needle || (l.name + " " + l.town + " " + l.dept).toLowerCase().includes(needle)));
  }, [listings, cat, q]);

  /** Guarda el listado en la base (fincas en su tabla; parques y tours en el catálogo) y actualiza el sitio al instante. */
  async function save(l: Listing, isNew: boolean) {
    if (l.cat === "alojamientos") {
      const saved = await authed(saveFincaFull, isNew ? null : l.id, l);
      setListings((prev) => {
        const fincas = prev.filter((x) => x.cat === "alojamientos");
        const next = isNew ? [...fincas, saved] : fincas.map((x) => (x.id === saved.id ? saved : x));
        return [...next, ...prev.filter((x) => x.cat !== "alojamientos")];
      });
      return;
    }
    const others = listings.filter((x) => x.cat !== "alojamientos");
    const item = isNew ? { ...l, id: "item-" + Date.now() } : l;
    const nextCatalog = isNew ? [...others, item] : others.map((x) => (x.id === item.id ? item : x));
    const clean = await authed(saveCatalog, nextCatalog);
    setListings((prev) => [...prev.filter((x) => x.cat === "alojamientos"), ...clean]);
  }

  async function quick(l: Listing, patch: Partial<Listing>, okMsg: string) {
    try { await save({ ...l, ...patch }, false); toast(okMsg); }
    catch (err) { console.error(err); toast("No se pudo guardar el cambio. Intenta de nuevo."); }
  }

  const onToggle = (l: Listing) => {
    const active = l.active === false;
    void quick(l, { active }, active ? l.name + " visible en el sitio público" : l.name + " ocultado del sitio público");
  };
  const onPrice = (l: Listing, raw: string) => {
    const v = parseInt(raw, 10);
    if (!isNaN(v) && v > 0) void quick(l, { price: v }, "Precio de " + l.name + " actualizado a " + cop(v));
  };
  const onRemove = async (l: Listing) => {
    const extra = l.cat === "alojamientos" ? " Saldrá también del calendario de gestión (sus reservas quedan guardadas)." : "";
    if (!confirm("¿Eliminar \"" + l.name + "\" del catálogo?" + extra)) return;
    try {
      if (l.cat === "alojamientos") await authed(deleteFinca, l.id);
      else await authed(saveCatalog, listings.filter((x) => x.cat !== "alojamientos" && x.id !== l.id));
      setListings((prev) => prev.filter((x) => x.id !== l.id));
      toast(l.name + " eliminado del inventario");
    } catch (err) { console.error(err); toast("No se pudo eliminar. Intenta de nuevo."); }
  };

  return (
    <>
      <div className="inv-toolbar">
        <input className="mini-input" style={{ width: 220 }} placeholder="Buscar por nombre o municipio" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar" />
        <select className="mini-input" style={{ width: 190 }} value={cat} onChange={(e) => setCat(e.target.value as "todas" | Category)} aria-label="Categoría">
          <option value="todas">Todas las categorías</option>
          <option value="alojamientos">Fincas y Cabañas</option>
          <option value="parques">Parques Temáticos</option>
          <option value="tours">Experiencias</option>
        </select>
        <span className="inv-count">{shown.length} de {listings.length}</span>
        <button className="btn btn-primary btn-sm" onClick={() => setEditing({ listing: null, cat: cat === "todas" ? "alojamientos" : cat })}><Icon name="plus" /> Agregar</button>
      </div>
      <div className="panel">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Nombre</th><th>Categoría</th><th>Municipio</th><th>Precio</th><th>Activo</th><th></th></tr></thead>
            <tbody id="invBody">
              {shown.map((l) => (
                <InventoryRow key={l.id + ":" + l.price} l={l} onToggle={onToggle} onPrice={onPrice} onEdit={(x) => setEditing({ listing: x, cat: x.cat })} onRemove={(x) => void onRemove(x)} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {editing && (
        <ListingEditor
          key={editing.listing?.id ?? "new"} listing={editing.listing} cat={editing.cat} canChangeCat={!editing.listing}
          onCancel={() => setEditing(null)}
          onSave={async (l) => { await save(l, !editing.listing); toast(l.name + (editing.listing ? " actualizado" : " agregado al inventario")); setEditing(null); }}
        />
      )}
    </>
  );
}

export function AdminInventario() {
  return (
    <div className="fade-in">
      <div className="admin-head">
        <div><h1>Inventario</h1><p>Fincas, parques y tours del sitio. Las fincas son las mismas del calendario del panel de gestión: lo que agregues allá aparece aquí y al revés.</p></div>
      </div>
      <InventoryManager />
    </div>
  );
}
