import { ICONS } from "./icon-data";

export { ICONS };

/** Equivalente a icon(name, cls) del HTML original: <span aria-hidden> con el SVG dentro. */
export function Icon({ name, className }: { name: string; className?: string }) {
  return <span className={className || ""} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS[name] || "" }} />;
}

/** Equivalente a badge(iconName, tone). */
export function Badge({ icon, tone }: { icon: string; tone?: string }) {
  return (
    <div className={"art-badge tone-" + (tone || "sage")}>
      <Icon name={icon} />
    </div>
  );
}
