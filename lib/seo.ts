// Metadatos y datos estructurados (schema.org) del sitio público. Solo describen lo que se ve en la página:
// nada de calificaciones si el administrador no las puso.

import type { Metadata } from "next";
import { galleryFor, hasRating, type Listing, type SiteContent } from "@/lib/data";
import { ROUTES } from "@/lib/routes";

export const SITE_URL = "https://www.elviajeroinquieto.com";
export const SITE_NAME = "El Viajero Inquieto";
const DEFAULT_IMAGE = "/photos/cocora.jpg";
const AGENCY_ID = SITE_URL + "/#agencia";

export const abs = (path: string) => (/^https?:\/\//.test(path) ? path : SITE_URL + path);

/** Título, descripción, URL canónica y tarjeta para compartir (WhatsApp, Facebook) de una página. */
export function pageMeta({ title, description, path, image, absoluteTitle, noindex }: {
  title: string; description: string; path: string; image?: string; absoluteTitle?: boolean; noindex?: boolean;
}): Metadata {
  const fullTitle = absoluteTitle ? title : `${title} | ${SITE_NAME}`;
  const images = [{ url: image || DEFAULT_IMAGE }];
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", locale: "es_CO", siteName: SITE_NAME, url: path, title: fullTitle, description, images },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: images.map((i) => i.url) },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

/** Recorta en el último espacio antes de `max` caracteres. */
export function clip(s: string, max = 155): string {
  const t = s.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,.;:]$/, "") + "…";
}

const cop = (n: number) => "$" + n.toLocaleString("es-CO") + " COP";

export function listingTitle(l: Listing): string {
  return l.name.includes(l.town) ? l.name : `${l.name} en ${l.town}, ${l.dept}`;
}
export function listingDescription(l: Listing): string {
  const from = `Desde ${cop(l.price)} por ${l.unit}.`;
  return clip(l.desc, 150 - from.length) + " " + from;
}

/* ---- JSON-LD ---- */

/** La agencia, con los datos de contacto que el administrador publica en Contenido del sitio. */
export function agencyJsonLd(c: SiteContent) {
  const sameAs = [c.instagramUrl, c.facebookUrl].filter(Boolean).map((u) => u.split("?")[0]);
  const phone = c.whatsappNumber ? "+" + c.whatsappNumber : undefined;
  const [city, region] = (c.contactCity || "").split(",").map((s) => s.trim());
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "@id": AGENCY_ID,
    name: SITE_NAME,
    slogan: "Tu aliado al viajar",
    url: SITE_URL + "/",
    logo: abs("/photos/logo-stacked-ink.png"),
    image: abs(DEFAULT_IMAGE),
    description: c.footerTagline,
    ...(phone ? { telephone: phone } : {}),
    ...(c.contactEmail ? { email: c.contactEmail } : {}),
    ...(city ? { address: { "@type": "PostalAddress", addressLocality: city, ...(region ? { addressRegion: region } : {}), addressCountry: "CO" } } : {}),
    areaServed: { "@type": "Country", name: "Colombia" },
    ...(c.rnt ? { identifier: { "@type": "PropertyValue", propertyID: "RNT", name: "Registro Nacional de Turismo", value: c.rnt } } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

const CAT_NAMES: Record<Listing["cat"], string> = { alojamientos: "Fincas y Cabañas", parques: "Parques Temáticos", tours: "Experiencias" };

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: abs(it.path) })),
  };
}

/** Ficha: TouristTrip para experiencias, LodgingBusiness para fincas, Product con la entrada para parques. */
export function listingJsonLd(l: Listing) {
  const url = abs(ROUTES.listing(l.id));
  const images = galleryFor(l).map(abs);
  const offer = { "@type": "Offer", price: String(l.price), priceCurrency: "COP", url, seller: { "@id": AGENCY_ID } };
  const rating = hasRating(l) ? { aggregateRating: { "@type": "AggregateRating", ratingValue: l.rating, reviewCount: l.reviews } } : {};
  const base = { "@context": "https://schema.org", name: l.name, description: l.desc, url, ...(images.length ? { image: images } : {}) };
  const place = { "@type": "PostalAddress", addressLocality: l.town, addressRegion: l.dept, addressCountry: "CO" };
  const listing =
    l.cat === "tours"
      ? { ...base, "@type": "TouristTrip", provider: { "@id": AGENCY_ID }, offers: offer, ...rating }
      : l.cat === "alojamientos"
        ? { ...base, "@type": "LodgingBusiness", address: place, makesOffer: offer, ...rating }
        : { ...base, "@type": "Product", name: "Entrada a " + l.name, brand: { "@type": "Brand", name: l.name }, offers: offer, ...rating };
  return [
    listing,
    breadcrumbJsonLd([{ name: "Inicio", path: "/" }, { name: CAT_NAMES[l.cat], path: ROUTES[l.cat] }, { name: l.name, path: ROUTES.listing(l.id) }]),
  ];
}

/** Para <script type="application/ld+json">: escapa "<" para que ningún texto cierre la etiqueta. */
export function jsonLdHtml(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
