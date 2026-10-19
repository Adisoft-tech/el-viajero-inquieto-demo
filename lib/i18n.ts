// Idiomas del sitio público (español e inglés).
// - Textos fijos de la interfaz: se escriben en español en el código y `EN` da su traducción (t("…")).
// - Textos editables del sitio: INITIAL_CONTENT_EN es la versión en inglés por defecto; el admin la puede editar.
// - Catálogo: cada listado puede traer su versión en inglés (nameEn, descEn…); si no, se usa LISTING_EN
//   (traducciones de los parques y experiencias originales) y, si tampoco hay, el texto en español.

import type { Listing, SiteContent } from "./data";
import { EN } from "./i18n-dict";

export type Lang = "es" | "en";

/** Precio en pesos colombianos con la moneda explícita: "$150.000 COP" en español y "$150,000 COP" en inglés. */
export function formatPrice(n: number, lang: Lang): string {
  return "$" + Math.round(n).toLocaleString(lang === "en" ? "en-US" : "es-CO") + " COP";
}
export const LANG_KEY = "vi_lang";

/** `quiet`: para textos que vienen de datos (ej. una categoría escrita por el admin), sin aviso si no hay traducción. */
export function translate(lang: Lang, s: string, quiet = false): string {
  if (lang === "es") return s;
  const out = EN[s];
  if (out === undefined && !quiet && process.env.NODE_ENV !== "production") console.warn("[i18n] falta traducción:", JSON.stringify(s));
  return out ?? s;
}

/** Textos editables en inglés por defecto. Las claves que no están aquí (RNT, teléfono, enlaces) no cambian con el idioma. */
export const INITIAL_CONTENT_EN: SiteContent = {
  heroEyebrow: "Travel agency · Colombia",
  heroTitle: "Colombia, experienced <em>up close</em>",
  heroLede: "Farms that become a refuge, routes that spark curiosity and destinations lived with emotion. Book directly with the people who know every path.",
  rntLabel: "Active National Tourism Registry",
  heroTripsTitle: "Scheduled trips 2027",
  heroTripsText: "Fixed-date departures with a guide and everything taken care of. Save your spot early.",
  catSectionTitle: "Three ways to explore the Coffee Region",
  catAlojTitle: "Farms & Cabins",
  catAlojDesc: "Coffee estates, mountain cabins and retreats with real hosts.",
  catParquesTitle: "Theme Parks",
  catParquesDesc: "Coffee, farm life and nature in the region's most visited parks.",
  catToursTitle: "Experiences",
  catToursDesc: "Hikes, kayaking, birdwatching and guided day trips.",
  featuredTitle: "What our travelers book the most",
  trustTitle: "An attentive host, not just another storefront",
  trust1Title: "Book directly on WhatsApp",
  trust1Desc: "Arrange dates and payment directly with our team, with no middlemen.",
  trust2Title: "Real hosts",
  trust2Desc: "Every farm and tour is run by local people, not an anonymous middleman.",
  trust3Title: "Local curation",
  trust3Desc: "We choose every experience for its quality, not for the commission.",
  trust4Title: "Human support",
  trust4Desc: "Before, during and after your trip, someone actually answers.",
  reviewsTitle: "Voices of those who have traveled with us",
  aboutEyebrow: "Our essence",
  aboutTitle: "The luxury of feeling at home",
  aboutText: "We create personalized, memorable travel experiences in Colombia, responsibly connecting travelers with the cultural, natural and human richness of each destination. Traveling together: the experience begins before you arrive and lives on in your memory.",
  nosEyebrow: "Our essence",
  nosName: "TRAVEL AGENCY",
  nosMotto: "Traveling slowly, deeply and with meaning.",
  nosMissionTitle: "Mission",
  nosMission: "At El Viajero Inquieto Travel Agency we create and accompany travel experiences that connect people with places, their cultures and their communities.\n\nWe design meaningful trips that combine tourism, education and learning experiences, so that children, young people, families and travelers can discover, learn, enjoy and better understand the country we live in.\n\nWe work with closeness, transparency and responsibility, making sure every trip creates value not only for the traveler, but also for the places and people who welcome us.\n\nBecause we believe travel can teach us, transform us and also transform the places we visit for the better.",
  nosVisionTitle: "Vision",
  nosVision: "We want El Viajero Inquieto to be a travel agency recognized in Colombia for its human and responsible way of doing tourism, growing without losing our essence and bringing more and more people to discover the country and the world.\n\nWe aspire to keep building experiences that leave a mark, especially through our educational programs with schools and in the communities we visit.\n\nOver the years, we hope to return to those places and find people, families and communities that have moved forward, grown and found new opportunities, feeling that our presence once brought something positive to their lives.",
  nosPurposeTitle: "Our purpose",
  nosPurpose: "To travel in order to discover, learn, connect and leave something good along the way.\n\nBecause for us, the true value of a trip doesn't end when we return home.\n\nSometimes, the most beautiful thing is coming back and discovering that something has changed.",
  contactEyebrow: "Contact",
  contactTitle: "Let's talk about your next trip",
  whatsappMessage: "Hi! I'm interested in an experience with El Viajero Inquieto",
  socialTitle: "Follow us",
  footerTagline: "Family travel, farm stays and experiences with Colombian roots, in the Coffee Region and abroad.",
};
export const TRANSLATABLE_KEYS = Object.keys(INITIAL_CONTENT_EN);

/** Contenido del sitio en el idioma pedido: en inglés, lo que el admin escribió, si no la traducción por defecto. */
export function contentFor(lang: Lang, es: SiteContent, en: SiteContent): SiteContent {
  if (lang === "es") return es;
  const out: SiteContent = { ...es };
  for (const k of TRANSLATABLE_KEYS) out[k] = (en[k] || "").trim() || INITIAL_CONTENT_EN[k];
  return out;
}

type ListingText = { name?: string; desc: string; highlights: string[]; tags: string[]; duration?: string };

/** Traducciones de los parques (Triviantes) y experiencias originales. */
export const LISTING_EN: Record<string, ListingText> = {
  "acuario-mundo-marino": { name: "Mundo Marino Aquarium", desc: "Located in Santa Marta, a place where you can visit 25 aquariums, 2 mega aquariums and other exhibits featuring more than 150 species.", highlights: ["Tour with more than 150 marine species", "QR code, skip-the-line entry", "Free changes up to 72h before", "El Rodadero, right by the sea"], tags: ["Marine life", "By the sea"] },
  "aviario-nacional": { name: "National Aviary of Colombia", desc: "Located on Barú Island in Cartagena, home to 135 native bird species, 15 exotic species and 1,700 birds in Colombia's largest aviary.", highlights: ["Colombia's largest aviary", "Fast entry with QR code", "Free changes up to 48h before", "Guided tour included"], tags: ["135 bird species", "Barú Island"] },
  "bioparque-ukumari": { desc: "Set off on a wild journey through bioregions that recreate natural habitats. Meet more than 90 animal species in an educational, sustainable setting that promotes conservation.", highlights: ["Self-guided tour of about 3 hours", "More than 90 animal species", "QR code, skip-the-line entry", "Pereira – Cerritos road"], tags: ["Bioregions", "90+ species"], duration: "~3 hours" },
  "caribe-aventura": { desc: "Water and theme park in Piojó (Atlántico) inspired by the culture and landscapes of the Colombian Caribbean: slides, wave pools, lazy rivers and replicas of iconic places like the Sierra Nevada and the Totumo Volcano.", highlights: ["Unlimited access to all rides", "Free Wi-Fi in the park", "30 min from Cartagena, 45 from Barranquilla", "Free changes up to 72h before"], tags: ["Water park", "Wave pools"] },
  "catedral-de-sal": { name: "Salt Cathedral", desc: "Live an unforgettable experience 180 meters underground in Colombia's No. 1 wonder: 3D short film, light show, the Mirror of Water lake and projection mapping included.", highlights: ["Guide or audio guide included", "Light show and projection mapping", "Access to the Mirror of Water lake", "Free changes up to 2 days before"], tags: ["Colombia's No. 1 wonder", "180 m underground"] },
  "kanaloa": { desc: "Enjoy a unique adventure at Kanaloa Park, the perfect place for water fun, nature and unforgettable activities in Antioquia.", highlights: ["More than 7 water attractions", "Same price as at the ticket office", "Free changes up to 48h before", "7+ payment methods available"], tags: ["Water park", "7+ attractions"] },
  "laberinto-mil-caminos": { name: "Mil Caminos Maze", desc: "Explore one of the largest natural mazes in Latin America, with 8,300 m² and 24,000 shrubs. A unique experience of adventure, introspection and connection with nature.", highlights: ["One of Latin America's largest natural mazes", "Vereda Morelia Alta, Quimbaya", "Free changes up to 48h before", "General admission for all ages"], tags: ["8,300 m²", "24,000 shrubs"] },
  "las-bailarinas": { desc: "Las Bailarinas Country Hotel and Water Park is the perfect place to relax, have fun in its pools and slides, and enjoy unique adventures surrounded by nature.", highlights: ["Pools and slides in the middle of nature", "Children under 5 enter free", "Free changes up to 72h before", "Coffee Region"], tags: ["Water park", "Country hotel"] },
  "la-vida-bella": { desc: "Scenic viewpoint park in the Cocora Valley with more than 20 photogenic spots (viewpoints, an upside-down house, swings, giant nests, jeep displays) to capture spectacular photos of the landscape.", highlights: ["Upside-down house and viewpoints", "20+ photogenic spots", "First entrance to the Cocora Valley", "QR code, skip-the-line entry"], tags: ["Cocora Valley", "20+ photo spots"] },
  "mina-de-sal-nemocon": { name: "Nemocón Salt Mine", desc: "Discover a magical world 80 meters underground, exploring tunnels and salt formations with more than 500 years of history.", highlights: ["Unique salt tunnels and formations", "500+ years of history", "Free changes up to 48h before", "Guided tour"], tags: ["80 m underground", "500+ years of history"] },
  "mundo-aventura": { desc: "Mundo Aventura is the perfect place in Bogotá for incredible thrills, with rides, roller coasters, shows and adventures for every taste.", highlights: ["Gold Pass: 33 rides", "Skip the ticket line", "Free cancellation", "Live shows"], tags: ["Roller coasters", "33 rides"] },
  "parque-los-arrieros": { name: "Los Arrieros Park", desc: "Immerse yourself in muleteer culture with live shows, folk dances and interactive activities. A day full of tradition, humor and learning in the Coffee Region.", highlights: ["Live dance and mountain-humor shows", "Km 3 Montenegro road, Quimbaya", "10% off the official ticket", "Option with lunch included"], tags: ["Muleteer culture", "Folk shows"] },
  "panaca": { name: "Panaca Park", desc: "Experience farm culture at the largest theme park in Latin America. Interact with animals, enjoy live shows and learn about the Colombian countryside.", highlights: ["More than 4,500 animals", "Live shows included", "Km 7 Kerman road, Quimbaya", "10% off the passport"], tags: ["Agricultural park", "4,500+ animals"] },
  "parque-quimbayas": { name: "Quimbayas Park", desc: "A journey full of history, culture and natural beauty in the heart of the Coffee Region. Pools, green areas, viewpoints and a farm where you can interact with the animals.", highlights: ["Day or night pass available", "Interactive farm included", "Road to Naranjal, Km 7, Quimbaya", "Lodging options"], tags: ["Pools and green areas", "Interactive farm"] },
  "recuca": { name: "Recuca Park", desc: "Visit Recuca (Coffee Culture Tour), the experience that turns you into a coffee grower for a day. A tour full of laughter, flavor and tradition in the heart of Quindío.", highlights: ["The whole coffee process, from seed to cup", "Coffee grower or chapolera costume included", "Folk shows full of humor and tradition", "Cacao tour available"], tags: ["Guided tasting", "Coffee farm"] },
  "playa-hawai": { desc: "Playa Hawái is the ideal water park near Bogotá to enjoy pools, slides and nature. An unforgettable day at the largest pool-beach in Colombia.", highlights: ["Colombia's largest pool-beach", "Same price as at the ticket office", "Children under 4 enter free", "Free changes up to 48h before"], tags: ["Colombia's largest pool-beach", "Water park"] },
  "qinti": { desc: "Known for its house built completely upside down and other creative, interactive spaces that challenge perception and offer unique visual experiences.", highlights: ["Quindío's No. 1 upside-down house", "Hammock and spider-web station", "1h20 from Armenia", "QR code, skip-the-line entry"], tags: ["Upside-down house", "Viewpoints and trails"] },
  "recinto-del-pensamiento": { desc: "Connect with nature in a cloud forest through ecological trails, bird, butterfly and orchid watching, aromatic gardens and viewpoints.", highlights: ["Butterfly garden and hummingbird house", "About 2.5-hour tour", "Free parking", "Free changes up to 72h before"], tags: ["Cloud forest", "Butterfly garden"], duration: "~2.5 hours" },
  "san-vicente-termal": { name: "San Vicente Thermal Reserve", desc: "Live a unique experience at San Vicente Thermal Reserve. Relax in Colombia's most natural hot springs, where water, nature and tranquility come together.", highlights: ["Colombia's most natural hot springs", "Plans with food and transport available", "Open every day until 11 p.m.", "Km 17 Vereda Potreros"], tags: ["Natural hot springs", "Wellness"] },
  "termales-santa-rosa": { name: "Santa Rosa de Cabal Hot Springs", desc: "A natural paradise in the Coffee Region where you can relax in hot springs next to a spectacular waterfall. Ideal for resting and recharging.", highlights: ["Hot springs next to a natural waterfall", "Several passes: thermal, nature, energy", "Lodging quotes available", "Ideal for couples or families"], tags: ["Natural waterfall", "Hot springs"] },
  "zoologico-cali": { name: "Cali Zoo", desc: "Visit one of Latin America's leading zoos and meet more than 2,500 animals from 200 different species. A unique experience to connect with wildlife.", highlights: ["More than 200 animal species", "Online purchase with no hidden fees", "QR code, skip-the-line entry", "Santa Teresita, Cali"], tags: ["200+ species", "No hidden fees"] },
  "ruta-cafe": { name: "Coffee Route: Salento + Cocora Valley", desc: "A full day combining the Cocora Valley, the town of Salento and a coffee tasting at a farm, with transport and guide included from the meeting point.", highlights: ["Round-trip transport", "Guided hike in the valley", "Coffee tasting at a farm", "Free time in Salento"], tags: ["Guided hike", "Tasting included"], duration: "Full day" },
  "tour-termales": { name: "Santa Rosa Hot Springs Tour", desc: "Transport, entry and free time at the Santa Rosa hot springs, with a stop at the Amor Eterno waterfall.", highlights: ["Door-to-door transport", "Hot springs entry included", "Waterfall stop", "Towels available on site"], tags: ["Transport included", "Entry included"], duration: "Half day" },
  "avistamiento-aves": { name: "Birdwatching · Bremen-La Popa Reserve", desc: "Early departure with a certified birding guide along Andean forest trails, binoculars included and groups of up to 8 people.", highlights: ["Certified birding guide", "Binoculars included", "Groups of up to 8 people", "Log of the day's species"], tags: ["Birding guide", "Small groups"], duration: "Half day (early morning)" },
  "manizales-nevado": { name: "Manizales City Tour + Nevado del Ruiz Viewpoint", desc: "A tour of Manizales' historic center and a climb to a viewpoint overlooking the Nevado del Ruiz volcano, weather permitting.", highlights: ["Local guide included", "All-day transport", "Photo stop at the volcano", "Optional traditional lunch"], tags: ["Transport included", "Local guide"], duration: "Full day" },
  "filandia-colina": { name: "Filandia + Colina Iluminada Sunset Tour", desc: "A walking tour of the heritage town of Filandia, ending at the Colina Iluminada just in time for sunset over the valley.", highlights: ["Guided walk through town", "Sunset viewpoint", "Free time for handicrafts", "Small groups"], tags: ["Sunset", "Heritage town"], duration: "Half day (afternoon)" },
  "kayak-quindio": { name: "Kayaking and Hiking · Quindío River", desc: "Kayaking down calm stretches of the Quindío River combined with a short hike and a country lunch included.", highlights: ["Gear and life jacket included", "Certified instructor", "Country lunch included", "Beginner friendly"], tags: ["Gear included", "Lunch included"], duration: "Full day" },
};

/** El listado en el idioma pedido (lo escrito por el admin manda sobre las traducciones por defecto). */
export function localizeListing(l: Listing, lang: Lang): Listing {
  if (lang === "es") return l;
  const seed = LISTING_EN[l.id];
  const pick = <T,>(own: T | undefined, fallback: T | undefined, es: T) =>
    own !== undefined && (Array.isArray(own) ? own.length > 0 : own !== "") ? own : fallback ?? es;
  return {
    ...l,
    name: pick(l.nameEn, seed?.name, l.name),
    desc: pick(l.descEn, seed?.desc, l.desc),
    highlights: pick(l.highlightsEn, seed?.highlights, l.highlights),
    tags: pick(l.tagsEn, seed?.tags, l.tags),
    duration: l.duration ? pick(l.durationEn, seed?.duration, l.duration) : l.duration,
    schedule: l.schedule ? pick(l.scheduleEn, undefined, l.schedule) : l.schedule,
  };
}
