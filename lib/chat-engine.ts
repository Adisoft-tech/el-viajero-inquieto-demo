// Motor del chat público (reglas locales, sin IA ni backend).
// Todo lo que responde sale del catálogo/reseñas que se le pasan como parámetro.

import { REVIEWS, type Category, type Listing } from "./data";
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
  { cat: "alojamientos", words: ["finca", "fincas", "cabaña", "cabanas", "cabañas", "cabana", "alojamiento", "alojamientos", "hospedaje", "hotel", "dormir", "quedarme", "quedar", "noche", "hospedarme", "casa"] },
  { cat: "parques", words: ["parque", "parques", "panaca", "tematico", "temático", "entrada", "entradas"] },
  { cat: "tours", words: ["tour", "tours", "actividad", "actividades", "excursion", "excursión", "paseo", "paseos", "recorrido", "plan", "planes", "kayak", "aves"] },
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
function chatFormatListing(l: Listing): ChatListingResult {
  return { id: l.id, name: l.name, town: l.town, dept: l.dept, price: cop(l.price) + " / " + l.unit, rating: l.rating };
}

const CHAT_INTENTS: { test: RegExp; reply: () => ChatAnswer }[] = [
  { test: /^(hola|buenas|buenos dias|buenas tardes|buenas noches|hey|hi|ola)\b/, reply: () => ({
    text: "¡Hola! Puedo ayudarte a encontrar fincas, parques o tours en el eje cafetero, contarte sobre pagos o ponerte en contacto con nosotros.",
    chips: ["Fincas cerca a Manizales", "Parques para niños", "Tours de un día", "¿Cómo pago?"],
  }) },
  { test: /ayuda|que puedes hacer|qué puedes hacer|como funciona|cómo funcionas|que eres|qué eres/, reply: () => ({
    text: "Soy un asistente que busca directamente en el catálogo de El Viajero Inquieto (sin inteligencia artificial de por medio, solo leo los datos publicados en la página). Pregúntame por destino, tipo de experiencia, precio o calificación.",
    chips: ["Fincas en Quindío", "Lo más barato", "Mejor calificado"],
  }) },
  { test: /quienes son|quiénes son|sobre ustedes|mision|misión|vision|visión|empresa/, reply: () => ({
    text: "El Viajero Inquieto es una agencia de viajes colombiana enfocada en turismo familiar y experiencias con raíz local: fincas, cabañas, parques y tours en el eje cafetero. Creamos viajes memorables conectando a los viajeros con la riqueza cultural, natural y humana de cada destino.",
    chips: ["Ver Nosotros"],
  }) },
  { test: /contacto|telefono|teléfono|correo|email|whatsapp|hablar con alguien/, reply: () => ({
    text: "Puedes escribirnos a hola@elviajeroinquieto.co o al +57 300 000 0000. Estamos en Manizales, Caldas.",
    chips: [],
  }) },
  { test: /pago|pagar|tarjeta|pse|nequi|wompi|cuotas/, reply: () => ({
    text: "Aceptamos pago en línea con Wompi: tarjeta de crédito o débito, PSE y Nequi. El cobro se procesa de forma segura al confirmar tu reserva.",
    chips: [],
  }) },
  { test: /opinion|opinión|reseñ|resen|comentarios|que dicen|qué dicen|calificacion|calificación/, reply: () => {
    const txt = REVIEWS.slice(0, 2).map((r) => '"' + r.quote + '" — ' + r.name).join("  ·  ");
    return { text: "Esto dicen algunos viajeros: " + txt, chips: ["Ver todas las experiencias"] };
  } },
  { test: /gracias|thank/, reply: () => ({
    text: "¡Con gusto! ¿Buscas algo más?",
    chips: ["Fincas y Cabañas", "Parques Temáticos", "Tours"],
  }) },
];

/** Responde una pregunta buscando en `listings` (normalmente solo los visibles en el sitio). */
export function answerChat(raw: string, listings: Listing[]): ChatAnswer {
  const norm = normalizeText(raw);
  if (!norm) return { text: "Escribe tu pregunta, por ejemplo: \"¿qué finca hay cerca a Manizales?\"", chips: [] };

  for (const intent of CHAT_INTENTS) {
    if (intent.test.test(norm)) return intent.reply();
  }

  const townKeys = Array.from(new Set(listings.map((l) => normalizeText(l.town))));
  const deptKeys = Array.from(new Set(listings.map((l) => normalizeText(l.dept))));

  let results = listings.slice();
  const towns = findInText(norm, townKeys);
  const depts = findInText(norm, deptKeys);
  const hasCerca = /cerca/.test(norm);
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

  const priceMatch = norm.match(/(menos de|hasta|maximo|máximo|por debajo de)\s*\$?\s*([\d.,]+)\s*(mil)?/);
  if (priceMatch) {
    let num = parseFloat(priceMatch[2].replace(/[.,]/g, ""));
    if (priceMatch[3]) num *= 1000;
    if (!isNaN(num)) results = results.filter((l) => l.price <= num);
  }
  const wantsCheap = /barato|economic|econom|menor precio/.test(norm);
  const wantsTop = /mejor calificad|mejor valorad|mas recomendad|más recomendad|^top\b|mejor opcion|mejor opción/.test(norm);
  if (wantsCheap) results = results.slice().sort((a, b) => a.price - b.price);
  else if (wantsTop) results = results.slice().sort((a, b) => b.rating - a.rating);

  const capMatch = norm.match(/(\d+)\s*persona/);
  if (capMatch) {
    const n = parseInt(capMatch[1], 10);
    results = results.filter((l) => l.cat !== "alojamientos" || l.cap >= n);
  }

  if (!cat && !usedLocationFilter && !priceMatch && !wantsCheap && !wantsTop && !capMatch) {
    return { text: "No estoy segura de haber entendido. Puedo buscar por destino (ej. \"cerca a Manizales\"), tipo (fincas, parques, tours), precio o calificación.", chips: ["Fincas cerca a Manizales", "Parques para niños", "Lo más barato", "Mejor calificado"] };
  }
  if (!results.length) {
    return { text: "No encontré opciones exactas para eso. Tenemos fincas y cabañas, parques temáticos y tours en Quindío, Caldas y Risaralda.", chips: ["Fincas y Cabañas", "Parques Temáticos", "Tours"] };
  }
  const top = results.slice(0, 4);
  const label = cat ? catLabel(cat).toLowerCase() : "opciones";
  return { text: "Encontré " + top.length + " " + label + (top.length !== results.length ? " (de " + results.length + ")" : "") + " que podrían servirte:", listings: top.map(chatFormatListing) };
}
