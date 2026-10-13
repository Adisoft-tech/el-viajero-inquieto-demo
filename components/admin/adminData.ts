"use client";

// Une las reservas del panel de gestión (base de datos) con las solicitudes que llegan desde el sitio web,
// y calcula las cifras del resumen a partir de datos reales.

import { useMemo } from "react";
import type { Booking, FincaBooking, Listing } from "@/lib/data";
import { useApp } from "@/lib/store";

export type Origin = "gestion" | "web";
export interface AdminBooking extends Booking {
  origin: Origin;
  /** Solo reservas de gestión: fechas ISO y montos para las cifras del resumen. */
  checkin?: string; checkout?: string; advance?: number; balance?: number;
  createdAt: string;
}

const pad = (n: number) => String(n).padStart(2, "0");
const isoOf = (d: Date) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
const parse = (iso: string) => new Date(iso + "T00:00:00");
const short = (iso: string) => parse(iso).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });

export function fromGestion(b: FincaBooking, fincaName: string, todayIso: string): AdminBooking {
  const pay = b.total > 0 && b.advance >= b.total ? "pagado" : b.advance > 0 ? "abono" : "pendiente";
  const status = b.checkout < todayIso ? "completada" : b.checkin <= todayIso ? "en curso" : "confirmada";
  return {
    code: "G-" + String(b.id).padStart(4, "0"), guest: b.guest, listing: fincaName,
    dates: short(b.checkin) + " → " + short(b.checkout), guests: b.guests, total: b.total, pay, status,
    origin: "gestion", checkin: b.checkin, checkout: b.checkout, advance: b.advance, balance: b.balance,
    createdAt: typeof b.createdAt === "string" ? b.createdAt.replace(" ", "T").replace(/([+-]\d\d)$/, "$1:00") : "",
  };
}

const time = (iso: string) => Date.parse(iso) || 0;

export interface AdminStats {
  monthCount: number; monthRevenue: number; occupancy: number;
  monthAdvance: number; monthBalance: number;
  next: { when: string; who: string } | null;
  weeks: { label: string; count: number }[];
}

export function computeStats(rows: AdminBooking[], activeFincas: number, now = new Date()): AdminStats {
  const todayIso = isoOf(now);
  const y = now.getFullYear(), m = now.getMonth();
  const monthStart = isoOf(new Date(y, m, 1)), nextMonthStart = isoOf(new Date(y, m + 1, 1));
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const gest = rows.filter((r) => r.origin === "gestion" && r.checkin && r.checkout);

  const inMonth = gest.filter((r) => r.checkin! >= monthStart && r.checkin! < nextMonthStart);
  const web = rows.filter((r) => r.origin === "web").length;

  // Noches ocupadas dentro del mes (cada reserva ocupa de la llegada hasta la víspera de la salida).
  let nights = 0;
  for (const r of gest) {
    const from = r.checkin! > monthStart ? r.checkin! : monthStart;
    const to = r.checkout! < nextMonthStart ? r.checkout! : nextMonthStart;
    if (to > from) nights += Math.round((parse(to).getTime() - parse(from).getTime()) / 86400000);
  }
  const capacity = activeFincas * daysInMonth;

  const upcoming = gest.filter((r) => r.checkin! >= todayIso).sort((a, b) => a.checkin!.localeCompare(b.checkin!))[0];
  const diff = upcoming ? Math.round((parse(upcoming.checkin!).getTime() - parse(todayIso).getTime()) / 86400000) : 0;

  // Llegadas por semana: 2 semanas atrás, la actual y 3 por delante (semanas desde el lunes).
  const monday = parse(todayIso);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const weeks = [-2, -1, 0, 1, 2, 3].map((k) => {
    const start = new Date(monday); start.setDate(start.getDate() + k * 7);
    const end = new Date(start); end.setDate(end.getDate() + 7);
    const s = isoOf(start), e = isoOf(end);
    return {
      label: start.toLocaleDateString("es-CO", { day: "numeric", month: "short" }),
      count: gest.filter((r) => r.checkin! >= s && r.checkin! < e).length,
    };
  });

  return {
    monthCount: inMonth.length + web,
    monthRevenue: inMonth.reduce((a, r) => a + r.total, 0),
    monthAdvance: inMonth.reduce((a, r) => a + (r.advance || 0), 0),
    monthBalance: inMonth.reduce((a, r) => a + (r.balance || 0), 0),
    occupancy: capacity ? Math.min(100, Math.round((nights / capacity) * 100)) : 0,
    next: upcoming ? { when: diff === 0 ? "Hoy" : diff === 1 ? "Mañana" : short(upcoming.checkin!), who: upcoming.guest + " · " + upcoming.listing } : null,
    weeks,
  };
}

/** Reservas de gestión + solicitudes del sitio, de la más reciente a la más antigua, y las cifras del resumen. */
export function useAdminBookings() {
  const { bookings, fincaBookings, fincaBookingsStatus, listings, loadFincaBookings } = useApp();
  return useMemo(() => {
    const todayIso = isoOf(new Date());
    const name = (id: string) => listings.find((l: Listing) => l.id === id)?.name ?? id;
    const rows: AdminBooking[] = [
      ...fincaBookings.map((b) => fromGestion(b, name(b.fincaId), todayIso)),
      ...bookings.map((b): AdminBooking => ({ ...b, origin: "web", createdAt: typeof b.createdAt === "string" ? b.createdAt : "" })),
    ].sort((a, b) => time(b.createdAt) - time(a.createdAt) || b.code.localeCompare(a.code));
    const activeFincas = listings.filter((l) => l.cat === "alojamientos" && l.active !== false).length;
    return { rows, stats: computeStats(rows, activeFincas), status: fincaBookingsStatus, reload: loadFincaBookings };
  }, [bookings, fincaBookings, fincaBookingsStatus, listings, loadFincaBookings]);
}
