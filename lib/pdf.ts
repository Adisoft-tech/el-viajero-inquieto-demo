// Port de generateDocPDF() del HTML original: arma la cotización / cuenta de cobro / cuenta de pago
// con jsPDF (importado dinámicamente para no cargarlo hasta que se descarga un documento).

import { DEMO_TODAY, EMISOR } from "./data";
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

/** Genera y descarga el PDF. Devuelve false si no se pudo cargar el generador. No modifica `d`. */
export async function generateDocPDF(d: DocData): Promise<boolean> {
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
  const logoReady = !!LOGO_IMG;

  if (logoReady && LOGO_IMG) {
    try {
      doc.saveGraphicsState();
      doc.setGState(new GState({ opacity: 0.07 }));
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

  let y = 47;
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

  function row(label: string, value: string) {
    doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(91, 104, 95);
    doc.text(label, marginX, y);
    doc.setFont("helvetica", "normal"); doc.setTextColor(31, 41, 38);
    const lines: string[] = doc.splitTextToSize(String(value || "—"), pageW - marginX * 2 - 55);
    doc.text(lines, marginX + 55, y);
    y += 6.2 * Math.max(1, lines.length);
    doc.setDrawColor(237, 235, 227); doc.line(marginX, y - 2.5, pageW - marginX, y - 2.5);
    y += 4;
  }

  /* Bloque "De / Para": emisor y cliente en paralelo, como en cotizaciones y facturas reales */
  function partyBlock(x: number, w: number, tag: string, name: string | undefined, lines: string[], yStart: number): number {
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
  const yAfterLeft = partyBlock(leftX, colW, "De", EMISOR.nombre, emisorLines, partyStartY);
  const yAfterRight = partyBlock(rightX, colW, clienteTagPdf, d.cliente, clienteExtra, partyStartY);
  y = Math.max(yAfterLeft, yAfterRight) + 4;
  doc.setDrawColor(237, 235, 227); doc.setLineWidth(0.3);
  doc.line(marginX, y, pageW - marginX, y);
  y += 8;

  function totalBanner(label: string, valueText: string) {
    const bannerH = 16;
    doc.setFillColor(143, 168, 154);
    doc.roundedRect(marginX, y, pageW - marginX * 2, bannerH, 2, 2, "F");
    doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(8.5);
    doc.text(label, marginX + 8, y + 6.5);
    doc.setTextColor(255, 255, 255); doc.setFont("times", "bold"); doc.setFontSize(15);
    doc.text(valueText, pageW - marginX - 8, y + 11.5, { align: "right" });
    y += bannerH + 8;
  }

  if (type !== "cotizacion") {
    row("Forma de pago:", d.formaPago || "Transferencia");
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
  doc.setFillColor(143, 168, 154); doc.rect(marginX, y, pageW - marginX * 2, 8, "F");
  doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(9);
  doc.text("Descripción", marginX + 3, y + 5.5);
  doc.text("Cant.", pageW - marginX - 58, y + 5.5);
  doc.text("Valor unit.", pageW - marginX - 40, y + 5.5);
  doc.text("Subtotal", pageW - marginX - 3, y + 5.5, { align: "right" });
  y += 8;
  doc.setTextColor(31, 41, 38); doc.setFont("helvetica", "normal"); doc.setFontSize(9.5);
  let itemsTotal = 0;
  (d.items || []).forEach(function (it) {
    const sub = (it.qty || 0) * (it.price || 0); itemsTotal += sub;
    const descLines: string[] = doc.splitTextToSize(it.desc || "—", pageW - marginX * 2 - 90);
    doc.text(descLines, marginX + 3, y + 5);
    doc.text(String(it.qty || 0), pageW - marginX - 58, y + 5);
    doc.text(cop(it.price || 0), pageW - marginX - 40, y + 5);
    doc.text(cop(sub), pageW - marginX - 3, y + 5, { align: "right" });
    y += 6.2 * Math.max(1, descLines.length);
    const detailParts: string[] = [];
    if (it.adults) detailParts.push(it.adults + " adulto" + (it.adults === 1 ? "" : "s"));
    if (it.children) detailParts.push(it.children + " niño" + (it.children === 1 ? "" : "s"));
    if (it.nights) detailParts.push(it.nights + " noche" + (it.nights === 1 ? "" : "s"));
    if (it.days) detailParts.push(it.days + " día" + (it.days === 1 ? "" : "s"));
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
    doc.text(wordsLines, marginX, y);
    y += 5 * wordsLines.length + 6;
  }

  if (d.observaciones) {
    doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(138, 149, 142);
    doc.text("OBSERVACIONES", marginX, y);
    y += 5;
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(91, 104, 95);
    const obsLines: string[] = doc.splitTextToSize(d.observaciones, pageW - marginX * 2);
    doc.text(obsLines, marginX, y);
    y += 5 * obsLines.length + 6;
  }

  /* Tira de pequeñas ilustraciones de marca (sin color) + frase de cierre */
  y += 3;
  doc.setDrawColor(185, 194, 180); doc.setLineWidth(0.25);
  doc.line(marginX, y, pageW - marginX, y);
  y += 6;
  (function drawIllustrationRow() {
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
  })();

  /* Línea(s) de firma: cuenta de cobro solo la del emisor; cuenta de pago suma la del beneficiario (la cotización no lleva firma formal) */
  function signBlock(cx: number, signW: number, name: string, idLine: string) {
    doc.setDrawColor(31, 41, 38); doc.setLineWidth(0.3);
    doc.line(cx - signW / 2, y, cx + signW / 2, y);
    doc.setFont("times", "bold"); doc.setFontSize(10); doc.setTextColor(31, 41, 38);
    doc.text(name, cx, y + 5, { align: "center" });
    doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(91, 104, 95);
    doc.text(idLine, cx, y + 9.5, { align: "center" });
  }
  if (type === "cobro") {
    y += 8;
    signBlock(pageW / 2, 70, EMISOR.titular, EMISOR.identificacion);
  } else if (type === "pago") {
    y += 8;
    const signW = 70, gap = 10;
    signBlock(pageW / 2 - gap / 2 - signW / 2, signW, EMISOR.titular, EMISOR.identificacion);
    signBlock(pageW / 2 + gap / 2 + signW / 2, signW, d.cliente || "Beneficiario", d.clienteId || "C.C. / NIT");
  }

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

  const safeClient = (d.cliente || "cliente").replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "").slice(0, 30) || "cliente";
  const prefix = type === "cotizacion" ? "Cotizacion_" : type === "cobro" ? "CuentaDeCobro_" : "CuentaDePago_";
  doc.save(prefix + counter + "_" + safeClient + ".pdf");
  return true;
}
