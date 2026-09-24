"use client";

import { DEMO_TODAY, WEEKDAYS_ES, type FincaBooking, type Listing } from "@/lib/data";
import { bookingsOnDate, isoDate } from "@/lib/calendar";

/** Equivalente a dayCell(): los días del mes adyacente también muestran ocupación. */
function DayCell({ dnum, otherMonth, iso, bookings, selectedDate, fincaById, onSelect }: {
  dnum: number; otherMonth: boolean; iso: string; bookings: FincaBooking[]; selectedDate: string | null;
  fincaById: (id: string) => Listing | undefined; onSelect: (iso: string) => void;
}) {
  const onDay = bookingsOnDate(bookings, iso);
  const cls = "cal-day" + (otherMonth ? " other-month" : "") + (iso === DEMO_TODAY ? " today" : "") + (iso === selectedDate ? " selected" : "");
  return (
    <div className={cls} data-caldate={iso} onClick={() => onSelect(iso)}>
      <div className="cal-day-num">{dnum}</div>
      {onDay.slice(0, 3).map((b) => {
        const f = fincaById(b.fincaId);
        const short = f ? f.name.replace(/^(Finca|Cabañas|Hacienda|Refugio)\s+/, "") : b.fincaId;
        return <span key={b.id} className="cal-chip">{short}</span>;
      })}
      {onDay.length > 3 ? <span className="cal-chip-more">+{onDay.length - 3} más</span> : null}
    </div>
  );
}

/** Equivalente a calGrid(). `bookings` ya viene filtrado por finca. */
export function CalendarGrid({ year: y, month: m, bookings, selectedDate, fincaById, onSelect }: {
  year: number; month: number; bookings: FincaBooking[]; selectedDate: string | null;
  fincaById: (id: string) => Listing | undefined; onSelect: (iso: string) => void;
}) {
  const startWeekday = (new Date(y, m, 1).getDay() + 6) % 7;
  const daysThis = new Date(y, m + 1, 0).getDate();
  const daysPrev = new Date(y, m, 0).getDate();
  const prevY = m === 0 ? y - 1 : y, prevM = m === 0 ? 11 : m - 1;
  const nextY = m === 11 ? y + 1 : y, nextM = m === 11 ? 0 : m + 1;
  const cells: { d: number; other: boolean; iso: string }[] = [];
  for (let i = startWeekday - 1; i >= 0; i--) { const d = daysPrev - i; cells.push({ d, other: true, iso: isoDate(prevY, prevM, d) }); }
  for (let d = 1; d <= daysThis; d++) cells.push({ d, other: false, iso: isoDate(y, m, d) });
  const trailing = (7 - ((startWeekday + daysThis) % 7)) % 7;
  for (let d = 1; d <= trailing; d++) cells.push({ d, other: true, iso: isoDate(nextY, nextM, d) });
  const common = { bookings, selectedDate, fincaById, onSelect };
  return (
    <div className="cal-grid">
      {WEEKDAYS_ES.map((w) => <div key={w} className="cal-daylabel">{w}</div>)}
      {cells.map((c) => <DayCell key={c.iso} dnum={c.d} otherMonth={c.other} iso={c.iso} {...common} />)}
    </div>
  );
}
