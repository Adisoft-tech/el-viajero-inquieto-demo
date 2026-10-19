"use server";

// Server Actions del panel administrativo: textos del sitio, reseñas, catálogo de parques/tours y fincas completas.
// Son endpoints públicos, así que validan cada entrada y, salvo getSiteConfig (lo que lee el sitio público),
// exigen como primer argumento el token de sesión del equipo.

import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { INITIAL_CONTENT, type Listing, type Review, type SiteContent } from "@/lib/data";
import { ICONS } from "@/lib/icon-data";

function text(v: unknown, max = 500): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}
function int(v: unknown, min = 0): number {
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) ? Math.max(Math.round(n), min) : min;
}
function list(v: unknown, maxItems: number, maxLen: number): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => text(x, maxLen)).filter(Boolean).slice(0, maxItems);
}
/** Solo rutas del sitio o enlaces http(s): evita javascript: y similares. */
function url(v: unknown): string {
  const s = text(v, 1000);
  return /^(https?:\/\/|\/)/i.test(s) ? s : "";
}
/** Los textos del hero admiten énfasis (<em>, <strong>, <br>); cualquier otra etiqueta se elimina. */
function lightHtml(v: string): string {
  return v.replace(/<(?!\/?(em|strong|b|br)\s*\/?>)[^>]*>/gi, "");
}
const HTML_FIELDS = new Set(["heroEyebrow", "heroTitle", "heroLede"]);

/* ---- Lectura pública ---- */
export interface SiteConfig { content: SiteContent | null; reviews: Review[] | null; catalog: Listing[] | null }

export async function getSiteConfig(): Promise<SiteConfig> {
  const rows = await db()<{ key: string; value: unknown }[]>`select key, value from site_content`;
  const byKey = new Map(rows.map((r) => [r.key, r.value]));
  return {
    content: (byKey.get("content") as SiteContent | undefined) ?? null,
    reviews: (byKey.get("reviews") as Review[] | undefined) ?? null,
    catalog: (byKey.get("catalog") as Listing[] | undefined) ?? null,
  };
}

async function put(key: string, value: unknown) {
  const sql = db();
  await sql`
    insert into site_content (key, value) values (${key}, ${sql.json(value as never)})
    on conflict (key) do update set value = excluded.value, updated_at = now()`;
}

/* ---- Textos del sitio ---- */
export async function saveSiteContent(token: string, content: SiteContent): Promise<SiteContent> {
  await requireSession(token);
  const clean: SiteContent = {};
  for (const key of Object.keys(INITIAL_CONTENT)) {
    const raw = text((content as Record<string, unknown>)?.[key], 5000);
    // Un campo vacío vuelve al texto original en vez de dejar un hueco en el sitio.
    const v = raw || INITIAL_CONTENT[key];
    clean[key] = HTML_FIELDS.has(key) ? lightHtml(v) : v;
  }
  clean.whatsappNumber = clean.whatsappNumber.replace(/\D/g, "") || INITIAL_CONTENT.whatsappNumber;
  clean.facebookUrl = url(clean.facebookUrl) || INITIAL_CONTENT.facebookUrl;
  clean.instagramUrl = url(clean.instagramUrl) || INITIAL_CONTENT.instagramUrl;
  await put("content", clean);
  return clean;
}

/* ---- Reseñas ---- */
export async function saveReviews(token: string, reviews: Review[]): Promise<Review[]> {
  await requireSession(token);
  if (!Array.isArray(reviews) || reviews.length > 100) throw new Error("Máximo 100 reseñas");
  const clean: Review[] = reviews
    .map((r) => ({
      name: text(r?.name, 120), origin: text(r?.origin, 120), listing: text(r?.listing, 160),
      quote: text(r?.quote, 1000), rating: Math.min(5, Math.max(1, int(r?.rating, 1))),
    }))
    .filter((r) => r.name && r.quote);
  await put("reviews", clean);
  return clean;
}

/* ---- Listados: campos comunes ---- */
const TONES = ["sage", "lagoon", "ink"] as const;

function cleanListing(l: Listing, cat: Listing["cat"], id: string): Listing {
  const name = text(l.name, 160);
  if (!name) throw new Error("Falta el nombre");
  const tone = TONES.includes(l.tone as (typeof TONES)[number]) ? l.tone : "sage";
  const out: Listing = {
    id, cat, name,
    town: text(l.town, 120) || "Por definir", dept: text(l.dept, 120) || "Eje cafetero",
    icon: l.icon in ICONS ? l.icon : "valle", tone,
    unit: cat === "alojamientos" ? "noche" : "persona",
    price: int(l.price), cap: int(l.cap, 1),
    rating: Math.min(5, Math.max(0, Math.round((Number(l.rating) || 0) * 10) / 10)), reviews: int(l.reviews),
    tags: list(l.tags, 10, 80), desc: text(l.desc, 3000), highlights: list(l.highlights, 12, 200),
    active: l.active !== false,
  };
  const photos = (Array.isArray(l.photos) ? l.photos : []).map(url).filter(Boolean).slice(0, 12);
  if (photos.length) out.photos = photos;
  const schedule = text(l.schedule, 80);
  if (schedule) out.schedule = schedule;
  const duration = text(l.duration, 80);
  if (duration) out.duration = duration;
  const ext = url(l.externalUrl);
  if (ext) out.externalUrl = ext;
  return out;
}

/* ---- Catálogo de parques y tours (se guarda completo como JSON) ---- */
export async function saveCatalog(token: string, listings: Listing[]): Promise<Listing[]> {
  await requireSession(token);
  if (!Array.isArray(listings) || listings.length > 300) throw new Error("Máximo 300 listados");
  const seen = new Set<string>();
  const clean = listings.map((l) => {
    if (l?.cat !== "parques" && l?.cat !== "tours") throw new Error("Solo parques y tours se guardan en el catálogo");
    const id = text(l.id, 120).replace(/[^a-z0-9-]/gi, "-") || "item-" + Date.now();
    if (seen.has(id)) throw new Error("Id repetido: " + id);
    seen.add(id);
    return cleanListing(l, l.cat, id);
  });
  await put("catalog", clean);
  return clean;
}

/* ---- Fincas completas (las del calendario de gestión) ---- */
interface FincaRow {
  id: string; name: string; town: string; dept: string; icon: string; tone: Listing["tone"];
  price: number; cap: number; rating: string; reviews: number; tags: string[]; description: string; highlights: string[];
  active: boolean; photos: string[];
}
const FINCA_COLS = "id, name, town, dept, icon, tone, price, cap, rating, reviews, tags, description, highlights, active, photos";

function fincaToListing(r: FincaRow): Listing {
  return {
    id: r.id, cat: "alojamientos", name: r.name, town: r.town, dept: r.dept, icon: r.icon, tone: r.tone,
    unit: "noche", price: r.price, cap: r.cap, rating: Number(r.rating), reviews: r.reviews,
    tags: r.tags, desc: r.description, highlights: r.highlights,
    active: r.active, ...(r.photos.length ? { photos: r.photos } : {}),
  };
}

/** Crea la finca (id null) o reemplaza todos sus datos editables. */
export async function saveFincaFull(token: string, id: string | null, input: Listing): Promise<Listing> {
  await requireSession(token);
  const sql = db();
  const l = cleanListing(input, "alojamientos", id ? text(id, 120) : "finca-" + Date.now());
  const rows = id
    ? await sql.unsafe<FincaRow[]>(
        `update fincas set name=$2, town=$3, dept=$4, icon=$5, tone=$6, price=$7, cap=$8, rating=$9, reviews=$10,
           tags=$11, description=$12, highlights=$13, active=$14, photos=$15, updated_at=now()
         where id=$1 and deleted_at is null returning ${FINCA_COLS}`,
        [l.id, l.name, l.town, l.dept, l.icon, l.tone, l.price, l.cap, l.rating, l.reviews, l.tags, l.desc, l.highlights, l.active !== false, l.photos ?? []] as never,
      )
    : await sql.unsafe<FincaRow[]>(
        `insert into fincas (id, name, town, dept, icon, tone, price, cap, rating, reviews, tags, description, highlights, active, photos)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) returning ${FINCA_COLS}`,
        [l.id, l.name, l.town, l.dept, l.icon, l.tone, l.price, l.cap, l.rating, l.reviews, l.tags, l.desc, l.highlights, l.active !== false, l.photos ?? []] as never,
      );
  if (!rows.length) throw new Error("La finca no existe");
  return fincaToListing(rows[0]);
}
