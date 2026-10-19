"use client";

// Estado del sitio público que sobrevive entre páginas (equivale a S.catalog y S.booking del HTML original).

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useApp } from "@/lib/store";
import type { Listing, SiteContent } from "@/lib/data";
import { contentFor, formatPrice, LANG_KEY, localizeListing, translate, type Lang } from "@/lib/i18n";

export type CatalogSort = "recomendado" | "precio-asc" | "precio-desc" | "rating";

export interface BookingDraft {
  listingId: string | null; step: number;
  checkin: string; checkout: string; date: string; guests: number;
  name: string; email: string; phone: string; observaciones: string;
}

interface SiteStore {
  catalogTown: string;
  setCatalogTown: (t: string) => void;
  catalogSort: CatalogSort;
  setCatalogSort: (s: CatalogSort) => void;
  booking: BookingDraft;
  updateBooking: (patch: Partial<BookingDraft>) => void;
  lang: Lang;
  setLang: (l: Lang) => void;
}

const Ctx = createContext<SiteStore | null>(null);

export function SiteProvider({ children }: { children: ReactNode }) {
  const [catalogTown, setCatalogTown] = useState("todos");
  const [catalogSort, setCatalogSort] = useState<CatalogSort>("recomendado");
  const [booking, setBooking] = useState<BookingDraft>({
    listingId: null, step: 1, checkin: "", checkout: "", date: "", guests: 2,
    name: "", email: "", phone: "", observaciones: "",
  });
  const updateBooking = useCallback((patch: Partial<BookingDraft>) => setBooking((b) => ({ ...b, ...patch })), []);

  // Idioma: el que el visitante eligió antes o, la primera vez, el de su navegador. Arranca en español para que
  // el HTML del servidor coincida y cambia al montar.
  const [lang, setLangState] = useState<Lang>("es");
  useEffect(() => {
    let saved: string | null = null;
    try { saved = localStorage.getItem(LANG_KEY); } catch { /* sin storage */ }
    if (saved === "es" || saved === "en") setLangState(saved);
    else if (navigator.language?.toLowerCase().startsWith("en")) setLangState("en");
  }, []);
  useEffect(() => { document.documentElement.lang = lang === "en" ? "en" : "es-CO"; }, [lang]);
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(LANG_KEY, l); } catch { /* sin storage */ }
  }, []);

  return (
    <Ctx.Provider value={{ catalogTown, setCatalogTown, catalogSort, setCatalogSort, booking, updateBooking, lang, setLang }}>
      {children}
    </Ctx.Provider>
  );
}

export function useSite(): SiteStore {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSite debe usarse dentro de <SiteProvider>");
  return v;
}

/** Idioma actual, cambio de idioma y t("texto en español") → texto en el idioma actual. */
export function useI18n() {
  const { lang, setLang } = useSite();
  const t = useCallback((s: string) => translate(lang, s), [lang]);
  /** Igual que t, para textos que vienen de datos: si no hay traducción se deja tal cual, sin aviso. */
  const tx = useCallback((s: string) => translate(lang, s, true), [lang]);
  /** Fecha ISO (AAAA-MM-DD) legible en el idioma actual. */
  const fmtDate = useCallback((iso: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }) =>
    new Date(iso.slice(0, 10) + "T00:00:00").toLocaleDateString(lang === "en" ? "en-US" : "es-CO", opts), [lang]);
  /** Precio con la moneda (COP) en el formato del idioma actual. */
  const price = useCallback((n: number) => formatPrice(n, lang), [lang]);
  return { lang, setLang, t, tx, fmtDate, price };
}

/** Textos editables del sitio en el idioma actual. */
export function useContent(): SiteContent {
  const { content, contentEn } = useApp();
  const { lang } = useSite();
  return useMemo(() => contentFor(lang, content, contentEn), [lang, content, contentEn]);
}

/** Solo los listados activos (los desactivados en Inventario no se muestran en el sitio), en el idioma actual. */
export function useVisibleListings(): Listing[] {
  const { listings } = useApp();
  const { lang } = useSite();
  return useMemo(() => listings.filter((l) => l.active !== false).map((l) => localizeListing(l, lang)), [listings, lang]);
}

/** Busca un listado visible por id. */
export function useVisibleListing(id: string): Listing | undefined {
  const { byId } = useApp();
  const { lang } = useSite();
  const l = byId(id);
  return l && l.active !== false ? localizeListing(l, lang) : undefined;
}
