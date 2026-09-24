"use client";

import type { Listing } from "@/lib/data";
import { cop } from "@/lib/format";
import { Icon } from "@/lib/icons";
import { useApp } from "@/lib/store";
import { InventoryRow } from "./InventoryRow";

export function AdminInventario() {
  const { listings, setListings, toast } = useApp();

  const update = (id: string, patch: Partial<Listing>) =>
    setListings((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const onToggle = (l: Listing) => {
    const active = l.active === false;
    update(l.id, { active });
    toast(active ? l.name + " visible en el sitio público" : l.name + " ocultado del sitio público");
  };
  const onPrice = (l: Listing, raw: string) => {
    const v = parseInt(raw, 10);
    if (!isNaN(v) && v > 0) { update(l.id, { price: v }); toast("Precio de " + l.name + " actualizado a " + cop(v)); }
  };
  const onRemove = (l: Listing) => {
    if (confirm("¿Eliminar \"" + l.name + "\" del catálogo? (acción de demo)")) {
      setListings((prev) => prev.filter((x) => x.id !== l.id));
      toast(l.name + " eliminado del inventario");
    }
  };
  const onAdd = () => {
    const name = prompt("Nombre del nuevo alojamiento o experiencia:");
    if (!name) return;
    const id = "custom-" + Date.now();
    setListings((prev) => [...prev, {
      id, cat: "alojamientos", name, town: "Salento", dept: "Quindío", icon: "valle", tone: "sage", unit: "noche",
      price: 300000, cap: 4, rating: 5.0, reviews: 0, tags: [], desc: "Descripción pendiente por completar.", highlights: ["Detalles por definir"],
    }]);
    toast(name + " agregado al inventario");
  };

  return (
    <div className="fade-in">
      <div className="admin-head">
        <div><h1>Inventario</h1><p>Precios, disponibilidad y visibilidad de cada alojamiento y experiencia.</p></div>
        <button className="btn btn-primary btn-sm" onClick={onAdd}><Icon name="plus" /> Agregar</button>
      </div>
      <div className="panel">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Nombre</th><th>Categoría</th><th>Municipio</th><th>Precio</th><th>Activo</th><th></th></tr></thead>
            <tbody id="invBody">
              {listings.map((l) => (
                <InventoryRow key={l.id} l={l} onToggle={onToggle} onPrice={onPrice} onRemove={onRemove} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
