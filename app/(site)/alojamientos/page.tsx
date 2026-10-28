import { Catalog } from "@/components/site/Catalog";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Fincas y cabañas para alquilar en Caldas",
  description: "Fincas y cabañas para disfrutar en familia cerca de Manizales. Mira el precio por noche, la capacidad y reserva directo por WhatsApp.",
  path: "/alojamientos",
  image: "/photos/finca-a.jpg",
});

export default function AlojamientosPage() {
  return <Catalog cat="alojamientos" />;
}
