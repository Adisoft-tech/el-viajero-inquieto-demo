import { Nosotros } from "@/components/site/SimplePages";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Quiénes somos: agencia de viajes en Manizales",
  description: "El Viajero Inquieto es una agencia de viajes de Manizales con RNT 222679: viajes en familia, experiencias pedagógicas y turismo responsable por Colombia.",
  path: "/nosotros",
});

export default function NosotrosPage() {
  return <Nosotros />;
}
