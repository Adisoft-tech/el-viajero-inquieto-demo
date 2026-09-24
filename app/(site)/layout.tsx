import { ChatWidget } from "@/components/site/ChatWidget";
import { RevealObserver } from "@/components/site/RevealObserver";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteProvider } from "@/components/site/SiteContext";
import { SiteMain } from "@/components/site/SiteMain";

/** Estructura del sitio público: header + contenido + footer + asistente flotante. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteProvider>
      <SiteHeader />
      <SiteMain>{children}</SiteMain>
      <SiteFooter />
      <ChatWidget />
      <RevealObserver />
    </SiteProvider>
  );
}
