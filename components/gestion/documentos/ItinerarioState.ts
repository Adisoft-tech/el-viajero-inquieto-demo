"use client";

// Estado del formulario de Itinerarios — mismo patrón que DocsState.ts: vive a nivel de
// módulo para que el borrador sobreviva a cambiar de pestaña dentro de Documentos.

import { useCallback, useState } from "react";
import type { ActivityCategoryKey, ItinerarioActivity } from "@/lib/pdf";

export interface ActivityRow extends ItinerarioActivity { id: number }
export interface DayRow { id: number; title?: string; activities: ActivityRow[] }
export interface ItinerarioState {
  cliente?: string;
  destino?: string;
  fechaInicio?: string;
  notas?: string;
  dias: DayRow[];
  counter: number;
  counterReady: boolean;
}

let nextActId = 1;
let nextDayId = 1;
export function newActivity(values?: Partial<ItinerarioActivity>): ActivityRow {
  return { id: nextActId++, time: "", category: "aventura", title: "", ...values };
}
export function newDay(values?: Partial<Omit<DayRow, "id" | "activities">> & { activities?: ActivityRow[] }): DayRow {
  return { id: nextDayId++, activities: [newActivity()], ...values };
}

let saved: ItinerarioState = { dias: [newDay()], counter: 1, counterReady: false };

export function useItinerarioState(): [ItinerarioState, (fn: (s: ItinerarioState) => ItinerarioState) => void] {
  const [state, setState] = useState<ItinerarioState>(() => saved);
  const update = useCallback((fn: (s: ItinerarioState) => ItinerarioState) => {
    setState((prev) => {
      const next = fn(prev);
      saved = next;
      return next;
    });
  }, []);
  return [state, update];
}
