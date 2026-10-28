import { ChatWidget } from "@/components/site/ChatWidget";
import { RevealObserver } from "@/components/site/RevealObserver";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteProvider } from "@/components/site/SiteContext";
import { SiteMain } from "@/components/site/SiteMain";
import { JsonLd } from "@/components/site/JsonLd";
import { loadSiteData } from "@/lib/site-data";
import { agencyJsonLd } from "@/lib/seo";

/** Estructura del sitio público: header + contenido + footer + asistente flotante. */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { content } = await loadSiteData();
  return (
    <SiteProvider>
      <JsonLd data={agencyJsonLd(content)} />
      <SiteHeader />
      <SiteMain>{children}</SiteMain>
      <SiteFooter />
      <ChatWidget />
      <RevealObserver />
    </SiteProvider>
  );
}
