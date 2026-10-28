import { Favoritos } from "@/components/site/SimplePages";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Favoritos", description: "Tus fincas, parques y experiencias guardadas.", path: "/favoritos", noindex: true });

export default function FavoritosPage() {
  return <Favoritos />;
}
