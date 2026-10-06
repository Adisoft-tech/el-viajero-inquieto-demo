// Port de generateDocPDF() del HTML original: arma la cotización / cuenta de cobro / cuenta de pago
// con jsPDF (importado dinámicamente para no cargarlo hasta que se descarga un documento).

import type { jsPDF } from "jspdf";
import { DEMO_TODAY, EMISOR, type FincaBooking, type Listing } from "./data";
import { cop, copWords } from "./format";

export type DocType = "cotizacion" | "cobro" | "pago";
export interface DocItem {
  desc: string; qty: number; price: number;
  /** Detalle opcional (solo cotización): a quién y por cuánto tiempo aplica el ítem. */
  adults?: number; children?: number; nights?: number; days?: number;
}
export interface DocData {
  type: DocType;
  counters: Record<DocType, number>;
  items: DocItem[];
  fecha?: string;
  cliente?: string;
  clienteId?: string;
  formaPago?: string;
  validoHasta?: string;
  clienteCelular?: string;
  clienteCorreo?: string;
  clienteDireccion?: string;
  clienteCiudad?: string;
  objeto?: string;
  observaciones?: string;
}

/* ---------- Itinerarios ---------- */
export type ActivityCategoryKey = "comida" | "transporte" | "aventura" | "alojamiento" | "cultura" | "descanso";
export interface ItinerarioActivity {
  time: string; category: ActivityCategoryKey; title: string; desc?: string; place?: string;
}
export interface ItinerarioDay { title?: string; activities: ItinerarioActivity[] }
export interface ItinerarioData {
  destino?: string;
  fechaInicio?: string;
  dias: ItinerarioDay[];
  notas?: string;
}
export const ACTIVITY_CATEGORIES: {
  key: ActivityCategoryKey; label: string; icon: string; chipBg: [number, number, number]; chipFg: [number, number, number];
}[] = [
  { key: "comida", label: "Comida", icon: "cafe", chipBg: [246, 236, 217], chipFg: [138, 95, 30] },
  { key: "transporte", label: "Transporte", icon: "car", chipBg: [227, 233, 242], chipFg: [62, 90, 133] },
  { key: "aventura", label: "Aventura", icon: "valle", chipBg: [228, 238, 227], chipFg: [62, 107, 74] },
  { key: "alojamiento", label: "Alojamiento", icon: "farm", chipBg: [240, 222, 212], chipFg: [156, 90, 62] },
  { key: "cultura", label: "Cultura", icon: "bogota", chipBg: [234, 225, 240], chipFg: [107, 74, 138] },
  { key: "descanso", label: "Descanso", icon: "termal", chipBg: [223, 233, 234], chipFg: [62, 106, 111] },
];
export function categoryInfo(key: string) {
  return ACTIVITY_CATEGORIES.find((c) => c.key === key) || ACTIVITY_CATEGORIES[2];
}
function addDaysIso(iso: string, n: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

export function formatDateEs(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
}

export function docTypeLabelUpper(type: DocType): string {
  return type === "cotizacion" ? "COTIZACIÓN" : type === "cobro" ? "CUENTA DE COBRO" : "CUENTA DE PAGO";
}

export function docCounter(d: DocData): string {
  return String(d.counters[d.type]).padStart(4, "0");
}

/**
 * Los PDF usan las fuentes base de jsPDF (Helvetica/Times con WinAnsiEncoding): soportan
 * tildes, eñes y rayas como — o – sin problema, pero no emojis ni otros símbolos Unicode
 * fuera de ese rango — esos se ven como texto corrupto ("Ø=Ú°", "!'", etc.). Se quitan antes
 * de dibujar, incluso en texto ya guardado de antes de este arreglo.
 */
function stripUnsupportedGlyphs<T extends string | undefined>(s: T): T {
  if (!s) return s;
  return s
    .replace(/\u{2192}/gu, "->").replace(/\u{2190}/gu, "<-").replace(/\u{2194}/gu, "<->") // flechas con equivalente en texto
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, "") // emoji (emoticons, pictografías, transporte, símbolos suplementarios…)
    .replace(/[\u{2190}-\u{21FF}]/gu, "") // el resto de las flechas, sin equivalente simple en texto
    .replace(/[\u{2600}-\u{27BF}]/gu, "") // símbolos varios y dingbats (☀ ★ ✈ ✂ etc.)
    .replace(/[\u{2B00}-\u{2BFF}]/gu, "") // flechas y símbolos varios adicionales (⭐ ➡ etc.)
    .replace(/[\u{FE00}-\u{FE0F}]/gu, "") // selectores de variación (el modificador invisible detrás de ✈️)
    .replace(/\u{200D}/gu, "") // zero-width joiner (emojis compuestos)
    .split("\n").map((line) => line.replace(/[ \t]{2,}/g, " ").trim()).join("\n") as T;
}
function cleanDocData(d: DocData): DocData {
  return {
    ...d,
    cliente: stripUnsupportedGlyphs(d.cliente),
    clienteId: stripUnsupportedGlyphs(d.clienteId),
    clienteDireccion: stripUnsupportedGlyphs(d.clienteDireccion),
    clienteCiudad: stripUnsupportedGlyphs(d.clienteCiudad),
    objeto: stripUnsupportedGlyphs(d.objeto),
    observaciones: stripUnsupportedGlyphs(d.observaciones),
    items: (d.items || []).map((it) => ({ ...it, desc: stripUnsupportedGlyphs(it.desc) })),
  };
}

let logoPromise: Promise<HTMLImageElement | null> | null = null;
/** Equivalente al LOGO_IMG precargado del original; resuelve null si no carga. */
function loadLogo(): Promise<HTMLImageElement | null> {
  if (!logoPromise) {
    logoPromise = new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img.naturalWidth > 0 ? img : null);
      img.onerror = () => { logoPromise = null; resolve(null); };
      img.src = "/photos/logo-mark-ink.png";
    });
  }
  return logoPromise;
}

type Pt = [number, number];

/** Membrete: logo + marca de agua + "El Viajero Inquieto" + línea divisoria. Común a todos los documentos. */
function drawBrandHeader(doc: jsPDF, LOGO_IMG: HTMLImageElement | null, GStateCtor: typeof import("jspdf")["GState"], marginX: number, pageW: number, pageH: number) {
  if (LOGO_IMG) {
    try {
      doc.saveGraphicsState();
      doc.setGState(new GStateCtor({ opacity: 0.07 }));
      const wm = 120;
      doc.addImage(LOGO_IMG, "PNG", (pageW - wm) / 2, (pageH - wm) / 2, wm, wm);
      doc.restoreGraphicsState();
    } catch { /* ignore */ }
    try { doc.addImage(LOGO_IMG, "PNG", marginX, 15, 14, 14); } catch { /* ignore */ }
  }
  doc.setTextColor(31, 41, 38);
  doc.setFont("times", "bold"); doc.setFontSize(15);
  doc.text("EL VIAJERO INQUIETO", marginX + 18, 21);
  doc.setFont("helvetica", "normal"); doc.setFontSize(9);
  doc.setTextColor(91, 104, 95);
  doc.text("Tu aliado al viajar", marginX + 18, 26);
  doc.setDrawColor(31, 41, 38); doc.setLineWidth(0.6);
  doc.line(marginX, 33, pageW - marginX, 33);
}

/** Fila "etiqueta / valor" con línea separadora debajo. Devuelve la nueva posición Y. */
function drawRow(doc: jsPDF, marginX: number, pageW: number, y: number, label: string, value: string): number {
  doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(91, 104, 95);
  doc.text(label, marginX, y);
  doc.setFont("helvetica", "normal"); doc.setTextColor(31, 41, 38);
  const lines: string[] = doc.splitTextToSize(String(value || "—"), pageW - marginX * 2 - 55);
  doc.text(lines, marginX + 55, y);
  y += 6.2 * Math.max(1, lines.length);
  doc.setDrawColor(237, 235, 227); doc.line(marginX, y - 2.5, pageW - marginX, y - 2.5);
  return y + 4;
}

/** Bloque "De / Para": nombre en grande + líneas de detalle. Devuelve la nueva posición Y. */
function drawPartyBlock(doc: jsPDF, x: number, w: number, tag: string, name: string | undefined, lines: string[], yStart: number): number {
  let ly = yStart;
  doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(138, 149, 142);
  doc.text(String(tag).toUpperCase(), x, ly);
  ly += 5.2;
  doc.setFont("times", "bold"); doc.setFontSize(11.5); doc.setTextColor(31, 41, 38);
  const nameLines: string[] = doc.splitTextToSize(name || "—", w);
  doc.text(nameLines, x, ly);
  ly += 4.8 * nameLines.length;
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(91, 104, 95);
  lines.forEach(function (line) {
    const wrapped: string[] = doc.splitTextToSize(line, w);
    doc.text(wrapped, x, ly);
    ly += 4.2 * wrapped.length;
  });
  return ly;
}

/** Tira de pequeñas ilustraciones de marca (sin color) + frase de cierre. Devuelve la nueva posición Y. */
function drawIllustrationRow(doc: jsPDF, marginX: number, pageW: number, startY: number): number {
  let y = startY;
  y += 3;
  doc.setDrawColor(185, 194, 180); doc.setLineWidth(0.25);
  doc.line(marginX, y, pageW - marginX, y);
  y += 6;
  const n = 10, r = 3.6;
  doc.setDrawColor(150, 161, 146); doc.setLineWidth(0.22); doc.setFillColor(150, 161, 146);
  const usableW = pageW - marginX * 2;
  const slotW = usableW / n;
  const cy = y + r;

  function arcPts(cx0: number, cy0: number, rx: number, ry: number, startDeg: number, endDeg: number, steps: number): Pt[] {
    const pts: Pt[] = []; const s = startDeg * Math.PI / 180, e = endDeg * Math.PI / 180;
    for (let i = 0; i <= steps; i++) { const t = s + (e - s) * (i / steps); pts.push([cx0 + rx * Math.cos(t), cy0 + ry * Math.sin(t)]); }
    return pts;
  }
  function sinePts(x0: number, x1: number, yBase: number, amp: number, cycles: number, steps: number): Pt[] {
    const pts: Pt[] = [];
    for (let i = 0; i <= steps; i++) { const t = i / steps; pts.push([x0 + (x1 - x0) * t, yBase + amp * Math.sin(t * Math.PI * 2 * cycles)]); }
    return pts;
  }
  function poly(pts: Pt[], close: boolean) {
    if (pts.length < 2) return;
    const segs: Pt[] = [];
    for (let i = 1; i < pts.length; i++) { segs.push([pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]]); }
    doc.lines(segs, pts[0][0], pts[0][1], [1, 1], "S", !!close);
  }
  function dot(x0: number, y0: number, rr: number) { doc.circle(x0, y0, rr, "F"); }
  function bez(x0: number, y0: number, dx1: number, dy1: number, dx2: number, dy2: number, dx3: number, dy3: number) {
    doc.lines([[dx1, dy1, dx2, dy2, dx3, dy3]], x0, y0, [1, 1], "S", false);
  }

  for (let i = 0; i < n; i++) {
    const cx = marginX + slotW * i + slotW / 2;
    switch (i) {
      case 0: { /* ballena: cuerpo romo, cola (fluke) levantada, chorro triple, ojo */
        poly(arcPts(cx - r * 0.55, cy + r * 0.1, r * 0.95, r * 0.5, 0, 360, 24), true);
        poly([[cx + r * 0.25, cy - r * 0.05], [cx + r * 0.15, cy - r * 0.85], [cx + r * 0.5, cy - r * 0.5], [cx + r * 0.85, cy - r * 0.95], [cx + r * 0.65, cy - r * 0.15]], true);
        poly([[cx - r * 0.75, cy - r * 0.4], [cx - r * 0.68, cy - r * 0.75], [cx - r * 0.56, cy - r * 0.95]], false);
        poly([[cx - r * 0.58, cy - r * 0.42], [cx - r * 0.56, cy - r * 0.72]], false);
        poly([[cx - r * 0.42, cy - r * 0.38], [cx - r * 0.34, cy - r * 0.65]], false);
        dot(cx - r * 1.2, cy + r * 0.02, r * 0.09);
        break; }
      case 1: { /* costa caribe: palma con 5 hojas + cocos + ola */
        const topX = cx - r * 0.1, topY = cy - r * 0.3;
        poly([[cx, cy + r * 1.3], [topX, topY]], false);
        bez(topX, topY, -r * 0.3, -r * 0.5, -r * 0.85, -r * 0.45, -r * 1.1, r * 0.05);
        bez(topX, topY, -r * 0.1, -r * 0.55, -r * 0.35, -r * 0.95, -r * 0.55, -r * 1.1);
        bez(topX, topY, r * 0.35, -r * 0.5, r * 0.85, -r * 0.4, r * 1.1, r * 0.1);
        bez(topX, topY, r * 0.15, -r * 0.55, r * 0.4, -r * 0.95, r * 0.6, -r * 1.1);
        bez(topX, topY, -r * 0.1, -r * 0.55, r * 0.1, -r * 0.9, -r * 0.02, -r * 1.1);
        dot(topX - r * 0.12, topY + r * 0.22, r * 0.09);
        dot(topX + r * 0.12, topY + r * 0.24, r * 0.09);
        poly(sinePts(cx - r * 1.5, cx + r * 1.5, cy + r * 1.55, r * 0.18, 1.2, 16), false);
        break; }
      case 2: { /* bogotá: montaña, cruz, 2 edificios con ventanas */
        const peak = arcPts(cx - r * 0.2, cy + r * 0.75, r * 1.05, r * 1.1, 205, -25, 12);
        poly([[cx - r * 1.1, cy + r * 0.7], ...peak.slice(1)], false);
        poly([[cx - r * 0.2, cy - r * 0.35], [cx - r * 0.2, cy - r * 0.85]], false);
        poly([[cx - r * 0.38, cy - r * 0.62], [cx - r * 0.02, cy - r * 0.62]], false);
        doc.rect(cx + r * 0.5, cy + r * 0.1, r * 0.5, r * 0.65, "S");
        doc.rect(cx + r * 0.62, cy + r * 0.24, r * 0.1, r * 0.1, "S");
        doc.rect(cx + r * 0.62, cy + r * 0.44, r * 0.1, r * 0.1, "S");
        doc.rect(cx + r * 1.08, cy - r * 0.2, r * 0.42, r * 0.95, "S");
        doc.rect(cx + r * 1.18, cy - r * 0.04, r * 0.09, r * 0.09, "S");
        doc.rect(cx + r * 1.18, cy + r * 0.14, r * 0.09, r * 0.09, "S");
        doc.rect(cx + r * 1.32, cy - r * 0.04, r * 0.09, r * 0.09, "S");
        doc.rect(cx + r * 1.32, cy + r * 0.14, r * 0.09, r * 0.09, "S");
        break; }
      case 3: { /* amazonas: hoja alargada y puntiaguda, con nervaduras */
        const top = arcPts(cx, cy, r * 1.2, r * 0.72, 200, 340, 12);
        const bot = arcPts(cx, cy, r * 1.2, r * 0.72, 20, 160, 12);
        poly([...top, ...bot], true);
        poly([[cx - r * 1.05, cy + r * 0.32], [cx + r * 1.05, cy - r * 0.32]], false);
        poly([[cx - r * 0.45, cy + r * 0.02], [cx - r * 0.25, cy - r * 0.28]], false);
        poly([[cx - r * 0.1, cy - r * 0.12], [cx + r * 0.1, cy - r * 0.42]], false);
        poly([[cx + r * 0.35, cy - r * 0.25], [cx + r * 0.55, cy - r * 0.55]], false);
        poly([[cx - r * 0.3, cy + r * 0.2], [cx - r * 0.15, cy + r * 0.42]], false);
        poly([[cx + r * 0.2, cy + r * 0.05], [cx + r * 0.35, cy + r * 0.3]], false);
        break; }
      case 4: { /* internacional: globo + avioncito */
        doc.circle(cx - r * 0.15, cy, r * 0.85, "S");
        poly(arcPts(cx - r * 0.15, cy, r * 0.36, r * 0.85, 90, 270, 10), false);
        poly(arcPts(cx - r * 0.15, cy, r * 0.36, r * 0.85, -90, 90, 10), false);
        poly([[cx - r * 1.0, cy], [cx + r * 0.7, cy]], false);
        poly([[cx + r * 0.45, cy - r * 0.85], [cx + r * 1.35, cy - r * 0.45], [cx + r * 0.95, cy - r * 0.35], [cx + r * 1.05, cy - r * 0.05], [cx + r * 0.78, cy - r * 0.28], [cx + r * 0.45, cy - r * 0.85]], true);
        poly([[cx + r * 0.55, cy - r * 0.35], [cx + r * 0.15, cy - r * 0.15]], false);
        break; }
      case 5: { /* viaje: maleta con ruedas y etiqueta */
        doc.roundedRect(cx - r * 0.9, cy - r * 0.35, r * 1.8, r * 1.2, r * 0.16, r * 0.16, "S");
        poly(arcPts(cx, cy - r * 0.6, r * 0.4, r * 0.32, 200, -20, 8), false);
        poly([[cx - r * 0.9, cy + r * 0.2], [cx + r * 0.9, cy + r * 0.2]], false);
        poly([[cx - r * 0.9, cy - r * 0.05], [cx + r * 0.9, cy - r * 0.05]], false);
        doc.circle(cx - r * 0.55, cy + r * 0.95, r * 0.18, "S");
        doc.circle(cx + r * 0.55, cy + r * 0.95, r * 0.18, "S");
        poly([[cx + r * 0.35, cy - r * 0.35], [cx + r * 0.62, cy - r * 0.62], [cx + r * 0.78, cy - r * 0.5], [cx + r * 0.55, cy - r * 0.25]], true);
        break; }
      case 6: { /* playa: sombrilla + palo + ola + sol con rayos */
        poly(arcPts(cx - r * 0.1, cy + r * 0.05, r * 1.05, r * 1.0, 195, 345, 12), false);
        poly([[cx - r * 0.1, cy], [cx - r * 0.1, cy + r * 1.2]], false);
        poly(sinePts(cx - r * 0.9, cx + r * 0.9, cy + r * 1.25, r * 0.12, 1, 10), false);
        doc.circle(cx + r * 1.05, cy - r * 0.95, r * 0.26, "S");
        poly([[cx + r * 1.45, cy - r * 0.95], [cx + r * 1.62, cy - r * 0.95]], false);
        poly([[cx + r * 1.32, cy - r * 1.25], [cx + r * 1.44, cy - r * 1.4]], false);
        poly([[cx + r * 1.32, cy - r * 0.65], [cx + r * 1.44, cy - r * 0.5]], false);
        break; }
      case 7: { /* mar: olas + velero */
        poly(sinePts(cx - r * 1.15, cx + r * 1.15, cy + r * 0.15, r * 0.26, 1.3, 16), false);
        poly(sinePts(cx - r * 1.15, cx + r * 1.15, cy + r * 0.6, r * 0.26, 1.3, 16), false);
        poly([[cx - r * 0.3, cy - r * 0.15], [cx - r * 0.3, cy - r * 1.0], [cx + r * 0.35, cy - r * 0.15]], true);
        poly([[cx - r * 0.45, cy - r * 0.15], [cx + r * 0.5, cy - r * 0.15], [cx + r * 0.35, cy + r * 0.05], [cx - r * 0.3, cy + r * 0.05]], true);
        break; }
      case 8: { /* café: taza + asa + vapor + 2 granos */
        poly([[cx - r * 0.65, cy - r * 0.55], [cx - r * 0.55, cy + r * 0.65], [cx + r * 0.4, cy + r * 0.65], [cx + r * 0.5, cy - r * 0.55]], true);
        poly(arcPts(cx + r * 0.62, cy - r * 0.05, r * 0.28, r * 0.38, -85, 95, 8), false);
        poly(sinePts(cx - r * 0.35, cx - r * 0.1, cy - r * 0.85, r * 0.12, 1, 6), false);
        poly(sinePts(cx + r * 0.05, cx + r * 0.3, cy - r * 0.9, r * 0.12, 1, 6), false);
        poly(arcPts(cx - r * 1.0, cy + r * 0.85, r * 0.16, r * 0.22, 0, 360, 10), true);
        poly([[cx - r * 1.0, cy + r * 0.63], [cx - r * 1.0, cy + r * 1.07]], false);
        poly(arcPts(cx - r * 1.35, cy + r * 0.55, r * 0.14, r * 0.2, 0, 360, 10), true);
        break; }
      case 9: { /* finca: casa con ventana y puerta + árbol + cerca */
        poly([[cx - r * 0.8, cy + r * 0.1], [cx - r * 0.05, cy - r * 0.8], [cx + r * 0.7, cy + r * 0.1]], false);
        doc.rect(cx - r * 0.6, cy + r * 0.1, r * 1.3, r * 0.8, "S");
        doc.rect(cx - r * 0.15, cy + r * 0.38, r * 0.35, r * 0.52, "S");
        doc.rect(cx + r * 0.28, cy + r * 0.22, r * 0.2, r * 0.2, "S");
        poly([[cx + r * 1.15, cy - r * 0.15], [cx + r * 1.15, cy + r * 0.5]], false);
        doc.circle(cx + r * 1.15, cy - r * 0.5, r * 0.38, "S");
        poly([[cx - r * 1.45, cy + r * 0.62], [cx + r * 1.45, cy + r * 0.62]], false);
        poly([[cx - r * 1.45, cy + r * 0.82], [cx + r * 1.45, cy + r * 0.82]], false);
        poly([[cx - r * 1.3, cy + r * 0.45], [cx - r * 1.3, cy + r * 0.95]], false);
        poly([[cx - r * 0.75, cy + r * 0.45], [cx - r * 0.75, cy + r * 0.95]], false);
        break; }
    }
  }
  y += r * 2 + 6;
  doc.setFont("times", "italic"); doc.setFontSize(9); doc.setTextColor(138, 149, 142);
  doc.text("viajando lento, profundo y con sentido", pageW / 2, y, { align: "center" });
  y += 8;
  return y;
}

/** Footer de marca: nombre + RNT + recomendación de verificarlo. Común a todos los documentos. */
function drawBrandFooter(doc: jsPDF, marginX: number, pageW: number, pageH: number) {
  doc.setDrawColor(230, 230, 230); doc.line(marginX, pageH - 26, pageW - marginX, pageH - 26);
  const nameText = EMISOR.nombre, rntText = "RNT. " + EMISOR.rnt, footGap = 3;
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(138, 149, 142);
  const nameW = doc.getTextWidth(nameText);
  doc.setFont("helvetica", "bold"); doc.setFontSize(10);
  const rntW = doc.getTextWidth(rntText);
  const startX = pageW / 2 - (nameW + footGap + rntW) / 2;
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(138, 149, 142);
  doc.text(nameText, startX, pageH - 19);
  doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(31, 41, 38);
  doc.text(rntText, startX + nameW + footGap, pageH - 19);
  doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(160, 169, 156);
  doc.text("El Viajero Inquieto te recomienda siempre revisar que el RNT de tu agencia de viajes esté activo.", pageW / 2, pageH - 14, { align: "center" });
}

/**
 * Encabezado de la tabla de ítems (barra verde + columnas). Las columnas de valores van
 * alineadas a la derecha con suficiente separación entre sí para que montos grandes en
 * pesos colombianos no se encimen. Devuelve la nueva Y y las posiciones X de cada columna.
 */
function drawItemsTableHeader(doc: jsPDF, marginX: number, pageW: number, y: number) {
  const rightEdge = pageW - marginX;
  const cols = { cant: rightEdge - 74, valorUnit: rightEdge - 50, subtotal: rightEdge - 3, descMaxW: rightEdge - 74 - 10 - (marginX + 3) };
  doc.setFillColor(143, 168, 154); doc.rect(marginX, y, pageW - marginX * 2, 8, "F");
  doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(9);
  doc.text("Descripción", marginX + 3, y + 5.5);
  doc.text("Cant.", cols.cant, y + 5.5, { align: "right" });
  doc.text("Valor unit.", cols.valorUnit, y + 5.5, { align: "right" });
  doc.text("Subtotal", cols.subtotal, y + 5.5, { align: "right" });
  return { y: y + 8, cols };
}

/** Genera y descarga el PDF. Devuelve false si no se pudo cargar el generador. No modifica `d`. */
export async function generateDocPDF(rawD: DocData): Promise<boolean> {
  const d = cleanDocData(rawD);
  const type = d.type;
  const counter = docCounter(d);
  const typeLabel = docTypeLabelUpper(type);
  let mod: typeof import("jspdf");
  try {
    mod = await import("jspdf");
  } catch {
    return false;
  }
  const { jsPDF, GState } = mod;
  const LOGO_IMG = await loadLogo();

  const doc = new jsPDF({ unit: "mm", format: "letter" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const marginX = 20;
  drawBrandHeader(doc, LOGO_IMG, GState, marginX, pageW, pageH);

  let y = 47;
  /** Si no cabe lo que sigue, pasa a una página nueva (con el membrete repetido) antes de dibujarlo. */
  function ensureSpace(needed: number) {
    if (y + needed > pageH - 30) {
      doc.addPage();
      drawBrandHeader(doc, LOGO_IMG, GState, marginX, pageW, pageH);
      y = 43;
    }
  }

  doc.setTextColor(62, 106, 111);
  doc.setFont("times", "bold"); doc.setFontSize(18);
  doc.text(typeLabel + " No. " + counter, marginX, y);
  doc.setTextColor(91, 104, 95); doc.setFont("helvetica", "normal"); doc.setFontSize(10);
  doc.text("Fecha: " + formatDateEs(d.fecha || DEMO_TODAY), pageW - marginX, y, { align: "right" });
  y += 10;
  doc.setDrawColor(233, 225, 210); doc.setLineWidth(0.3);
  doc.line(marginX, y, pageW - marginX, y);
  y += 8;

  if (type === "cotizacion") {
    doc.setFont("times", "italic"); doc.setFontSize(11); doc.setTextColor(95, 143, 149);
    const tagLines: string[] = doc.splitTextToSize("Tu viaje te espera — este es el plan que armamos para ti.", pageW - marginX * 2);
    doc.text(tagLines, marginX, y);
    y += 5.5 * tagLines.length + 4;
  }

  const colW = (pageW - marginX * 2 - 14) / 2;
  const leftX = marginX, rightX = marginX + colW + 14;
  const emisorLines = type === "cotizacion"
    ? [EMISOR.ciudad, "Cel: " + EMISOR.telefono, EMISOR.correo]
    : [EMISOR.titular, EMISOR.identificacion, EMISOR.direccion, EMISOR.telefono + " · " + EMISOR.correo];
  const clienteTagPdf = type === "pago" ? "Beneficiario" : type === "cobro" ? "Cobrar a" : "Cliente";
  const clienteExtra: string[] = [];
  if (d.clienteId) clienteExtra.push(d.clienteId);
  if (type === "cotizacion") {
    if (d.clienteCelular) clienteExtra.push("Cel: " + d.clienteCelular);
    if (d.clienteCorreo) clienteExtra.push(d.clienteCorreo);
    const dirCiudad = [d.clienteDireccion, d.clienteCiudad].filter(Boolean).join(", ");
    if (dirCiudad) clienteExtra.push(dirCiudad);
  }
  const partyStartY = y;
  const yAfterLeft = drawPartyBlock(doc, leftX, colW, "De", EMISOR.nombre, emisorLines, partyStartY);
  const yAfterRight = drawPartyBlock(doc, rightX, colW, clienteTagPdf, d.cliente, clienteExtra, partyStartY);
  y = Math.max(yAfterLeft, yAfterRight) + 4;
  doc.setDrawColor(237, 235, 227); doc.setLineWidth(0.3);
  doc.line(marginX, y, pageW - marginX, y);
  y += 8;

  function totalBanner(label: string, valueText: string) {
    const bannerH = 16;
    ensureSpace(bannerH + 8);
    doc.setFillColor(143, 168, 154);
    doc.roundedRect(marginX, y, pageW - marginX * 2, bannerH, 2, 2, "F");
    doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(8.5);
    doc.text(label, marginX + 8, y + 6.5);
    doc.setTextColor(255, 255, 255); doc.setFont("times", "bold"); doc.setFontSize(15);
    doc.text(valueText, pageW - marginX - 8, y + 11.5, { align: "right" });
    y += bannerH + 8;
  }

  if (type !== "cotizacion") {
    y = drawRow(doc, marginX, pageW, y, "Forma de pago:", d.formaPago || "Transferencia");
  }
  if (type === "cotizacion" && d.objeto) {
    doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(138, 149, 142);
    doc.text("ASUNTO", marginX, y);
    y += 5;
    doc.setFont("helvetica", "normal"); doc.setFontSize(9.5); doc.setTextColor(31, 41, 38);
    const objLines: string[] = doc.splitTextToSize(d.objeto, pageW - marginX * 2);
    doc.text(objLines, marginX, y);
    y += 5 * objLines.length + 6;
  }
  let { y: tableY, cols } = drawItemsTableHeader(doc, marginX, pageW, y);
  y = tableY;
  doc.setTextColor(31, 41, 38); doc.setFont("helvetica", "normal"); doc.setFontSize(9.5);
  let itemsTotal = 0;
  (d.items || []).forEach(function (it) {
    const sub = (it.qty || 0) * (it.price || 0); itemsTotal += sub;
    const descLines: string[] = doc.splitTextToSize(it.desc || "—", cols.descMaxW);
    const detailParts: string[] = [];
    if (it.adults) detailParts.push(it.adults + " adulto" + (it.adults === 1 ? "" : "s"));
    if (it.children) detailParts.push(it.children + " niño" + (it.children === 1 ? "" : "s"));
    if (it.nights) detailParts.push(it.nights + " noche" + (it.nights === 1 ? "" : "s"));
    if (it.days) detailParts.push(it.days + " día" + (it.days === 1 ? "" : "s"));
    const rowH = 6.2 * Math.max(1, descLines.length) + (type === "cotizacion" && detailParts.length ? 5 : 0) + 4;
    if (y + rowH > pageH - 30) {
      doc.addPage();
      drawBrandHeader(doc, LOGO_IMG, GState, marginX, pageW, pageH);
      y = 43;
      const redraw = drawItemsTableHeader(doc, marginX, pageW, y);
      y = redraw.y; cols = redraw.cols;
      doc.setTextColor(31, 41, 38); doc.setFont("helvetica", "normal"); doc.setFontSize(9.5);
    }
    doc.text(descLines, marginX + 3, y + 5);
    doc.text(String(it.qty || 0), cols.cant, y + 5, { align: "right" });
    doc.text(cop(it.price || 0), cols.valorUnit, y + 5, { align: "right" });
    doc.text(cop(sub), cols.subtotal, y + 5, { align: "right" });
    y += 6.2 * Math.max(1, descLines.length);
    if (type === "cotizacion" && detailParts.length) {
      doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.setTextColor(62, 106, 111);
      doc.text(detailParts.join("   ·   "), marginX + 3, y + 1.5);
      doc.setFont("helvetica", "normal"); doc.setFontSize(9.5); doc.setTextColor(31, 41, 38);
      y += 5;
    }
    doc.setDrawColor(237, 235, 227); doc.line(marginX, y - 1, pageW - marginX, y - 1);
    y += 3;
  });
  y += 3;
  totalBanner(type === "cotizacion" ? "VALOR DE TU VIAJE" : type === "pago" ? "VALOR PAGADO" : "VALOR A COBRAR", cop(itemsTotal));
  if (type === "cotizacion" && d.validoHasta) {
    const label = "Válida hasta el " + formatDateEs(d.validoHasta);
    ensureSpace(14);
    doc.setFont("helvetica", "bold"); doc.setFontSize(8.5);
    const tw = doc.getTextWidth(label) + 10;
    doc.setDrawColor(143, 168, 154); doc.setFillColor(233, 225, 210); doc.setLineWidth(0.3);
    doc.roundedRect(marginX, y, tw, 8, 4, 4, "FD");
    doc.setTextColor(31, 41, 38);
    doc.text(label, marginX + 5, y + 5.4);
    y += 14;
  }
  if (type !== "cotizacion") {
    doc.setFont("helvetica", "italic"); doc.setFontSize(9.5); doc.setTextColor(91, 104, 95);
    const wordsLines: string[] = doc.splitTextToSize("Son: " + copWords(itemsTotal) + ".", pageW - marginX * 2);
    ensureSpace(5 * wordsLines.length + 6);
    doc.text(wordsLines, marginX, y);
    y += 5 * wordsLines.length + 6;
  }

  if (d.observaciones) {
    doc.setFont("helvetica", "normal"); doc.setFontSize(9);
    const obsLines: string[] = doc.splitTextToSize(d.observaciones, pageW - marginX * 2);
    ensureSpace(5 + 5 * obsLines.length + 6);
    doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(138, 149, 142);
    doc.text("OBSERVACIONES", marginX, y);
    y += 5;
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(91, 104, 95);
    doc.text(obsLines, marginX, y);
    y += 5 * obsLines.length + 6;
  }

  ensureSpace(48);
  y = drawIllustrationRow(doc, marginX, pageW, y);

  /* Línea(s) de firma: cuenta de cobro solo la del emisor; cuenta de pago suma la del beneficiario (la cotización no lleva firma formal).
     La firma y el footer se reservan juntos: si se chequearan por separado, el footer podía quedar
     solo en una página nueva (o la firma sin el footer debajo), viéndose casi en blanco. */
  function signBlock(cx: number, signW: number, name: string, idLine: string) {
    doc.setDrawColor(31, 41, 38); doc.setLineWidth(0.3);
    doc.line(cx - signW / 2, y, cx + signW / 2, y);
    doc.setFont("times", "bold"); doc.setFontSize(10); doc.setTextColor(31, 41, 38);
    doc.text(name, cx, y + 5, { align: "center" });
    doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(91, 104, 95);
    doc.text(idLine, cx, y + 9.5, { align: "center" });
  }
  const signH = type === "cobro" || type === "pago" ? 30 : 0;
  ensureSpace(signH + 32);
  if (type === "cobro") {
    y += 8;
    signBlock(pageW / 2, 70, EMISOR.titular, EMISOR.identificacion);
  } else if (type === "pago") {
    y += 8;
    const signW = 70, gap = 10;
    signBlock(pageW / 2 - gap / 2 - signW / 2, signW, EMISOR.titular, EMISOR.identificacion);
    signBlock(pageW / 2 + gap / 2 + signW / 2, signW, d.cliente || "Beneficiario", d.clienteId || "C.C. / NIT");
  }

  drawBrandFooter(doc, marginX, pageW, pageH);

  const safeClient = (d.cliente || "cliente").replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "").slice(0, 30) || "cliente";
  const prefix = type === "cotizacion" ? "Cotizacion_" : type === "cobro" ? "CuentaDeCobro_" : "CuentaDePago_";
  doc.save(prefix + counter + "_" + safeClient + ".pdf");
  return true;
}

function nightsBetween(checkin: string, checkout: string): number {
  const a = new Date(checkin + "T00:00:00").getTime();
  const b = new Date(checkout + "T00:00:00").getTime();
  return Math.max(1, Math.round((b - a) / 86400000));
}

/** Comprobante de una reserva del calendario, con el mismo membrete que cotizaciones/cuentas. */
export async function generateBookingVoucherPDF(rawBooking: FincaBooking, finca: Listing | undefined): Promise<boolean> {
  const booking: FincaBooking = {
    ...rawBooking,
    guest: stripUnsupportedGlyphs(rawBooking.guest) || "",
    cedula: stripUnsupportedGlyphs(rawBooking.cedula) || "",
    phone: stripUnsupportedGlyphs(rawBooking.phone) || "",
    email: stripUnsupportedGlyphs(rawBooking.email) || "",
    payMethod: stripUnsupportedGlyphs(rawBooking.payMethod) || "",
  };
  let mod: typeof import("jspdf");
  try {
    mod = await import("jspdf");
  } catch {
    return false;
  }
  const { jsPDF, GState } = mod;
  const LOGO_IMG = await loadLogo();

  const doc = new jsPDF({ unit: "mm", format: "letter" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const marginX = 20;
  drawBrandHeader(doc, LOGO_IMG, GState, marginX, pageW, pageH);

  let y = 47;
  doc.setTextColor(62, 106, 111);
  doc.setFont("times", "bold"); doc.setFontSize(18);
  doc.text("COMPROBANTE DE RESERVA", marginX, y);
  doc.setTextColor(91, 104, 95); doc.setFont("helvetica", "normal"); doc.setFontSize(10);
  doc.text("Fecha de emisión: " + formatDateEs(DEMO_TODAY), pageW - marginX, y, { align: "right" });
  y += 6;
  doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(91, 104, 95);
  doc.text("Reserva No. " + String(booking.id).padStart(4, "0"), marginX, y);
  y += 8;
  doc.setDrawColor(233, 225, 210); doc.setLineWidth(0.3);
  doc.line(marginX, y, pageW - marginX, y);
  y += 8;

  const colW = (pageW - marginX * 2 - 14) / 2;
  const leftX = marginX, rightX = marginX + colW + 14;
  const emisorLines = [EMISOR.titular, EMISOR.identificacion, EMISOR.direccion, EMISOR.telefono + " · " + EMISOR.correo];
  const guestLines: string[] = [];
  if (booking.cedula) guestLines.push(booking.cedula);
  if (booking.phone) guestLines.push("Cel: " + booking.phone);
  if (booking.email) guestLines.push(booking.email);
  const partyStartY = y;
  const yAfterLeft = drawPartyBlock(doc, leftX, colW, "De", EMISOR.nombre, emisorLines, partyStartY);
  const yAfterRight = drawPartyBlock(doc, rightX, colW, "Huésped", booking.guest, guestLines, partyStartY);
  y = Math.max(yAfterLeft, yAfterRight) + 4;
  doc.setDrawColor(237, 235, 227); doc.setLineWidth(0.3);
  doc.line(marginX, y, pageW - marginX, y);
  y += 8;

  doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(138, 149, 142);
  doc.text("DETALLE DE LA RESERVA", marginX, y);
  y += 7;

  const fincaLabel = finca ? finca.name + (finca.town ? " — " + finca.town + ", " + finca.dept : "") : String(booking.fincaId);
  const adults = booking.adults as number | undefined;
  const children = booking.children as number | undefined;
  const guestsLabel = adults != null
    ? adults + " adulto(s)" + (children ? " · " + children + " niño(s)" : "")
    : booking.guests + " huésped(es)";
  y = drawRow(doc, marginX, pageW, y, "Finca:", fincaLabel);
  y = drawRow(doc, marginX, pageW, y, "Llegada:", formatDateEs(booking.checkin) + (booking.time ? " · " + booking.time : ""));
  y = drawRow(doc, marginX, pageW, y, "Salida:", formatDateEs(booking.checkout));
  y = drawRow(doc, marginX, pageW, y, "Noches:", String(nightsBetween(booking.checkin, booking.checkout)));
  y = drawRow(doc, marginX, pageW, y, "Huéspedes:", guestsLabel);
  y = drawRow(doc, marginX, pageW, y, "Forma de pago:", booking.payMethod || "Transferencia");
  y += 3;

  const bannerH = 16;
  doc.setFillColor(143, 168, 154);
  doc.roundedRect(marginX, y, pageW - marginX * 2, bannerH, 2, 2, "F");
  doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(8.5);
  doc.text("VALOR TOTAL", marginX + 8, y + 6.5);
  doc.setTextColor(255, 255, 255); doc.setFont("times", "bold"); doc.setFontSize(15);
  doc.text(cop(booking.total || 0), pageW - marginX - 8, y + 11.5, { align: "right" });
  y += bannerH + 8;

  y = drawRow(doc, marginX, pageW, y, "Abonado:", cop(booking.advance || 0));
  y = drawRow(doc, marginX, pageW, y, "Saldo pendiente:", cop(booking.balance || 0));

  y = drawIllustrationRow(doc, marginX, pageW, y);
  drawBrandFooter(doc, marginX, pageW, pageH);

  const safeGuest = (booking.guest || "huesped").replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "").slice(0, 30) || "huesped";
  doc.save("Comprobante_Reserva_" + String(booking.id).padStart(4, "0") + "_" + safeGuest + ".pdf");
  return true;
}

/** Itinerario día a día, con membrete liviano (sin RNT ni datos legales — no es un documento contable). */
export async function generateItinerarioPDF(rawData: ItinerarioData): Promise<boolean> {
  const data: ItinerarioData = {
    ...rawData,
    destino: stripUnsupportedGlyphs(rawData.destino),
    notas: stripUnsupportedGlyphs(rawData.notas),
    dias: rawData.dias.map((day) => ({
      title: stripUnsupportedGlyphs(day.title),
      activities: day.activities.map((a) => ({
        ...a,
        title: stripUnsupportedGlyphs(a.title) || "",
        desc: stripUnsupportedGlyphs(a.desc),
        place: stripUnsupportedGlyphs(a.place),
      })),
    })),
  };
  let mod: typeof import("jspdf");
  try {
    mod = await import("jspdf");
  } catch {
    return false;
  }
  const { jsPDF, GState } = mod;
  const LOGO_IMG = await loadLogo();

  const doc = new jsPDF({ unit: "mm", format: "letter" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const marginX = 20;
  const contentX = marginX + 28;
  const contentW = pageW - marginX - contentX;

  drawBrandHeader(doc, LOGO_IMG, GState, marginX, pageW, pageH);
  let y = 47;

  let prevDotY: number | null = null;
  function ensureSpace(needed: number) {
    if (y + needed > pageH - 26) {
      doc.addPage();
      drawBrandHeader(doc, LOGO_IMG, GState, marginX, pageW, pageH);
      y = 43;
      prevDotY = null;
    }
  }

  doc.setTextColor(62, 106, 111); doc.setFont("times", "bold"); doc.setFontSize(20);
  doc.text("ITINERARIO", marginX, y);
  y += 8;
  doc.setDrawColor(233, 225, 210); doc.setLineWidth(0.3);
  doc.line(marginX, y, pageW - marginX, y);
  y += 10;

  const totalDays = data.dias.length;
  const duracionLabel = totalDays + (totalDays === 1 ? " día" : " días")
    + (data.fechaInicio ? "  ·  " + formatDateEs(data.fechaInicio) + (totalDays > 1 ? " – " + formatDateEs(addDaysIso(data.fechaInicio, totalDays - 1)) : "") : "");
  const colGap = 14;
  const colW = (pageW - marginX * 2 - colGap) / 2;
  function infoCol(x: number, label: string, value: string): number {
    doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(138, 149, 142);
    doc.text(label.toUpperCase(), x, y);
    doc.setFont("times", "bold"); doc.setFontSize(11.5); doc.setTextColor(31, 41, 38);
    const lines: string[] = doc.splitTextToSize(value || "—", colW);
    doc.text(lines, x, y + 5.5);
    return 5.5 + 4.6 * lines.length;
  }
  const h1 = infoCol(marginX, "Destino", data.destino || "—");
  const h2 = infoCol(marginX + colW + colGap, "Duración", duracionLabel);
  y += Math.max(h1, h2) + 8;
  doc.setDrawColor(233, 225, 210); doc.line(marginX, y, pageW - marginX, y);
  y += 10;

  data.dias.forEach((day, di) => {
    ensureSpace(24);
    const dayDate = data.fechaInicio ? addDaysIso(data.fechaInicio, di) : null;
    const bandH = 11;
    doc.setFillColor(143, 168, 154);
    doc.roundedRect(marginX, y, pageW - marginX * 2, bandH, 2, 2, "F");
    doc.setTextColor(255, 255, 255); doc.setFont("times", "bold"); doc.setFontSize(12.5);
    doc.text("DÍA " + (di + 1), marginX + 7, y + 7.3);
    if (dayDate) {
      doc.setFont("helvetica", "normal"); doc.setFontSize(9);
      doc.text(formatDateEs(dayDate), pageW - marginX - 7, y + 7.3, { align: "right" });
    }
    y += bandH + 5;
    prevDotY = null;
    if (day.title) {
      ensureSpace(9);
      doc.setFont("times", "italic"); doc.setFontSize(11.5); doc.setTextColor(95, 143, 149);
      const dayTitleLines: string[] = doc.splitTextToSize(day.title, pageW - marginX * 2);
      doc.text(dayTitleLines, marginX, y + 4);
      y += 5 * dayTitleLines.length + 4;
    }

    if (!day.activities.length) {
      doc.setFont("helvetica", "italic"); doc.setFontSize(9.5); doc.setTextColor(138, 149, 142);
      doc.text("Sin actividades agregadas.", contentX, y + 3);
      y += 10;
    }
    day.activities.forEach((act) => {
      ensureSpace(26);
      const rowTop = y;
      const dotY = rowTop + 2.2;
      if (prevDotY !== null) {
        doc.setDrawColor(210, 216, 206); doc.setLineWidth(0.5);
        doc.line(marginX + 20, prevDotY + 1.6, marginX + 20, dotY - 1.6);
      }
      doc.setFillColor(62, 106, 111); doc.circle(marginX + 20, dotY, 1.5, "F");
      prevDotY = dotY;

      doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(31, 41, 38);
      doc.text(act.time || "—", marginX, rowTop + 3.6);

      const cat = categoryInfo(act.category);
      doc.setFont("helvetica", "bold"); doc.setFontSize(7);
      const chipLabel = cat.label.toUpperCase();
      const chipW = doc.getTextWidth(chipLabel) + 8, chipH = 5.2;
      doc.setFillColor(cat.chipBg[0], cat.chipBg[1], cat.chipBg[2]);
      doc.roundedRect(contentX, rowTop - 0.2, chipW, chipH, 2, 2, "F");
      doc.setTextColor(cat.chipFg[0], cat.chipFg[1], cat.chipFg[2]);
      doc.text(chipLabel, contentX + chipW / 2, rowTop + 3.4, { align: "center" });
      y = rowTop + 8.5;

      doc.setFont("times", "bold"); doc.setFontSize(12); doc.setTextColor(31, 41, 38);
      const titleLines: string[] = doc.splitTextToSize(act.title || "—", contentW);
      doc.text(titleLines, contentX, y);
      y += 4.8 * titleLines.length + 1;

      const metaParts: string[] = [];
      if (act.place) metaParts.push(act.place);
      if (act.desc) metaParts.push(act.desc);
      if (metaParts.length) {
        doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(91, 104, 95);
        const metaLines: string[] = doc.splitTextToSize(metaParts.join("  ·  "), contentW);
        doc.text(metaLines, contentX, y + 3.2);
        y += 4.3 * metaLines.length + 3;
      }
      y += 5;
    });
    y += 5;
  });

  if (data.notas) {
    ensureSpace(20);
    doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(138, 149, 142);
    doc.text("RECOMENDACIONES", marginX, y);
    y += 5;
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(91, 104, 95);
    const notasLines: string[] = doc.splitTextToSize(data.notas, pageW - marginX * 2);
    doc.text(notasLines, marginX, y);
    y += 5 * notasLines.length + 6;
  }

  /* Ilustración + línea de contacto deben quedar juntas: si se reservan por separado, la
     línea de contacto puede quedar sola en una página nueva, que se ve casi en blanco. */
  ensureSpace(48 + 14);
  y = drawIllustrationRow(doc, marginX, pageW, y);
  doc.setDrawColor(230, 230, 230); doc.line(marginX, pageH - 18, pageW - marginX, pageH - 18);
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(138, 149, 142);
  doc.text(EMISOR.telefono + "  ·  " + EMISOR.correo, pageW / 2, pageH - 12, { align: "center" });

  const safeDestino = (data.destino || "viaje").replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "").slice(0, 30) || "viaje";
  doc.save("Itinerario_" + safeDestino + (data.fechaInicio ? "_" + data.fechaInicio : "") + ".pdf");
  return true;
}
