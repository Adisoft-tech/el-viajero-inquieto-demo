import type { Metadata } from "next";
import { Contacto } from "@/components/site/SimplePages";
import { loadSiteData } from "@/lib/site-data";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { content: c } = await loadSiteData();
  const reach = [c.contactPhone && "al " + c.contactPhone, c.contactEmail && "a " + c.contactEmail].filter(Boolean).join(" o ");
  return pageMeta({
    title: "Contacto y reservas por WhatsApp",
    description: `Escríbenos${reach ? " " + reach : ""}. Estamos en ${c.contactCity || "Colombia"}. Reservamos fincas, tours y entradas a parques.`,
    path: "/contacto",
  });
}

export default function ContactoPage() {
  return <Contacto />;
}
