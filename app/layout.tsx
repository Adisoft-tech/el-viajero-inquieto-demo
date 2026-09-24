import type { Metadata, Viewport } from "next";
import { AppProvider } from "@/lib/store";
import { ServiceWorker } from "@/components/ServiceWorker";
import "./globals.css";

export const metadata: Metadata = {
  title: "El Viajero Inquieto",
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&display=swap" />
      </head>
      <body>
        <AppProvider>
          <div id="app">{children}</div>
        </AppProvider>
        <ServiceWorker />
      </body>
    </html>
  );
}
