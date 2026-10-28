"use client";

import { useRouter } from "next/navigation";
import { galleryFor, hasRating, photoFor, type Listing } from "@/lib/data";
import { catLabel } from "@/lib/format";
import { Icon } from "@/lib/icons";
import { useApp } from "@/lib/store";
import { ROUTES } from "@/lib/routes";
import { useI18n } from "./SiteContext";

export function ListingCard({ l }: { l: Listing }) {
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useApp();
  const { t, price } = useI18n();
  const photo = photoFor(l);
  const gallery = galleryFor(l);
  function open() {
    if (l.externalUrl) window.open(l.externalUrl, "_blank", "noopener,noreferrer");
    else router.push(ROUTES.listing(l.id));
  }
  return (
    <div className="lcard reveal" data-listing={l.id} onClick={open}>
      <div className={"lcard-art tone-" + l.tone}>
        <span className="lcard-tag">{t(catLabel(l.cat))}</span>
        {gallery.length > 1 && <span className="lcard-photocount">{gallery.length} {t("fotos")}</span>}
        <button
          type="button"
          className={"lcard-fav" + (isFavorite(l.id) ? " active" : "")}
          aria-label={t("Guardar en favoritos")}
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
          <div className="lcard-price"><b>{price(l.price)}</b><span> / {t(l.unit)}</span></div>
          {hasRating(l) && <div className="lcard-rating">★ {l.rating.toFixed(1)}</div>}
        </div>
      </div>
    </div>
  );
}
