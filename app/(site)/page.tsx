import { Home } from "@/components/site/Home";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "El Viajero Inquieto · Agencia de viajes en Manizales",
  absoluteTitle: true,
  description: "Fincas para disfrutar en familia, entradas a parques temáticos y tours por el Eje Cafetero y Colombia. Agencia con RNT 222679. Reserva por WhatsApp.",
  path: "/",
});

export default function HomePage() {
  return <Home />;
}
