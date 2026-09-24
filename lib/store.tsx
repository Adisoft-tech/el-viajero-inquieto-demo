"use client";

// Estado global de la demo (reemplaza al objeto S y a las variables mutables del HTML original).
// Vive en memoria mientras la pestaña esté abierta; los favoritos y el aviso del chat se persisten en localStorage.

import { createContext, useCallback, useContext, useEffect, useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import {
  INITIAL_BOOKINGS, INITIAL_CONTENT, INITIAL_FINCA_BOOKINGS, INITIAL_LISTINGS,
  type Booking, type FincaBooking, type Listing, type SiteContent,
} from "./data";

interface AppStore {
  listings: Listing[];
  setListings: Dispatch<SetStateAction<Listing[]>>;
  byId: (id: string) => Listing | undefined;
  content: SiteContent;
  setContent: Dispatch<SetStateAction<SiteContent>>;
  bookings: Booking[];
  setBookings: Dispatch<SetStateAction<Booking[]>>;
  fincaBookings: FincaBooking[];
  setFincaBookings: Dispatch<SetStateAction<FincaBooking[]>>;
  favorites: string[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  adminAuthed: boolean;
  setAdminAuthed: (v: boolean) => void;
  gestionAuthed: boolean;
  setGestionAuthed: (v: boolean) => void;
  toast: (msg: string) => void;
}

const Ctx = createContext<AppStore | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [listings, setListings] = useState<Listing[]>(INITIAL_LISTINGS);
  const [content, setContent] = useState<SiteContent>(INITIAL_CONTENT);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [fincaBookings, setFincaBookings] = useState<FincaBooking[]>(INITIAL_FINCA_BOOKINGS);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [gestionAuthed, setGestionAuthed] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastShow, setToastShow] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try { setFavorites(JSON.parse(localStorage.getItem("vi_favorites") || "[]")); } catch { /* sin storage */ }
  }, []);

  const byId = useCallback((id: string) => listings.find((l) => l.id === id), [listings]);
  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);
  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try { localStorage.setItem("vi_favorites", JSON.stringify(next)); } catch { /* sin storage */ }
      return next;
    });
  }, []);
  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastShow(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastShow(false), 2200);
  }, []);

  const value: AppStore = {
    listings, setListings, byId, content, setContent, bookings, setBookings,
    fincaBookings, setFincaBookings, favorites, isFavorite, toggleFavorite,
    adminAuthed, setAdminAuthed, gestionAuthed, setGestionAuthed, toast,
  };
  return (
    <Ctx.Provider value={value}>
      {children}
      <div className={"toast" + (toastShow ? " show" : "")} id="toast">{toastMsg}</div>
    </Ctx.Provider>
  );
}

export function useApp(): AppStore {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp debe usarse dentro de <AppProvider>");
  return v;
}
