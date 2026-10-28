import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// Buscadores y asistentes de IA pueden leer todo el sitio público (a propósito: así citan bien precios y contacto).
// Los paneles, la API y las páginas de reserva no se indexan.
export default function robots(): MetadataRoute.Robots {
  const disallow = ["/admin", "/gestion", "/api/", "/favoritos", "/reservar/"];
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      {
        userAgent: ["Googlebot", "Bingbot", "GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-User", "PerplexityBot", "Google-Extended", "Applebot-Extended"],
        allow: "/", disallow,
      },
    ],
    sitemap: SITE_URL + "/sitemap.xml",
    host: SITE_URL,
  };
}
