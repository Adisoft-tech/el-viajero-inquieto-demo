"use client";

// Estado global de la demo (reemplaza al objeto S y a las variables mutables del HTML original).
// Vive en memoria mientras la pestaña esté abierta; los favoritos, el aviso del chat y el token de sesión
// de los paneles se persisten en localStorage.
// Las fincas y las reservas del calendario vienen de Supabase (ver lib/actions/gestion.ts).

import { createContext, useCallback, useContext, useEffect, useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import {
  INITIAL_BOOKINGS, INITIAL_CONTENT, INITIAL_LISTINGS,
  type Booking, type FincaBooking, type Listing, type SiteContent,
} from "./data";
import { listFincaBookings, listFincas } from "./actions/gestion";
import { getSession, login as loginAction, logout as logoutAction, type SessionUser } from "./actions/auth";

export type LoadStatus = "idle" | "loading" | "ready" | "error";
/** "checking" mientras se valida el token guardado: los paneles esperan antes de mandar al login. */
export type AuthStatus = "checking" | "authed" | "anon";

const TOKEN_KEY = "vi_session_token";

function readToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}
function writeToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch { /* sin storage */ }
}

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
  fincaBookingsStatus: LoadStatus;
  /** Carga las reservas desde la base (solo el panel de gestión las necesita). */
  loadFincaBookings: () => Promise<void>;
  favorites: string[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  authStatus: AuthStatus;
  user: SessionUser | null;
  /** Una sola sesión abre el panel de gestión y el administrativo. */
  adminAuthed: boolean;
  gestionAuthed: boolean;
  /** Devuelve el mensaje de error, o null si ingresó. */
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  /**
   * Llama una Server Action protegida pasándole el token guardado. Si falla, revisa la sesión
   * y la cierra cuando el token ya no es válido (el panel manda al login).
   */
  authed: <A extends unknown[], R>(action: (token: string, ...args: A) => Promise<R>, ...args: A) => Promise<R>;
  toast: (msg: string) => void;
}

const Ctx = createContext<AppStore | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [listings, setListings] = useState<Listing[]>(INITIAL_LISTINGS);
  const [content, setContent] = useState<SiteContent>(INITIAL_CONTENT);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [fincaBookings, setFincaBookings] = useState<FincaBooking[]>([]);
  const [fincaBookingsStatus, setFincaBookingsStatus] = useState<LoadStatus>("idle");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [authStatus, setAuthStatus] = useState<AuthStatus>("checking");
  const [user, setUser] = useState<SessionUser | null>(null);
  const [toastMsg, setToastMsg] = useState("");
  const [toastShow, setToastShow] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try { setFavorites(JSON.parse(localStorage.getItem("vi_favorites") || "[]")); } catch { /* sin storage */ }
  }, []);

  // Reemplaza las fincas semilla por las de la base; si falla, el sitio sigue con las semilla.
  useEffect(() => {
    listFincas()
      .then((fincas) => setListings((prev) => [...fincas, ...prev.filter((l) => l.cat !== "alojamientos")]))
      .catch((err) => console.error("No se pudieron cargar las fincas:", err));
  }, []);

  const endSession = useCallback(() => {
    setUser(null);
    setAuthStatus("anon");
    setFincaBookings([]);
    setFincaBookingsStatus("idle");
  }, []);

  // Restaura la sesión desde el token guardado; sin token (o si ya no es válido) queda cerrada.
  useEffect(() => {
    const token = readToken();
    if (!token) { endSession(); return; }
    getSession(token)
      .then((u) => {
        if (readToken() !== token) return; // cambió mientras se validaba
        if (u) { setUser(u); setAuthStatus("authed"); }
        else { writeToken(null); endSession(); }
      })
      // Sin conexión con la base no se puede validar: se cierra sin borrar el token.
      .catch((err) => { console.error("No se pudo validar la sesión:", err); endSession(); });
  }, [endSession]);

  // Si otra pestaña cierra sesión (o alguien borra el token), esta también se cierra.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if ((e.key === TOKEN_KEY || e.key === null) && !readToken()) endSession();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [endSession]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await loginAction(email, password);
      if (!res.ok) return res.error;
      writeToken(res.token);
      setUser(res.user);
      setAuthStatus("authed");
      return null;
    } catch (err) {
      console.error("No se pudo iniciar sesión:", err);
      return "No pudimos conectarnos. Intenta de nuevo en un momento.";
    }
  }, []);

  const logout = useCallback(async () => {
    const token = readToken();
    writeToken(null);
    endSession();
    if (token) await logoutAction(token).catch((err) => console.error("No se pudo cerrar la sesión en el servidor:", err));
  }, [endSession]);

  const authed = useCallback(async <A extends unknown[], R>(action: (token: string, ...args: A) => Promise<R>, ...args: A) => {
    const token = readToken();
    try {
      return await action(token ?? "", ...args);
    } catch (err) {
      // En producción Next.js oculta el mensaje del error, así que se pregunta directamente por la sesión.
      const stillValid = token ? await getSession(token).catch(() => true) : false;
      if (!stillValid && readToken() === token) { writeToken(null); endSession(); }
      throw err;
    }
  }, [endSession]);

  const loadFincaBookings = useCallback(async () => {
    setFincaBookingsStatus("loading");
    try {
      setFincaBookings(await authed(listFincaBookings));
      setFincaBookingsStatus("ready");
    } catch (err) {
      console.error("No se pudieron cargar las reservas:", err);
      setFincaBookingsStatus("error");
    }
  }, [authed]);

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
    fincaBookings, setFincaBookings, fincaBookingsStatus, loadFincaBookings, favorites, isFavorite, toggleFavorite,
    authStatus, user, adminAuthed: authStatus === "authed", gestionAuthed: authStatus === "authed", login, logout, authed, toast,
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
