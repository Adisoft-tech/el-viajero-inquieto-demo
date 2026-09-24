"use server";

// Server Actions del panel de gestión: fincas, reservas del calendario y documentos.
// Son endpoints públicos (cualquiera puede invocarlos), así que validan cada entrada y, salvo listFincas
// (el catálogo que lee el sitio público), exigen como primer argumento el token de sesión del equipo.

import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import type { FincaBooking, Listing } from "@/lib/data";
import type { DocData, DocType } from "@/lib/pdf";

/* ---- Validación ---- */
const DOC_TYPES: readonly DocType[] = ["cotizacion", "cobro", "pago"];
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function text(v: unknown, max = 500): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}
function int(v: unknown, min = 0): number {
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) ? Math.max(Math.round(n), min) : min;
}
function isoDate(v: unknown): string {
  const s = text(v, 10);
  if (!ISO_DATE.test(s) || isNaN(new Date(s + "T00:00:00").getTime())) throw new Error("Fecha inválida: " + s);
  return s;
}
function docType(v: unknown): DocType {
  if (!DOC_TYPES.includes(v as DocType)) throw new Error("Tipo de documento inválido");
  return v as DocType;
}

/* ---- Fincas ---- */
interface FincaRow {
  id: string; name: string; town: string; dept: string; icon: string; tone: Listing["tone"];
  price: number; cap: number; rating: string; reviews: number; tags: string[]; description: string; highlights: string[];
}
function toListing(r: FincaRow): Listing {
  return {
    id: r.id, cat: "alojamientos", name: r.name, town: r.town, dept: r.dept, icon: r.icon, tone: r.tone,
    unit: "noche", price: r.price, cap: r.cap, rating: Number(r.rating), reviews: r.reviews,
    tags: r.tags, desc: r.description, highlights: r.highlights,
  };
}

export async function listFincas(): Promise<Listing[]> {
  const rows = await db()<FincaRow[]>`
    select id, name, town, dept, icon, tone, price, cap, rating, reviews, tags, description, highlights
    from fincas where deleted_at is null order by created_at, id`;
  return rows.map(toListing);
}

export interface FincaInput { name: string; town: string; dept: string; price: number; cap: number; desc: string }

/** Crea la finca (id null) o actualiza la existente. Los campos vacíos conservan el valor anterior. */
export async function saveFinca(token: string, id: string | null, input: FincaInput): Promise<Listing> {
  await requireSession(token);
  const name = text(input.name, 120);
  if (!name) throw new Error("Falta el nombre de la finca");
  const town = text(input.town, 120), dept = text(input.dept, 120), desc = text(input.desc, 2000);
  const price = int(input.price), cap = int(input.cap, 1);
  const sql = db();
  const rows = id
    ? await sql<FincaRow[]>`
        update fincas set
          name = ${name}, town = coalesce(nullif(${town}, ''), town), dept = coalesce(nullif(${dept}, ''), dept),
          price = ${price}, cap = ${cap}, description = coalesce(nullif(${desc}, ''), description), updated_at = now()
        where id = ${text(id, 120)} and deleted_at is null
        returning id, name, town, dept, icon, tone, price, cap, rating, reviews, tags, description, highlights`
    : await sql<FincaRow[]>`
        insert into fincas (id, name, town, dept, price, cap, rating, reviews, description, highlights)
        values (${"finca-" + Date.now()}, ${name}, ${town || "Por definir"}, ${dept || "Eje cafetero"}, ${price}, ${cap},
                5.0, 0, ${desc || "Descripción pendiente por completar."}, ${["Detalles por definir"]})
        returning id, name, town, dept, icon, tone, price, cap, rating, reviews, tags, description, highlights`;
  if (!rows.length) throw new Error("La finca no existe");
  return toListing(rows[0]);
}

/** Borrado lógico: sale del catálogo y del calendario, pero sus reservas quedan guardadas. */
export async function deleteFinca(token: string, id: string): Promise<void> {
  await requireSession(token);
  await db()`update fincas set deleted_at = now(), updated_at = now() where id = ${text(id, 120)}`;
}

/* ---- Reservas ---- */
export interface FincaBookingInput {
  fincaId: string; guest: string; cedula: string; phone: string; email: string;
  checkin: string; checkout: string; time: string; guests: number; adults?: number; children?: number;
  payMethod: string; total: number; advance: number;
}

const BOOKING_COLUMNS_SQL = `
  id::int, finca_id as "fincaId", guest, cedula, phone, email, checkin::text, checkout::text,
  arrival_time as "time", guests, pay_method as "payMethod",
  total::float8, advance::float8, balance::float8`;

export async function listFincaBookings(token: string): Promise<FincaBooking[]> {
  await requireSession(token);
  return db().unsafe<FincaBooking[]>(`select ${BOOKING_COLUMNS_SQL} from finca_bookings order by checkin, id`);
}

function bookingValues(b: FincaBookingInput, source: "manual" | "excel") {
  const guest = text(b.guest, 160);
  if (!guest) throw new Error("Falta el nombre del huésped");
  const checkin = isoDate(b.checkin), checkout = isoDate(b.checkout);
  if (checkout <= checkin) throw new Error("La salida debe ser posterior a la llegada");
  return {
    finca_id: text(b.fincaId, 120), guest,
    cedula: text(b.cedula, 60), phone: text(b.phone, 60), email: text(b.email, 160),
    checkin, checkout, arrival_time: text(b.time, 10) || "15:00",
    guests: int(b.guests, 1),
    adults: b.adults == null ? null : int(b.adults, 0),
    children: b.children == null ? null : int(b.children, 0),
    pay_method: text(b.payMethod, 40) || "Transferencia",
    total: int(b.total), advance: int(b.advance), source,
  };
}

async function insertBookings(values: ReturnType<typeof bookingValues>[]): Promise<FincaBooking[]> {
  if (!values.length) return [];
  const sql = db();
  const inserted = await sql<{ id: number }[]>`insert into finca_bookings ${sql(values)} returning id::int`;
  return sql.unsafe<FincaBooking[]>(
    `select ${BOOKING_COLUMNS_SQL} from finca_bookings where id = any($1::bigint[]) order by id`,
    [inserted.map((r) => r.id)],
  );
}

export async function createFincaBooking(token: string, b: FincaBookingInput): Promise<FincaBooking> {
  await requireSession(token);
  const [row] = await insertBookings([bookingValues(b, "manual")]);
  return row;
}

/** Importa todas las filas en una sola sentencia: o entran todas o ninguna. */
export async function importFincaBookings(token: string, bs: FincaBookingInput[]): Promise<FincaBooking[]> {
  await requireSession(token);
  if (!Array.isArray(bs) || bs.length > 2000) throw new Error("Importa máximo 2.000 reservas por archivo");
  return insertBookings(bs.map((b) => bookingValues(b, "excel")));
}

/* ---- Documentos ---- */
export type DocCounters = Record<DocType, number>;

/** Próximo consecutivo de cada tipo (el que se asignará en la siguiente emisión). */
export async function getDocCounters(token: string): Promise<DocCounters> {
  await requireSession(token);
  return readDocCounters();
}

async function readDocCounters(): Promise<DocCounters> {
  const rows = await db()<{ type: DocType; next: number }[]>`select type, last_number + 1 as next from doc_counters`;
  const counters: DocCounters = { cotizacion: 1, cobro: 1, pago: 1 };
  rows.forEach((r) => { counters[r.type] = r.next; });
  return counters;
}

/** Contenido del formulario que se guarda con el documento (todo menos los consecutivos). */
export type DocContent = Omit<DocData, "counters">;

export interface Documento {
  id: number; type: DocType; numero: number; fecha: string; cliente: string; total: number; createdAt: string;
  data: DocContent;
}

function docContent(d: DocContent): DocContent {
  const items = (Array.isArray(d.items) ? d.items : []).slice(0, 200).map((it) => ({
    desc: text(it?.desc, 500), qty: Math.max(Number(it?.qty) || 0, 0), price: Math.max(Number(it?.price) || 0, 0),
  }));
  const out: DocContent = { type: docType(d.type), items };
  (["cliente", "clienteId", "formaPago", "clienteCelular", "clienteCorreo", "clienteDireccion", "clienteCiudad", "objeto"] as const)
    .forEach((k) => { const v = text(d[k], 300); if (v) out[k] = v; });
  const obs = text(d.observaciones, 4000);
  if (obs) out.observaciones = obs;
  if (d.fecha) out.fecha = isoDate(d.fecha);
  if (d.validoHasta) out.validoHasta = isoDate(d.validoHasta);
  return out;
}

/**
 * Asigna el consecutivo y guarda el documento en una transacción, así dos personas
 * descargando al tiempo nunca reciben el mismo número.
 */
export async function emitirDocumento(token: string, d: DocContent, fechaPorDefecto: string): Promise<{ numero: number; counters: DocCounters }> {
  await requireSession(token);
  const content = docContent(d);
  const fecha = content.fecha || isoDate(fechaPorDefecto);
  const total = Math.round(content.items.reduce((a, it) => a + it.qty * it.price, 0));
  const numero = await db().begin(async (tx) => {
    const [c] = await tx<{ last_number: number }[]>`
      update doc_counters set last_number = last_number + 1 where type = ${content.type} returning last_number`;
    await tx`
      insert into documentos (type, numero, fecha, cliente, total, data)
      values (${content.type}, ${c.last_number}, ${fecha}, ${content.cliente || ""}, ${total}, ${tx.json(JSON.parse(JSON.stringify(content)))})`;
    return c.last_number;
  });
  return { numero, counters: await readDocCounters() };
}

export async function listDocumentos(token: string, limit = 30): Promise<Documento[]> {
  await requireSession(token);
  return db()<Documento[]>`
    select id::int, type, numero, fecha::text, cliente, total::float8, created_at::text as "createdAt", data
    from documentos order by created_at desc, id desc limit ${Math.min(int(limit, 1), 200)}`;
}
