import type { Metadata, Viewport } from "next";
import { AppProvider } from "@/lib/store";
import { ServiceWorker } from "@/components/ServiceWorker";
import { loadSiteData } from "@/lib/site-data";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import "./globals.css";

// El HTML se regenera cada 5 minutos o al instante cuando el administrador guarda cambios (revalidatePath).
export const revalidate = 300;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: "%s | " + SITE_NAME },
  description: "Agencia de viajes de Manizales: fincas para disfrutar en familia, entradas a parques temáticos y experiencias por Colombia.",
  applicationName: SITE_NAME,
  openGraph: { type: "website", locale: "es_CO", siteName: SITE_NAME, images: [{ url: "/photos/cocora.jpg" }] },
  twitter: { card: "summary_large_image" },
  manifest: "/manifest.webmanifest",
  icons: { icon: "/photos/icon-192.png", apple: "/photos/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: "Gestión VI", statusBarStyle: "black-translucent" },
  other: { "mobile-web-app-capable": "yes" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1F2926",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const initial = await loadSiteData();
  return (
    <html lang="es-CO">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&display=swap" />
      </head>
      <body>
        <AppProvider initial={initial}>
          <div id="app">{children}</div>
        </AppProvider>
        <ServiceWorker />
      </body>
    </html>
  );
}
