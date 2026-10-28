import type { Metadata } from "next";
import { Experiencias } from "@/components/site/SimplePages";
import { loadSiteData } from "@/lib/site-data";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { reviews } = await loadSiteData();
  return pageMeta({
    title: "Testimonios de viajeros",
    description: "Lo que cuentan los viajeros que reservaron fincas, parques y experiencias con El Viajero Inquieto.",
    path: "/experiencias",
    // Sin reseñas publicadas la página está vacía: no se indexa hasta que el administrador agregue alguna.
    noindex: reviews.length === 0,
  });
}

export default function ExperienciasPage() {
  return <Experiencias />;
}
