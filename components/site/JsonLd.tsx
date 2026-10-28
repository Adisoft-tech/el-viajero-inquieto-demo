import { jsonLdHtml } from "@/lib/seo";

/** Datos estructurados schema.org para buscadores y asistentes de IA. */
export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(data) }} />;
}
