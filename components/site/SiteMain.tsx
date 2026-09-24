"use client";

import { usePathname } from "next/navigation";

/** <main class="fade-in"> que repite la animación en cada cambio de página, como el render() original. */
export function SiteMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return <main className="fade-in" key={pathname}>{children}</main>;
}
