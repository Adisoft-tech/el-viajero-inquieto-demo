"use client";

import type { FincaBooking, Listing } from "@/lib/data";
import { bookingsOnDate, formatDateEs, rangesOverlap } from "@/lib/calendar";
import { cop } from "@/lib/format";

/** Equivalente a calAvailabilityPanel(): usa todas las reservas (sin filtro de finca). */
export function AvailabilityPanel({ fincas, allBookings, from, to }: {
  fincas: Listing[]; allBookings: FincaBooking[]; from: string; to: string;
}) {
  return (
    <div className="cal-side">
      <h4>Disponibilidad por rango</h4>
      <p className="cal-avail-sub">{formatDateEs(from)} → {formatDateEs(to)}</p>
      <div className="cal-avail-list">
        {fincas.map((f) => {
          const clash = allBookings.some((b) => b.fincaId === f.id && rangesOverlap(from, to, b.checkin, b.checkout));
          return (
            <div key={f.id} className="cal-avail-item">
              <span>{f.name}</span>
              <span className={"chip " + (clash ? "chip-bad" : "chip-ok")}>{clash ? "Reservada" : "Disponible"}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Equivalente a calSidePanel() cuando hay un día seleccionado. `bookings` ya viene filtrado por finca. */
export function DayDetailPanel({ date, bookings, fincaById }: {
  date: string | null; bookings: FincaBooking[]; fincaById: (id: string) => Listing | undefined;
}) {
  if (!date) {
    return (
      <div className="cal-side">
        <h4>Selecciona un día</h4>
        <p className="cal-empty">Haz clic en una fecha del calendario para ver sus reservas, o crea una nueva con el botón &quot;Nueva reserva&quot;.</p>
      </div>
    );
  }
  const onDay = bookingsOnDate(bookings, date);
  return (
    <div className="cal-side">
      <h4>{formatDateEs(date)}</h4>
      {onDay.length ? onDay.map((b) => {
        const f = fincaById(b.fincaId);
        const adults = b.adults as number | undefined;
        const children = b.children as number | undefined;
        const guestsLabel = adults != null
          ? (adults + " adulto(s)" + (children ? " · " + children + " niño(s)" : ""))
          : (b.guests + " huésped(es)");
        return (
          <div key={b.id} className="cal-booking-item">
            <b>{f ? f.name : b.fincaId}</b>
            <span>{b.guest} · {guestsLabel} · {b.phone || ""}</span>
            <span>Llegada {formatDateEs(b.checkin)} · {b.time}h  →  Salida {formatDateEs(b.checkout)}</span>
            <span>C.C./Pasaporte {b.cedula || "—"} · {b.email || "—"}</span>
            <span>{b.payMethod || "—"} · Total {cop(b.total || 0)} · Abono {cop(b.advance || 0)} · Saldo {cop(b.balance || 0)}</span>
          </div>
        );
      }) : <p className="cal-empty">Sin reservas para este día.</p>}
    </div>
  );
}
