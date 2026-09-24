import type { Review } from "@/lib/data";
import { stars } from "@/lib/format";

export function ReviewCard({ r }: { r: Review }) {
  const initials = r.name.split(" ").map((w) => w[0]).slice(0, 2).join("");
  return (
    <div className="review-card">
      <div className="review-stars">{stars(r.rating)}</div>
      <p className="review-quote">&quot;{r.quote}&quot;</p>
      <div className="review-who">
        <div className="review-avatar">{initials}</div>
        <div>
          <div className="review-name">{r.name}</div>
          <div className="review-origin">{r.origin} · {r.listing}</div>
        </div>
      </div>
    </div>
  );
}
