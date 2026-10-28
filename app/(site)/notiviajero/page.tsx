import type { Metadata } from "next";
import { Notiviajero } from "@/components/site/Notiviajero";
import { listPublishedPosts } from "@/lib/actions/blog";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Notiviajero: guías y consejos para viajar por Colombia",
  description: "Historias, noticias y tips para viajar mejor por el Eje Cafetero y Colombia, escritos por el equipo de El Viajero Inquieto.",
  path: "/notiviajero",
});
export const dynamic = "force-dynamic";

export default async function NotiviajeroPage() {
  const posts = await listPublishedPosts().catch((err) => { console.error("No se pudo cargar Notiviajero:", err); return []; });
  return <Notiviajero posts={posts} />;
}
