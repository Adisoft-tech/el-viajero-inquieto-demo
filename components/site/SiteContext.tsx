"use client";

// Estado del sitio público que sobrevive entre páginas (equivale a S.catalog y S.booking del HTML original).

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useApp } from "@/lib/store";
import type { Listing } from "@/lib/data";

export type CatalogSort = "recomendado" | "precio-asc" | "precio-desc" | "rating";
export type PayMethod = "card" | "pse" | "nequi";

export interface BookingDraft {
  listingId: string | null; step: number;
  checkin: string; checkout: string; date: string; guests: number;
  name: string; email: string; phone: string; payMethod: PayMethod; lastCode?: string;
}

interface SiteStore {
  catalogTown: string;
  setCatalogTown: (t: string) => void;
  catalogSort: CatalogSort;
  setCatalogSort: (s: CatalogSort) => void;
  booking: BookingDraft;
  updateBooking: (patch: Partial<BookingDraft>) => void;
}

const Ctx = createContext<SiteStore | null>(null);

export function SiteProvider({ children }: { children: ReactNode }) {
  const [catalogTown, setCatalogTown] = useState("todos");
  const [catalogSort, setCatalogSort] = useState<CatalogSort>("recomendado");
  const [booking, setBooking] = useState<BookingDraft>({
    listingId: null, step: 1, checkin: "", checkout: "", date: "", guests: 2,
    name: "", email: "", phone: "", payMethod: "card",
  });
  const updateBooking = useCallback((patch: Partial<BookingDraft>) => setBooking((b) => ({ ...b, ...patch })), []);
  return (
    <Ctx.Provider value={{ catalogTown, setCatalogTown, catalogSort, setCatalogSort, booking, updateBooking }}>
      {children}
    </Ctx.Provider>
  );
}

export function useSite(): SiteStore {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSite debe usarse dentro de <SiteProvider>");
  return v;
}

/** Solo los listados activos (los desactivados en Inventario no se muestran en el sitio). */
export function useVisibleListings(): Listing[] {
  const { listings } = useApp();
  return useMemo(() => listings.filter((l) => l.active !== false), [listings]);
}

/** Busca un listado visible por id. */
export function useVisibleListing(id: string): Listing | undefined {
  const { byId } = useApp();
  const l = byId(id);
  return l && l.active !== false ? l : undefined;
}
