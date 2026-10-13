"use client";

import { useState } from "react";
import type { Category, Listing } from "@/lib/data";
import { catLabel } from "@/lib/format";
import { Icon } from "@/lib/icons";
import { Modal } from "./Modal";

/** Íconos de ilustración disponibles para un listado sin foto. */
const LISTING_ICONS = [
  "valle", "mirador", "cafe", "termal", "ferris", "animal", "mariposa", "ave", "kayak", "whale", "caribbean",
  "amazon", "beach", "sea", "farm", "shield", "car", "bogota", "international", "trip",
];
const TONES: [Listing["tone"], string][] = [["sage", "Verde salvia"], ["lagoon", "Azul laguna"], ["ink", "Oscuro"]];

const lines = (a: string[] | undefined) => (a || []).join("\n");
const parseLines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);

/** Formulario completo de un alojamiento, parque o tour. `listing` null = alta nueva. */
export function ListingEditor({ listing, cat, canChangeCat, onSave, onCancel }: {
  listing: Listing | null; cat: Category; canChangeCat: boolean;
  onSave: (l: Listing) => Promise<void>; onCancel: () => void;
}) {
  const [f, setF] = useState(() => ({
    cat: listing?.cat ?? cat, name: listing?.name ?? "", town: listing?.town ?? "", dept: listing?.dept ?? "",
    price: String(listing?.price ?? ""), cap: String(listing?.cap ?? (cat === "alojamientos" ? 4 : 1)),
    rating: String(listing?.rating ?? 5), reviews: String(listing?.reviews ?? 0),
    icon: listing?.icon ?? "valle", tone: listing?.tone ?? ("sage" as Listing["tone"]),
    duration: listing?.duration ?? "", externalUrl: listing?.externalUrl ?? "",
    tags: (listing?.tags ?? []).join(", "), highlights: lines(listing?.highlights),
    desc: listing?.desc ?? "", photos: lines(listing?.photos), active: listing?.active !== false,
  }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));
  const stay = f.cat === "alojamientos";

  async function submit() {
    if (!f.name.trim()) { setError("El nombre es obligatorio."); return; }
    setBusy(true); setError("");
    try {
      await onSave({
        ...(listing ?? {}),
        id: listing?.id ?? "", cat: f.cat, name: f.name.trim(), town: f.town.trim(), dept: f.dept.trim(),
        icon: f.icon, tone: f.tone, unit: stay ? "noche" : "persona",
        price: parseInt(f.price, 10) || 0, cap: parseInt(f.cap, 10) || 1,
        rating: Math.min(5, Math.max(0, parseFloat(f.rating) || 0)), reviews: parseInt(f.reviews, 10) || 0,
        tags: f.tags.split(",").map((t) => t.trim()).filter(Boolean), desc: f.desc.trim(), highlights: parseLines(f.highlights),
        photos: parseLines(f.photos), duration: f.duration.trim() || undefined,
        externalUrl: f.externalUrl.trim() || undefined, active: f.active,
      } as Listing);
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "No se pudo guardar. Intenta de nuevo.");
      setBusy(false);
    }
  }

  return (
    <Modal label={listing ? "Editar " + listing.name : "Nuevo listado"} locked={busy} onClose={onCancel}>
        <div className="admin-modal-head">
          <h3>{listing ? "Editar: " + listing.name : "Agregar al catálogo"}</h3>
          <button type="button" className="icon-btn" aria-label="Cerrar" onClick={onCancel} disabled={busy}><Icon name="close" /></button>
        </div>
        <div className="form-grid">
          {canChangeCat && (
            <div className="field full"><label>Categoría</label>
              <select id="leCat" value={f.cat} onChange={(e) => set("cat", e.target.value as Category)}>
                {(["alojamientos", "parques", "tours"] as Category[]).map((c) => <option key={c} value={c}>{catLabel(c)}</option>)}
              </select>
            </div>
          )}
          <div className="field full"><label>Nombre</label><input id="leName" value={f.name} onChange={(e) => set("name", e.target.value)} /></div>
          <div className="field"><label>Municipio</label><input id="leTown" value={f.town} onChange={(e) => set("town", e.target.value)} /></div>
          <div className="field"><label>Departamento</label><input id="leDept" value={f.dept} onChange={(e) => set("dept", e.target.value)} /></div>
          <div className="field"><label>{stay ? "Precio por noche" : "Precio por persona"} (COP)</label><input id="lePrice" type="number" min={0} step={1000} value={f.price} onChange={(e) => set("price", e.target.value)} /></div>
          <div className="field"><label>{stay ? "Capacidad (huéspedes)" : "Capacidad por reserva"}</label><input id="leCap" type="number" min={1} value={f.cap} onChange={(e) => set("cap", e.target.value)} /></div>
          <div className="field"><label>Calificación (0 a 5)</label><input id="leRating" type="number" min={0} max={5} step={0.1} value={f.rating} onChange={(e) => set("rating", e.target.value)} /></div>
          <div className="field"><label>Número de reseñas</label><input id="leReviews" type="number" min={0} value={f.reviews} onChange={(e) => set("reviews", e.target.value)} /></div>
          {!stay && <div className="field"><label>Duración (opcional)</label><input id="leDuration" placeholder="Ej. Día completo" value={f.duration} onChange={(e) => set("duration", e.target.value)} /></div>}
          {!stay && <div className="field"><label>Enlace externo (opcional)</label><input id="leExt" placeholder="https://…" value={f.externalUrl} onChange={(e) => set("externalUrl", e.target.value)} /></div>}
          <div className="field"><label>Ícono (si no hay foto)</label>
            <select id="leIcon" value={f.icon} onChange={(e) => set("icon", e.target.value)}>
              {LISTING_ICONS.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div className="field"><label>Color del ícono</label>
            <select id="leTone" value={f.tone} onChange={(e) => set("tone", e.target.value as Listing["tone"])}>
              {TONES.map(([k, label]) => <option key={k} value={k}>{label}</option>)}
            </select>
          </div>
          <div className="field full"><label>Etiquetas (separadas por coma)</label><input id="leTags" value={f.tags} onChange={(e) => set("tags", e.target.value)} /></div>
          <div className="field full"><label>Descripción</label><textarea id="leDesc" rows={4} value={f.desc} onChange={(e) => set("desc", e.target.value)} /></div>
          <div className="field full"><label>Puntos destacados (uno por línea)</label><textarea id="leHighlights" rows={4} value={f.highlights} onChange={(e) => set("highlights", e.target.value)} /></div>
          <div className="field full"><label>Fotos (un enlace por línea; la primera es la principal)</label><textarea id="lePhotos" rows={3} placeholder="https://…/foto.jpg" value={f.photos} onChange={(e) => set("photos", e.target.value)} /></div>
          <label className="field full" style={{ display: "flex", gap: 10, alignItems: "center", cursor: "pointer" }}>
            <input type="checkbox" style={{ width: "auto" }} checked={f.active} onChange={(e) => set("active", e.target.checked)} />
            <span style={{ fontSize: 14 }}>Visible en el sitio público</span>
          </label>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="admin-modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={busy}>Cancelar</button>
          <button type="button" className="btn btn-primary" id="leSave" onClick={() => void submit()} disabled={busy}>{busy ? "Guardando…" : "Guardar"}</button>
        </div>
    </Modal>
  );
}
