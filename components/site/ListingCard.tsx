"use client";

import { useRouter } from "next/navigation";
import { galleryFor, photoFor, type Listing } from "@/lib/data";
import { catLabel, cop } from "@/lib/format";
import { Icon } from "@/lib/icons";
import { useApp } from "@/lib/store";
import { ROUTES } from "@/lib/routes";

export function ListingCard({ l }: { l: Listing }) {
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useApp();
  const photo = photoFor(l);
  const gallery = galleryFor(l);
  return (
    <div className="lcard reveal" data-listing={l.id} onClick={() => router.push(ROUTES.listing(l.id))}>
      <div className={"lcard-art tone-" + l.tone}>
        <span className="lcard-tag">{catLabel(l.cat)}</span>
        {gallery.length > 1 && <span className="lcard-photocount">{gallery.length} fotos</span>}
        <button
          type="button"
          className={"lcard-fav" + (isFavorite(l.id) ? " active" : "")}
          aria-label="Guardar en favoritos"
          onClick={(e) => { e.stopPropagation(); toggleFavorite(l.id); }}
        >
          <Icon name="heart" />
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {photo ? <img src={photo} alt={l.name} loading="lazy" /> : <Icon name={l.icon} />}
      </div>
      <div className="lcard-body">
        <div className="lcard-loc"><Icon name="pin" /> {l.town}, {l.dept}</div>
        <div className="lcard-name">{l.name}</div>
        <div className="lcard-meta">
          <div className="lcard-price"><b>{cop(l.price)}</b><span> / {l.unit}</span></div>
          <div className="lcard-rating">★ {l.rating.toFixed(1)}</div>
        </div>
      </div>
    </div>
  );
}
