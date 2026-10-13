import type { Metadata } from "next";
import { Notiviajero } from "@/components/site/Notiviajero";
import { listPublishedPosts } from "@/lib/actions/blog";

export const metadata: Metadata = { title: "Notiviajero · El Viajero Inquieto" };
export const dynamic = "force-dynamic";

export default async function NotiviajeroPage() {
  const posts = await listPublishedPosts().catch((err) => { console.error("No se pudo cargar Notiviajero:", err); return []; });
  return <Notiviajero posts={posts} />;
}
