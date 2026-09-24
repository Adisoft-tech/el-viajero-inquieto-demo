// Helpers puros del Calendario de reservas (fincas): fechas, solapamientos,
// importación desde Excel y el motor del asistente de disponibilidad (sin LLM).

import { MONTHS_ES, type FincaBooking, type Listing } from "./data";

export function normalizeText(s: unknown): string {
  return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
}

export function fincaListings(listings: Listing[]): Listing[] {
  return listings.filter((l) => l.cat === "alojamientos");
}

export function isoDate(y: number, m: number, d: number): string {
  return y + "-" + String(m + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0");
}

function dateToIso(dt: Date): string {
  return isoDate(dt.getFullYear(), dt.getMonth(), dt.getDate());
}

export function rangesOverlap(fromA: string, toA: string, fromB: string, toB: string): boolean {
  return fromA < toB && fromB < toA;
}

export function formatDateEs(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
}

/** Reservas que ocupan un día (el día de salida también cuenta como ocupado). */
export function bookingsOnDate(bookings: FincaBooking[], iso: string): FincaBooking[] {
  return bookings.filter((b) => iso >= b.checkin && iso <= b.checkout);
}

/* ---- Importación de reservas desde Excel ---- */
export function normalizeHeader(s: unknown): string {
  return normalizeText(s).replace(/\s+/g, " ");
}

export const EXCEL_FIELD_ALIASES = {
  finca: ["finca", "cabana", "alojamiento", "propiedad"],
  guest: ["huesped", "quien reservo", "reservo", "cliente", "nombre", "nombre completo", "reservado por"],
  checkin: ["fecha", "fecha de llegada", "fecha llegada", "llegada", "check-in", "checkin", "fecha reserva", "fecha de reserva"],
  checkout: ["fecha de salida", "fecha salida", "salida", "check-out", "checkout"],
  guests: ["huespedes", "numero de huespedes", "numero de huesped", "personas", "numero de personas", "cantidad de huespedes"],
  total: ["valor a pagar", "valor total", "total", "valor", "precio"],
  advance: ["abonado", "abono", "anticipo", "valor abonado"],
  cedula: ["cedula", "identificacion", "documento"],
  phone: ["celular", "telefono", "whatsapp"],
  email: ["correo", "email", "correo electronico"],
  time: ["hora", "hora de llegada"],
  payMethod: ["forma de pago", "metodo de pago", "pago"],
} as const;
export type ExcelField = keyof typeof EXCEL_FIELD_ALIASES;

export function matchExcelColumns(headerKeys: string[]): Partial<Record<ExcelField, string>> {
  const map: Partial<Record<ExcelField, string>> = {};
  const normalizedKeys = headerKeys.map((k) => ({ orig: k, norm: normalizeHeader(k) }));
  (Object.keys(EXCEL_FIELD_ALIASES) as ExcelField[]).forEach((field) => {
    const aliases: readonly string[] = EXCEL_FIELD_ALIASES[field];
    const found = normalizedKeys.find((k) => aliases.indexOf(k.norm) > -1);
    if (found) map[field] = found.orig;
  });
  return map;
}

export function parseExcelDateValue(v: unknown): string {
  if (v == null || v === "") return "";
  if (v instanceof Date && !isNaN(v.getTime())) return dateToIso(v);
  const s = String(v).trim();
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return m[1] + "-" + m[2].padStart(2, "0") + "-" + m[3].padStart(2, "0");
  m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m) return m[3] + "-" + m[2].padStart(2, "0") + "-" + m[1].padStart(2, "0");
  const dt = new Date(s);
  if (!isNaN(dt.getTime())) return dateToIso(dt);
  return "";
}

export function parseExcelNumber(v: unknown): number {
  if (v == null || v === "") return 0;
  if (typeof v === "number") return Math.round(v);
  const digits = String(v).replace(/[^0-9]/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

export function findFincaByName(fincas: Listing[], name: unknown): Listing | null {
  const norm = normalizeHeader(name);
  if (!norm) return null;
  let match = fincas.find((f) => normalizeHeader(f.name) === norm);
  if (match) return match;
  match = fincas.find((f) => { const fn = normalizeHeader(f.name); return fn.indexOf(norm) > -1 || norm.indexOf(fn) > -1; });
  return match || null;
}

export interface ExcelImportResult {
  ok: boolean;
  /** Mensaje de error cuando ok=false. */
  error?: string;
  imported: FincaBooking[];
  skipped: number;
  skippedReasons: string[];
  lastCheckin: string;
}

/** Convierte las filas de la primera hoja (sheet_to_json con defval:"") en reservas (ids temporales; los asigna la base). */
export function bookingsFromExcelRows(rows: Record<string, unknown>[], fincas: Listing[]): ExcelImportResult {
  const result: ExcelImportResult = { ok: true, imported: [], skipped: 0, skippedReasons: [], lastCheckin: "" };
  if (!rows.length) return { ...result, ok: false, error: "El archivo no tiene filas de datos." };
  const colMap = matchExcelColumns(Object.keys(rows[0]));
  if (!colMap.finca || !colMap.guest || !colMap.checkin) {
    return { ...result, ok: false, error: "No se encontraron las columnas Finca, Huésped y Fecha — revisa los encabezados del Excel." };
  }
  const col = (row: Record<string, unknown>, f: ExcelField) => (colMap[f] ? row[colMap[f] as string] : undefined);
  const str = (row: Record<string, unknown>, f: ExcelField) => (colMap[f] ? String(col(row, f) || "").trim() : "");
  let nextId = 1;
  rows.forEach((row, idx) => {
    const fincaName = col(row, "finca");
    const finca = findFincaByName(fincas, fincaName);
    const guest = str(row, "guest");
    const checkin = parseExcelDateValue(col(row, "checkin"));
    if (!finca) { result.skipped++; result.skippedReasons.push("Fila " + (idx + 2) + ": finca \"" + String(fincaName) + "\" no coincide con el catálogo"); return; }
    if (!guest) { result.skipped++; result.skippedReasons.push("Fila " + (idx + 2) + ": falta el nombre del huésped"); return; }
    if (!checkin) { result.skipped++; result.skippedReasons.push("Fila " + (idx + 2) + ": fecha inválida"); return; }
    let checkout = colMap.checkout ? parseExcelDateValue(col(row, "checkout")) : "";
    if (!checkout) {
      const dt = new Date(checkin + "T00:00:00");
      dt.setDate(dt.getDate() + 1);
      checkout = dateToIso(dt);
    }
    if (checkout <= checkin) { result.skipped++; result.skippedReasons.push("Fila " + (idx + 2) + ": la salida no es posterior a la llegada"); return; }
    const guests = colMap.guests ? (parseExcelNumber(col(row, "guests")) || 1) : 1;
    const total = colMap.total ? parseExcelNumber(col(row, "total")) : 0;
    const advance = colMap.advance ? parseExcelNumber(col(row, "advance")) : 0;
    result.imported.push({
      id: nextId++, fincaId: finca.id, guest,
      cedula: str(row, "cedula"), phone: str(row, "phone"), email: str(row, "email"),
      checkin, checkout,
      time: str(row, "time") || "15:00",
      guests,
      payMethod: str(row, "payMethod") || "Transferencia",
      total, advance, balance: Math.max(total - advance, 0),
    });
    result.lastCheckin = checkin;
  });
  return result;
}

/* ---- Asistente de disponibilidad (chat local, sin LLM) ---- */
export function findFincaMentionedIn(fincas: Listing[], text: string): Listing | null {
  const norm = normalizeText(text);
  let match = fincas.find((f) => norm.indexOf(normalizeText(f.name)) > -1);
  if (match) return match;
  const stop = ["finca", "fincas", "cabanas", "cabana", "hacienda", "haciendas", "refugio", "el", "la", "los", "las", "de", "del", "y"];
  match = fincas.find((f) => {
    const words = normalizeText(f.name).split(" ").filter((w) => w.length > 2 && stop.indexOf(w) === -1);
    return words.some((w) => norm.indexOf(w) > -1);
  });
  return match || null;
}

export function parseSpokenDate(text: string, todayIso: string): string | null {
  const norm = normalizeText(text);
  if (/\bhoy\b/.test(norm)) return todayIso;
  if (/\bmanana\b/.test(norm)) {
    const d = new Date(todayIso + "T00:00:00"); d.setDate(d.getDate() + 1);
    return dateToIso(d);
  }
  let m = norm.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return m[1] + "-" + m[2].padStart(2, "0") + "-" + m[3].padStart(2, "0");
  m = norm.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (m) return m[3] + "-" + m[2].padStart(2, "0") + "-" + m[1].padStart(2, "0");
  m = norm.match(/(\d{1,2})\s+de\s+([a-z]+)(?:\s+de\s+(\d{4}))?/);
  if (m) {
    const day = parseInt(m[1], 10);
    const monthName = m[2];
    const monthIdx = MONTHS_ES.findIndex((mo) => normalizeText(mo) === monthName);
    if (monthIdx > -1) {
      const year = m[3] ? parseInt(m[3], 10) : new Date(todayIso + "T00:00:00").getFullYear();
      return isoDate(year, monthIdx, day);
    }
  }
  return null;
}

export interface CalChatAnswer { text: string; chips?: string[]; gotoDate?: string }

export const CAL_CHAT_CHIPS = ["¿Qué finca está libre mañana?", "¿Finca La Serrana libre el 25 de diciembre?", "Fincas libres hoy"];

export function answerCalendarChat(
  query: string, listings: Listing[], bookings: FincaBooking[], todayIso: string,
): CalChatAnswer {
  const fincas = fincaListings(listings);
  const finca = findFincaMentionedIn(fincas, query);
  const dateIso = parseSpokenDate(query, todayIso);
  const occupying = (fincaId: string, iso: string) => bookings.find((b) => b.fincaId === fincaId && iso >= b.checkin && iso <= b.checkout);

  if (dateIso && isNaN(new Date(dateIso + "T00:00:00").getTime())) {
    return { text: "Esa fecha no parece válida. Prueba con un formato como 25/12/2026 o \"25 de diciembre\".", chips: ["¿Qué finca está libre mañana?", "Fincas libres hoy"] };
  }
  if (finca && dateIso) {
    const occ = occupying(finca.id, dateIso);
    return {
      text: occ
        ? (finca.name + " está reservada el " + formatDateEs(dateIso) + " — huésped " + occ.guest + " (" + formatDateEs(occ.checkin) + " → " + formatDateEs(occ.checkout) + ").")
        : ("Sí, " + finca.name + " está disponible el " + formatDateEs(dateIso) + "."),
      gotoDate: dateIso,
    };
  }
  if (dateIso && !finca) {
    const free: string[] = [], occupied: string[] = [];
    fincas.forEach((f) => { (occupying(f.id, dateIso) ? occupied : free).push(f.name); });
    let text = "El " + formatDateEs(dateIso) + ": ";
    text += free.length ? ("libres → " + free.join(", ") + ". ") : "no hay fincas libres. ";
    if (occupied.length) text += "reservadas → " + occupied.join(", ") + ".";
    return { text, gotoDate: dateIso };
  }
  if (finca && !dateIso) {
    const upcoming = bookings.filter((b) => b.fincaId === finca.id && b.checkout >= todayIso).sort((a, b) => (a.checkin < b.checkin ? -1 : 1));
    if (!upcoming.length) return { text: finca.name + " no tiene reservas próximas registradas — está libre en cualquier fecha." };
    const next = upcoming[0];
    return { text: finca.name + " tiene " + upcoming.length + " reserva(s) próximas. La más cercana: " + formatDateEs(next.checkin) + " → " + formatDateEs(next.checkout) + " (" + next.guest + "). Dime una fecha y te digo si está libre ese día." };
  }
  return {
    text: "No entendí bien 🤔 Pregúntame algo como \"¿qué finca está libre el 25 de diciembre?\" o \"¿Finca La Serrana está libre el 20/12/2026?\".",
    chips: CAL_CHAT_CHIPS,
  };
}

/* ---- Tabla de próximas reservas ---- */
export const BOOKING_COLUMNS = [
  { key: "finca", label: "Finca" }, { key: "guest", label: "Huésped" }, { key: "cedula", label: "Cédula" },
  { key: "email", label: "Correo" }, { key: "checkin", label: "Llegada" }, { key: "checkout", label: "Salida" },
  { key: "time", label: "Hora" }, { key: "guests", label: "Huéspedes" }, { key: "payMethod", label: "Pago" },
  { key: "total", label: "Total" }, { key: "advance", label: "Abono" }, { key: "balance", label: "Saldo" },
] as const;

export function sortBookings(
  bookings: FincaBooking[], key: string, dirStr: "asc" | "desc", fincaName: (id: string) => string,
): FincaBooking[] {
  const dir = dirStr === "desc" ? -1 : 1;
  const val = (b: FincaBooking): unknown => (key === "finca" ? fincaName(b.fincaId) : b[key]);
  return bookings.slice().sort((a, b) => {
    let av = val(a), bv = val(b);
    if (typeof av === "string" || typeof bv === "string") { av = String(av || "").toLowerCase(); bv = String(bv || "").toLowerCase(); }
    else { av = av || 0; bv = bv || 0; }
    if ((av as number) < (bv as number)) return -1 * dir;
    if ((av as number) > (bv as number)) return 1 * dir;
    return 0;
  });
}
