import type { Metadata } from "next";
import { Detail } from "@/components/site/Detail";
import { JsonLd } from "@/components/site/JsonLd";
import { galleryFor } from "@/lib/data";
import { ROUTES } from "@/lib/routes";
import { visibleListings } from "@/lib/site-data";
import { listingDescription, listingJsonLd, listingTitle, pageMeta } from "@/lib/seo";

async function findListing(id: string) {
  return (await visibleListings()).find((l) => l.id === id);
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const l = await findListing((await params).id);
  if (!l) return { title: "No encontrado", robots: { index: false } };
  return pageMeta({
    title: listingTitle(l),
    description: listingDescription(l),
    path: ROUTES.listing(l.id),
    image: galleryFor(l)[0],
    // Los parques aliados redirigen a su propia página: no se indexa esta copia.
    noindex: !!l.externalUrl,
  });
}

export default async function FichaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const l = await findListing(id);
  return (
    <>
      {l && !l.externalUrl && <JsonLd data={listingJsonLd(l)} />}
      <Detail key={id} id={id} />
    </>
  );
}
