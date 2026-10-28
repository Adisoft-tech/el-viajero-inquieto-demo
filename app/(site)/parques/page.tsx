import { Catalog } from "@/components/site/Catalog";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Entradas a parques temáticos de Colombia",
  description: "Compra entradas para Panaca, Recuca, Los Arrieros, Termales de Santa Rosa, Catedral de Sal y más parques de Colombia. Precios por persona en COP.",
  path: "/parques",
  image: "/photos/parque-cafe.jpg",
});

export default function ParquesPage() {
  return <Catalog cat="parques" />;
}
