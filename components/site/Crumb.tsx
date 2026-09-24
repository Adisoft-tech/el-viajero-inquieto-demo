import Link from "next/link";

/** Miga de pan: equivale a <span data-go="..."> del original (el estilo lo da .crumb span). */
export function CrumbLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <span><Link href={href}>{children}</Link></span>;
}
