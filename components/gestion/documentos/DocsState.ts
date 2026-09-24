"use client";

// Equivalente a S.docs del original: vive a nivel de módulo para que el tipo de documento,
// los consecutivos y el borrador sobrevivan al cambiar entre Calendario y Documentos.

import { useCallback, useState } from "react";
import type { DocData, DocItem } from "@/lib/pdf";

export interface DocItemRow extends DocItem { id: number }
export interface DocsState extends Omit<DocData, "items"> { items: DocItemRow[] }

let nextItemId = 1;
export function newItem(): DocItemRow { return { id: nextItemId++, desc: "", qty: 1, price: 0 }; }

let saved: DocsState = {
  type: "cotizacion",
  counters: { cobro: 1, pago: 1, cotizacion: 1 },
  items: [newItem()],
};

export function useDocsState(): [DocsState, (fn: (d: DocsState) => DocsState) => void] {
  const [state, setState] = useState<DocsState>(() => saved);
  const update = useCallback((fn: (d: DocsState) => DocsState) => {
    setState((prev) => {
      const next = fn(prev);
      saved = next;
      return next;
    });
  }, []);
  return [state, update];
}
