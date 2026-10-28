import type { NextConfig } from "next";

const noindex = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];

const nextConfig: NextConfig = {
  // Un solo dominio para Google: elviajeroinquieto.com pasa a www.elviajeroinquieto.com.
  async redirects() {
    return [{
      source: "/:path*",
      has: [{ type: "host", value: "elviajeroinquieto.com" }],
      destination: "https://www.elviajeroinquieto.com/:path*",
      permanent: true,
    }];
  },
  // Los paneles del equipo no se indexan.
  async headers() {
    return [
      { source: "/admin/:path*", headers: noindex },
      { source: "/admin", headers: noindex },
      { source: "/gestion/:path*", headers: noindex },
      { source: "/gestion", headers: noindex },
    ];
  },
};

export default nextConfig;
