import "server-only";

// Datos públicos del sitio leídos en el servidor, para que el HTML (lo que leen Google y los asistentes de IA)
// muestre lo mismo que ve el visitante: fincas de la base, catálogo, textos y reseñas guardados por el administrador.

import { cache } from "react";
import { getSiteConfig } from "@/lib/actions/cms";
import { listFincas } from "@/lib/actions/gestion";
import { INITIAL_CONTENT, INITIAL_LISTINGS, REVIEWS, type Listing, type SiteData } from "@/lib/data";

/** Una sola lectura por request (layout, metadata y página comparten el resultado). Si la base falla, sigue sin fincas. */
export const loadSiteData = cache(async (): Promise<SiteData> => {
  const [fincas, config] = await Promise.all([
    listFincas().catch((err) => { console.error("No se pudieron cargar las fincas:", err); return [] as Listing[]; }),
    getSiteConfig().catch((err) => { console.error("No se pudo cargar el contenido del sitio:", err); return null; }),
  ]);
  return {
    listings: [...fincas, ...(config?.catalog ?? INITIAL_LISTINGS)],
    content: { ...INITIAL_CONTENT, ...config?.content },
    contentEn: config?.contentEn ?? {},
    reviews: config?.reviews ?? REVIEWS,
  };
});

/** Listados que se muestran en el sitio (los desactivados en Inventario no). */
export async function visibleListings(): Promise<Listing[]> {
  return (await loadSiteData()).listings.filter((l) => l.active !== false);
}
