import { ROUTES } from "@/lib/routes";
import { loadSiteData, visibleListings } from "@/lib/site-data";
import { abs } from "@/lib/seo";

// llms.txt (https://llmstxt.org): resumen en texto plano para asistentes de IA, armado con los mismos datos que
// publica el sitio. Solo hechos visibles en la página; nada que el administrador no haya escrito.
export const revalidate = 300;

const cop = (n: number) => n.toLocaleString("es-CO") + " COP";

export async function GET() {
  const [{ content: c }, listings] = await Promise.all([loadSiteData(), visibleListings()]);
  const by = (cat: string) => listings.filter((l) => l.cat === cat);
  // Los parques aliados se compran desde el catálogo (abre la página del parque), así que no llevan enlace propio.
  const line = (l: (typeof listings)[number]) =>
    `- ${l.name} (${l.town}, ${l.dept}): ${cop(l.price)} por ${l.unit}${l.duration ? ", " + l.duration.toLowerCase() : ""}.${l.externalUrl ? "" : " " + abs(ROUTES.listing(l.id))}`;
  const section = (title: string, cat: string, path: string) => {
    const items = by(cat);
    return items.length ? [`## ${title}`, `Catálogo completo: ${abs(path)}`, ...items.map(line), ""] : [];
  };
  const social = [c.instagramUrl && `- Instagram: ${c.instagramUrl.split("?")[0]}`, c.facebookUrl && `- Facebook: ${c.facebookUrl.split("?")[0]}`].filter(Boolean);

  const body = [
    "# El Viajero Inquieto",
    "",
    `> Agencia de viajes de ${c.contactCity ? c.contactCity + ", Colombia" : "Colombia"}${c.rnt ? `, con Registro Nacional de Turismo RNT ${c.rnt}` : ""}.`,
    "> Alquila fincas para disfrutar en familia, vende entradas a parques temáticos de Colombia y organiza",
    "> experiencias y viajes guiados. Las reservas se coordinan directamente por WhatsApp.",
    "",
    ...section("Fincas y cabañas (precio por noche)", "alojamientos", ROUTES.alojamientos),
    ...section("Entradas a parques temáticos (precio por persona)", "parques", ROUTES.parques),
    ...section("Experiencias y tours (precio por persona)", "tours", ROUTES.tours),
    "## Cómo reservar",
    `Escribe por WhatsApp${c.contactPhone ? " al " + c.contactPhone : ""} con la finca, el parque o la experiencia, la fecha y el número de personas. Fechas, disponibilidad y pago se confirman directamente con el equipo.`,
    "",
    "## Contacto",
    ...[c.contactPhone && `- Teléfono y WhatsApp: ${c.contactPhone}`, c.contactEmail && `- Correo: ${c.contactEmail}`, c.contactCity && `- Ciudad: ${c.contactCity}, Colombia`].filter(Boolean),
    ...social,
    "",
    "## Páginas clave",
    `- Inicio: ${abs("/")}`,
    `- Nosotros: ${abs(ROUTES.nosotros)}`,
    `- Contacto: ${abs(ROUTES.contacto)}`,
    `- Notiviajero (guías de viaje): ${abs(ROUTES.notiviajero)}`,
    "",
  ].join("\n");

  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
