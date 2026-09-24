"use client";

import { useRouter } from "next/navigation";
import type { Listing } from "@/lib/data";
import { photoFor } from "@/lib/data";
import { catLabel } from "@/lib/format";
import { Icon } from "@/lib/icons";
import { ROUTES } from "@/lib/routes";

/** Fila editable del inventario: precio (se confirma al salir del campo o con Enter, como el evento "change"), visibilidad y acciones. */
export function InventoryRow({ l, onToggle, onPrice, onRemove }: {
  l: Listing;
  onToggle: (l: Listing) => void;
  onPrice: (l: Listing, raw: string) => void;
  onRemove: (l: Listing) => void;
}) {
  const router = useRouter();
  const thumb = photoFor(l);
  return (
    <tr data-invrow={l.id}>
      <td className="wrap">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {thumb && <img src={thumb} alt="" style={{ width: 38, height: 38, borderRadius: 8, objectFit: "cover", flex: "none" }} />}
          <span>{l.name}</span>
        </div>
      </td>
      <td>{catLabel(l.cat)}</td>
      <td>{l.town}</td>
      <td>
        <input
          className="mini-input tabular" type="number" step={1000} defaultValue={l.price}
          onBlur={(e) => { if (e.target.value !== String(l.price)) onPrice(l, e.target.value); }}
          onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
        />
      </td>
      <td><div className={"switch" + (l.active === false ? "" : " on")} onClick={() => onToggle(l)} /></td>
      <td>
        <div className="row-actions">
          <button className="icon-btn" onClick={() => router.push(ROUTES.listing(l.id))}><Icon name="eye" /></button>
          <button className="icon-btn" onClick={() => onRemove(l)}><Icon name="trash" /></button>
        </div>
      </td>
    </tr>
  );
}
