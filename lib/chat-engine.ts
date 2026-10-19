// Motor del chat público (reglas locales, sin IA ni backend).
// Todo lo que responde sale del catálogo/reseñas que se le pasan como parámetro.

import { INITIAL_CONTENT, REVIEWS, type Category, type Listing, type Review, type SiteContent } from "./data";
import { catLabel, cop } from "./format";

export interface ChatListingResult { id: string; name: string; town: string; dept: string; price: string; rating: number }
export interface ChatAnswer { text: string; chips?: string[]; listings?: ChatListingResult[] }

const NEARBY_TOWNS: Record<string, string[]> = {
  "manizales": ["chinchina", "santa rosa de cabal"],
  "chinchina": ["manizales", "santa rosa de cabal"],
  "santa rosa de cabal": ["manizales", "chinchina", "filandia"],
  "filandia": ["salento", "circasia", "santa rosa de cabal"],
  "salento": ["filandia", "circasia"],
  "circasia": ["salento", "filandia", "montenegro", "quimbaya", "calarca"],
  "montenegro": ["circasia", "quimbaya"],
  "quimbaya": ["montenegro", "circasia", "alcala"],
  "alcala": ["quimbaya"],
  "calarca": ["circasia"],
};
const CHAT_CATS: { cat: Category; words: string[] }[] = [
  { cat: "alojamientos", words: ["finca", "fincas", "cabaña", "cabanas", "cabañas", "cabana", "alojamiento", "alojamientos", "hospedaje", "hotel", "dormir", "quedarme", "quedar", "noche", "hospedarme", "casa",
    "farm", "cabin", "lodging", "accommodation", "stay", "sleep", "night"] },
  { cat: "parques", words: ["parque", "parques", "panaca", "tematico", "temático", "entrada", "entradas", "park", "theme", "ticket", "zoo", "aquarium"] },
  { cat: "tours", words: ["tour", "tours", "experiencia", "experiencias", "actividad", "actividades", "excursion", "excursión", "paseo", "paseos", "recorrido", "plan", "planes", "kayak", "aves",
    "experience", "activit", "trip", "hike", "hiking", "bird"] },
];

export function normalizeText(s: unknown): string {
  return String(s || "").toLowerCase().normalize("NFD").replace(new RegExp("[\\u0300-\\u036f]", "g"), "").trim();
}
function findInText(text: string, keys: string[]): string[] {
  return keys.filter((k) => text.indexOf(k) > -1);
}
function expandNearby(towns: string[]): string[] {
  const set = new Set(towns);
  towns.forEach((t) => { (NEARBY_TOWNS[t] || []).forEach((n) => set.add(n)); });
  return Array.from(set);
}
function findCategory(text: string): Category | null {
  for (const c of CHAT_CATS) {
    if (c.words.some((w) => text.indexOf(w) > -1)) return c.cat;
  }
  return null;
}
function chatFormatListing(l: Listing, t: (s: string) => string, price: (n: number) => string): ChatListingResult {
  return { id: l.id, name: l.name, town: l.town, dept: l.dept, price: price(l.price) + " / " + t(l.unit), rating: l.rating };
}

/**
 * Contenido editable del sitio que el asistente cita en sus respuestas, y `t` para responder en el idioma del
 * visitante (los textos fijos se escriben en español y `t` los traduce; sin `t` responde en español).
 */
export interface ChatContext { content: SiteContent; reviews: Review[]; t?: (s: string) => string; price?: (n: number) => string }
const same = (s: string) => s;

const CHAT_INTENTS: { test: RegExp; reply: (ctx: ChatContext) => ChatAnswer }[] = [
  { test: /^(hola|buenas|buenos dias|buenas tardes|buenas noches|hey|hi|ola|hello|good morning|good afternoon|good evening)\b/, reply: ({ t = same }) => ({
    text: t("¡Hola! Puedo ayudarte a encontrar fincas, parques o experiencias en Colombia, contarte sobre pagos o ponerte en contacto con nosotros."),
    chips: ["Fincas cerca a Manizales", "Parques para niños", "Experiencias de un día", "¿Cómo pago?"],
  }) },
  { test: /ayuda|que puedes hacer|qué puedes hacer|como funciona|cómo funcionas|que eres|qué eres|help|what can you do|how does (this|it) work/, reply: ({ t = same }) => ({
    text: t("Soy un asistente que busca directamente en el catálogo de El Viajero Inquieto (sin inteligencia artificial de por medio, solo leo los datos publicados en la página). Pregúntame por destino, tipo de experiencia, precio o calificación."),
    chips: ["Fincas en Quindío", "Lo más barato", "Mejor calificado"],
  }) },
  { test: /quienes son|quiénes son|sobre ustedes|mision|misión|vision|visión|empresa|who are you|about (you|us)|mission|company/, reply: ({ t = same }) => ({
    text: t("El Viajero Inquieto es una agencia de viajes colombiana enfocada en turismo familiar y experiencias con raíz local: fincas, cabañas, parques y experiencias en toda Colombia. Creamos viajes memorables conectando a los viajeros con la riqueza cultural, natural y humana de cada destino."),
    chips: ["Ver Nosotros"],
  }) },
  { test: /contacto|telefono|teléfono|correo|email|whatsapp|hablar con alguien|contact|phone|call|talk to (someone|a person)/, reply: ({ content: c, t = same }) => ({
    text: t("Puedes escribirnos a") + " " + c.contactEmail + " " + t("o al") + " " + c.contactPhone + ". " + t("Estamos en") + " " + c.contactCity + ".",
    chips: [],
  }) },
  { test: /pago|pagar|tarjeta|pse|nequi|wompi|cuotas|\bpay|payment|card/, reply: ({ t = same }) => ({
    text: t("Las reservas se coordinan directamente con nuestro equipo por WhatsApp: ahí confirmamos fechas, disponibilidad y la forma de pago."),
    chips: [],
  }) },
  { test: /opinion|opinión|reseñ|resen|comentarios|que dicen|qué dicen|calificacion|calificación|review|testimonial|what do (people|travell?ers) say/, reply: ({ reviews, t = same }) => {
    const txt = reviews.slice(0, 2).map((r) => '"' + r.quote + '" — ' + r.name).join("  ·  ");
    return { text: t("Esto dicen algunos viajeros:") + " " + txt, chips: ["¿Qué dicen los viajeros?"] };
  } },
  { test: /gracias|thank/, reply: ({ t = same }) => ({
    text: t("¡Con gusto! ¿Buscas algo más?"),
    chips: ["Fincas y Cabañas", "Parques Temáticos", "Experiencias"],
  }) },
];

/** Responde una pregunta buscando en `listings` (normalmente solo los visibles en el sitio). */
export function answerChat(raw: string, listings: Listing[], ctx: ChatContext = { content: INITIAL_CONTENT, reviews: REVIEWS }): ChatAnswer {
  const t = ctx.t ?? same;
  const a = answerInSpanishTemplates(raw, listings, ctx, t);
  // Los textos fijos y las sugerencias se traducen aquí; los datos (nombres, citas) quedan como están.
  return { ...a, text: a.translated ? a.text : t(a.text), chips: a.chips?.map(t) };
}

function answerInSpanishTemplates(raw: string, listings: Listing[], ctx: ChatContext, t: (s: string) => string): ChatAnswer & { translated?: boolean } {
  const norm = normalizeText(raw);
  if (!norm) return { text: "Escribe tu pregunta, por ejemplo: \"¿qué finca hay cerca a Manizales?\"", chips: [] };

  for (const intent of CHAT_INTENTS) {
    if (intent.test.test(norm)) return { ...intent.reply(ctx), translated: true };
  }

  const townKeys = Array.from(new Set(listings.map((l) => normalizeText(l.town))));
  const deptKeys = Array.from(new Set(listings.map((l) => normalizeText(l.dept))));

  let results = listings.slice();
  const towns = findInText(norm, townKeys);
  const depts = findInText(norm, deptKeys);
  const hasCerca = /cerca|near/.test(norm);
  let usedLocationFilter = false;

  if (towns.length) {
    const townSet = hasCerca ? expandNearby(towns) : towns;
    results = results.filter((l) => townSet.indexOf(normalizeText(l.town)) > -1);
    usedLocationFilter = true;
  } else if (depts.length) {
    results = results.filter((l) => depts.indexOf(normalizeText(l.dept)) > -1);
    usedLocationFilter = true;
  }

  const cat = findCategory(norm);
  if (cat) results = results.filter((l) => l.cat === cat);

  const priceMatch = norm.match(/(menos de|hasta|maximo|máximo|por debajo de|under|less than|up to|below)\s*\$?\s*([\d.,]+)\s*(mil|k)?/);
  if (priceMatch) {
    let num = parseFloat(priceMatch[2].replace(/[.,]/g, ""));
    if (priceMatch[3]) num *= 1000;
    if (!isNaN(num)) results = results.filter((l) => l.price <= num);
  }
  const wantsCheap = /barato|economic|econom|menor precio|cheap|budget|lowest price/.test(norm);
  const wantsTop = /mejor calificad|mejor valorad|mas recomendad|más recomendad|^top\b|mejor opcion|mejor opción|top rated|best rated|highest rated|best/.test(norm);
  if (wantsCheap) results = results.slice().sort((a, b) => a.price - b.price);
  else if (wantsTop) results = results.slice().sort((a, b) => b.rating - a.rating);

  const capMatch = norm.match(/(\d+)\s*(persona|people|person|guest)/);
  if (capMatch) {
    const n = parseInt(capMatch[1], 10);
    results = results.filter((l) => l.cat !== "alojamientos" || l.cap >= n);
  }

  if (!cat && !usedLocationFilter && !priceMatch && !wantsCheap && !wantsTop && !capMatch) {
    return { text: "No estoy segura de haber entendido. Puedo buscar por destino (ej. \"cerca a Manizales\"), tipo (fincas, parques, experiencias), precio o calificación.", chips: ["Fincas cerca a Manizales", "Parques para niños", "Lo más barato", "Mejor calificado"] };
  }
  if (!results.length) {
    return { text: "No encontré opciones exactas para eso. Tenemos fincas y cabañas, parques temáticos y experiencias en distintos destinos de Colombia.", chips: ["Fincas y Cabañas", "Parques Temáticos", "Experiencias"] };
  }
  const top = results.slice(0, 4);
  const label = (cat ? t(catLabel(cat)) : t("opciones")).toLowerCase();
  return {
    text: t("Encontré") + " " + top.length + " " + label + (top.length !== results.length ? " (" + t("de") + " " + results.length + ")" : "") + " " + t("que podrían servirte:"),
    listings: top.map((l) => chatFormatListing(l, t, ctx.price ?? ((n) => cop(n) + " COP"))), translated: true,
  };
}
