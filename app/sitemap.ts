import type { MetadataRoute } from "next";
import { listPublishedPosts } from "@/lib/actions/blog";
import { ROUTES } from "@/lib/routes";
import { loadSiteData, visibleListings } from "@/lib/site-data";
import { abs } from "@/lib/seo";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [listings, { reviews }, posts] = await Promise.all([
    visibleListings(),
    loadSiteData(),
    listPublishedPosts().catch(() => []),
  ]);
  const pages: MetadataRoute.Sitemap = [
    { url: abs("/"), changeFrequency: "weekly", priority: 1 },
    { url: abs(ROUTES.alojamientos), changeFrequency: "weekly", priority: 0.9 },
    { url: abs(ROUTES.parques), changeFrequency: "weekly", priority: 0.9 },
    { url: abs(ROUTES.tours), changeFrequency: "weekly", priority: 0.9 },
    { url: abs(ROUTES.nosotros), changeFrequency: "monthly", priority: 0.6 },
    { url: abs(ROUTES.contacto), changeFrequency: "monthly", priority: 0.6 },
    { url: abs(ROUTES.notiviajero), changeFrequency: "weekly", priority: 0.7 },
  ];
  if (reviews.length) pages.push({ url: abs(ROUTES.experiencias), changeFrequency: "monthly", priority: 0.5 });
  // Los parques aliados abren la página del parque, así que no tienen ficha propia.
  for (const l of listings) if (!l.externalUrl) pages.push({ url: abs(ROUTES.listing(l.id)), changeFrequency: "weekly", priority: 0.8 });
  for (const p of posts) pages.push({ url: abs(ROUTES.post(p.id)), lastModified: p.updatedAt || p.publishedAt, changeFrequency: "monthly", priority: 0.7 });
  return pages;
}
