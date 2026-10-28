"use client";

import { useState } from "react";
import { INITIAL_CONTENT, type Review, type SiteContent } from "@/lib/data";
import { Icon } from "@/lib/icons";
import { useApp } from "@/lib/store";
import { saveReviews, saveSiteContent, saveSiteContentEn } from "@/lib/actions/cms";
import { contentFor, INITIAL_CONTENT_EN, TRANSLATABLE_KEYS, type Lang } from "@/lib/i18n";
import { InventoryManager } from "./AdminInventario";

type Kind = "text" | "area" | "url";
interface FieldDef { key: string; label: string; kind?: Kind; rows?: number; hint?: string }
interface Section { title: string; fields: FieldDef[] }

const INICIO: Section[] = [
  { title: "Portada", fields: [
    { key: "heroEyebrow", label: "Etiqueta superior" },
    { key: "heroTitle", label: "Título principal", kind: "area", rows: 2, hint: "Usa <em>…</em> para resaltar palabras." },
    { key: "heroLede", label: "Texto de apoyo", kind: "area", rows: 3 },
    { key: "rnt", label: "Número de RNT" },
    { key: "rntLabel", label: "Texto bajo el RNT" },
    { key: "heroTripsTitle", label: "Viajes programados · título" },
    { key: "heroTripsText", label: "Viajes programados · texto", kind: "area", rows: 2, hint: "La lista muestra las experiencias activas del Inventario, con su fecha." },
  ] },
  { title: "Categorías", fields: [
    { key: "catSectionTitle", label: "Título de la sección" },
    { key: "catAlojTitle", label: "Fincas · título" }, { key: "catAlojDesc", label: "Fincas · descripción", kind: "area", rows: 2 },
    { key: "catParquesTitle", label: "Parques · título" }, { key: "catParquesDesc", label: "Parques · descripción", kind: "area", rows: 2 },
    { key: "catToursTitle", label: "Experiencias · título" }, { key: "catToursDesc", label: "Experiencias · descripción", kind: "area", rows: 2 },
    { key: "featuredTitle", label: "Título de “Destacados”" },
  ] },
  { title: "Por qué reservar aquí", fields: [
    { key: "trustTitle", label: "Título de la sección" },
    ...[1, 2, 3, 4].flatMap((n): FieldDef[] => [
      { key: `trust${n}Title`, label: `Punto ${n} · título` },
      { key: `trust${n}Desc`, label: `Punto ${n} · descripción`, kind: "area", rows: 2 },
    ]),
    { key: "reviewsTitle", label: "Título de las reseñas" },
  ] },
  { title: "Bloque “Nuestra esencia”", fields: [
    { key: "aboutEyebrow", label: "Etiqueta" }, { key: "aboutTitle", label: "Título" },
    { key: "aboutText", label: "Texto", kind: "area", rows: 4 },
  ] },
  { title: "Pie de página", fields: [{ key: "footerTagline", label: "Frase del pie de página", kind: "area", rows: 2 }] },
];

const NOSOTROS: Section[] = [
  { title: "Encabezado", fields: [
    { key: "nosEyebrow", label: "Etiqueta superior" },
    { key: "nosName", label: "Nombre (una línea por renglón)", kind: "area", rows: 2 },
    { key: "nosMotto", label: "Lema" },
  ] },
  { title: "Misión, visión y propósito", fields: [
    { key: "nosMissionTitle", label: "Misión · título" },
    { key: "nosMission", label: "Misión", kind: "area", rows: 8, hint: "Separa los párrafos con una línea en blanco." },
    { key: "nosVisionTitle", label: "Visión · título" },
    { key: "nosVision", label: "Visión", kind: "area", rows: 8, hint: "Separa los párrafos con una línea en blanco." },
    { key: "nosPurposeTitle", label: "Propósito · título" },
    { key: "nosPurpose", label: "Propósito", kind: "area", rows: 6, hint: "Separa los párrafos con una línea en blanco." },
  ] },
];

const CONTACTO: Section[] = [
  { title: "Página de contacto", fields: [
    { key: "contactEyebrow", label: "Etiqueta" }, { key: "contactTitle", label: "Título" },
    { key: "contactEmail", label: "Correo" }, { key: "contactPhone", label: "Teléfono (como se muestra)" },
    { key: "contactCity", label: "Ciudad" },
  ] },
  { title: "WhatsApp y redes", fields: [
    { key: "whatsappNumber", label: "WhatsApp (con indicativo, solo números)", hint: "Ej. 573148734314. Aquí llegan las reservas del sitio." },
    { key: "whatsappMessage", label: "Mensaje de saludo", kind: "area", rows: 2 },
    { key: "socialTitle", label: "Título de los botones" },
    { key: "facebookUrl", label: "Enlace de Facebook", kind: "url" },
    { key: "instagramUrl", label: "Enlace de Instagram", kind: "url" },
  ] },
];

const TABS = [
  ["inicio", "Inicio"], ["nosotros", "Nosotros"], ["contacto", "Contacto y redes"], ["resenas", "Reseñas"], ["catalogo", "Catálogo"],
] as const;
type Tab = (typeof TABS)[number][0];
const SECTIONS: Partial<Record<Tab, Section[]>> = { inicio: INICIO, nosotros: NOSOTROS, contacto: CONTACTO };

/**
 * Formulario de textos de una pestaña, en español o en inglés. En español se guarda todo el contenido junto; en
 * inglés solo los textos traducibles (lo que se deje vacío usa la traducción por defecto). “Restaurar” solo rellena.
 */
function TextEditor({ sections, lang }: { sections: Section[]; lang: Lang }) {
  const { content, setContent, contentEn, setContentEn, authed, toast } = useApp();
  const isEn = lang === "en";
  const shown = isEn
    ? sections.map((sec) => ({ ...sec, fields: sec.fields.filter((f) => TRANSLATABLE_KEYS.includes(f.key)) })).filter((sec) => sec.fields.length)
    : sections;
  const [form, setForm] = useState<SiteContent>(() => (isEn ? contentFor("en", content, contentEn) : content));
  const [busy, setBusy] = useState(false);
  const keys = shown.flatMap((s) => s.fields.map((f) => f.key));
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const save = async () => {
    setBusy(true);
    try {
      if (isEn) {
        const saved = await authed(saveSiteContentEn, Object.fromEntries(TRANSLATABLE_KEYS.map((k) => [k, form[k] ?? ""])));
        setContentEn(saved); setForm(contentFor("en", content, saved));
      } else {
        const saved = await authed(saveSiteContent, { ...content, ...form });
        setContent(saved); setForm(saved);
      }
      toast(isEn ? "Textos en inglés guardados: ya se ven en el sitio" : "Contenido guardado: ya se ve en el sitio");
    } catch (err) {
      console.error(err);
      toast("No se pudo guardar. Intenta de nuevo.");
    }
    setBusy(false);
  };
  const restore = () => {
    if (!confirm("¿Volver los textos de esta pestaña a los originales? Se aplicará al sitio cuando guardes.")) return;
    const defaults = isEn ? INITIAL_CONTENT_EN : INITIAL_CONTENT;
    setForm((p) => ({ ...p, ...Object.fromEntries(keys.map((k) => [k, defaults[k]])) }));
  };

  return (
    <div className="cms-grid">
      <div className="panel" style={{ gridColumn: "1 / -1" }}>
        {isEn && <p className="cms-hint" style={{ margin: "0 0 18px" }}>Estás editando la versión en inglés del sitio. Bajo cada campo ves el texto en español como referencia. El RNT, el teléfono y los enlaces se editan en la vista en español.</p>}
        {shown.map((sec) => (
          <div key={sec.title}>
            <p className="cms-section-title">{sec.title}</p>
            <div className="form-grid">
              {sec.fields.map((f) => (
                <div key={f.key} className={"cms-field" + (f.kind === "area" || (form[f.key] || "").length > 60 ? " full" : "")}>
                  <label htmlFor={"cms-" + f.key}>{f.label}</label>
                  {f.kind === "area"
                    ? <textarea id={"cms-" + f.key} rows={f.rows || 3} value={form[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)} />
                    : <input id={"cms-" + f.key} type={f.kind === "url" ? "url" : "text"} value={form[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)} />}
                  {isEn
                    ? <p className="cms-hint cms-hint-es">ES: {(content[f.key] || "").replace(/<[^>]+>/g, "").slice(0, 220)}{(content[f.key] || "").length > 220 ? "…" : ""}</p>
                    : f.hint && <p className="cms-hint">{f.hint}</p>}
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="cms-actions">
          <button className="btn btn-primary" id="cmsSave" onClick={() => void save()} disabled={busy}>{busy ? "Guardando…" : isEn ? "Guardar textos en inglés" : "Guardar cambios"}</button>
          <button className="btn btn-ghost" onClick={restore} disabled={busy}>{isEn ? "Restaurar traducción original" : "Restaurar textos originales"}</button>
        </div>
      </div>
    </div>
  );
}

function ReviewsEditor() {
  const { reviews, setReviews, authed, toast } = useApp();
  const [rows, setRows] = useState<Review[]>(reviews);
  const [busy, setBusy] = useState(false);
  const patch = (i: number, p: Partial<Review>) => setRows((r) => r.map((x, j) => (j === i ? { ...x, ...p } : x)));
  const save = async () => {
    setBusy(true);
    try {
      const saved = await authed(saveReviews, rows);
      setReviews(saved); setRows(saved);
      toast("Reseñas guardadas");
    } catch (err) { console.error(err); toast("No se pudo guardar. Intenta de nuevo."); }
    setBusy(false);
  };
  return (
    <div className="panel">
      <div className="panel-head">
        <h3>Reseñas de viajeros</h3>
        <button className="btn btn-ghost btn-sm" onClick={() => setRows((r) => [{ name: "", origin: "", rating: 5, quote: "", listing: "" }, ...r])}><Icon name="plus" /> Agregar reseña</button>
      </div>
      <p className="cms-hint" style={{ margin: "0 0 14px" }}>Publica solo reseñas reales de clientes, con su permiso. Mientras no haya ninguna, la sección de testimonios no aparece en el sitio.</p>
      {rows.length === 0 && <p className="empty-note">No hay reseñas. Agrega la primera.</p>}
      {rows.map((r, i) => (
        <div key={i} className="review-edit">
          <div className="review-edit-head">
            <b>{r.name || "Nueva reseña"}</b>
            <button type="button" className="icon-btn" aria-label="Eliminar reseña" onClick={() => setRows((x) => x.filter((_, j) => j !== i))}><Icon name="trash" /></button>
          </div>
          <div className="form-grid">
            <div className="cms-field"><label>Nombre</label><input value={r.name} onChange={(e) => patch(i, { name: e.target.value })} /></div>
            <div className="cms-field"><label>Procedencia</label><input value={r.origin} onChange={(e) => patch(i, { origin: e.target.value })} /></div>
            <div className="cms-field"><label>Experiencia</label><input value={r.listing} onChange={(e) => patch(i, { listing: e.target.value })} /></div>
            <div className="cms-field"><label>Estrellas (1 a 5)</label><input type="number" min={1} max={5} value={r.rating} onChange={(e) => patch(i, { rating: Math.min(5, Math.max(1, parseInt(e.target.value, 10) || 1)) })} /></div>
            <div className="cms-field full"><label>Comentario</label><textarea rows={3} value={r.quote} onChange={(e) => patch(i, { quote: e.target.value })} /></div>
          </div>
        </div>
      ))}
      <div className="cms-actions">
        <button className="btn btn-primary" onClick={() => void save()} disabled={busy}>{busy ? "Guardando…" : "Guardar reseñas"}</button>
      </div>
    </div>
  );
}

export function AdminContenido() {
  const [tab, setTab] = useState<Tab>("inicio");
  const [lang, setLang] = useState<Lang>("es");
  return (
    <div className="fade-in">
      <div className="admin-head"><div><h1>Contenido del sitio</h1><p>Edita, cambia o borra los textos, las reseñas y el catálogo de la plataforma. Los cambios se guardan y se ven en el sitio al instante.</p></div></div>
      <div className="cms-tabs" role="tablist">
        {TABS.map(([key, label]) => (
          <button key={key} type="button" role="tab" aria-selected={tab === key} className={"cms-tab" + (tab === key ? " active" : "")} onClick={() => setTab(key)}>{label}</button>
        ))}
      </div>
      {SECTIONS[tab] && (
        <>
          <div className="cms-lang" role="group" aria-label="Idioma que estás editando">
            <span>Idioma del texto:</span>
            <button type="button" className={lang === "es" ? "active" : undefined} aria-pressed={lang === "es"} onClick={() => setLang("es")}>Español</button>
            <button type="button" className={lang === "en" ? "active" : undefined} aria-pressed={lang === "en"} onClick={() => setLang("en")}>English</button>
          </div>
          <TextEditor key={tab + lang} sections={SECTIONS[tab]!} lang={lang} />
        </>
      )}
      {tab === "resenas" && <ReviewsEditor />}
      {tab === "catalogo" && <InventoryManager />}
    </div>
  );
}
