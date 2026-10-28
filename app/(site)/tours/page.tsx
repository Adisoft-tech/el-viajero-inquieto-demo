import { Catalog } from "@/components/site/Catalog";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Tours y experiencias en el Eje Cafetero",
  description: "Valle de Cocora, Filandia, termales de Santa Rosa, avistamiento de aves y Manizales. Tours de un día con guía y transporte, con precio por persona.",
  path: "/tours",
  image: "/photos/kayak-action.jpg",
});

export default function ToursPage() {
  return <Catalog cat="tours" />;
}
