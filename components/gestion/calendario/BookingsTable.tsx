"use client";

import type { FincaBooking, Listing } from "@/lib/data";
import { BOOKING_COLUMNS, formatDateEs, sortBookings } from "@/lib/calendar";
import { Icon } from "@/lib/icons";
import { cop } from "@/lib/format";

/** Equivalente a upcomingBookingsTable(): tabla ordenable y paginada. `bookings` ya viene filtrado por finca. */
export function BookingsTable({ bookings, fincaById, sortKey, sortDir, page, pageSize, onSort, onPage }: {
  bookings: FincaBooking[]; fincaById: (id: string) => Listing | undefined;
  sortKey: string; sortDir: "asc" | "desc"; page: number; pageSize: number;
  onSort: (key: string) => void; onPage: (page: number) => void;
}) {
  const fincaName = (id: string) => { const f = fincaById(id); return f ? f.name : id; };
  const all = sortBookings(bookings, sortKey || "checkin", sortDir, fincaName);
  const totalPages = Math.max(1, Math.ceil(all.length / pageSize));
  const current = Math.min(Math.max(page, 1), totalPages);
  const start = (current - 1) * pageSize;
  const rows = all.slice(start, start + pageSize);

  return (
    <>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {BOOKING_COLUMNS.map((col) => {
                const active = (sortKey || "checkin") === col.key;
                return (
                  <th key={col.key} className={"cal-th-sort" + (active ? " active" : "")} data-sortkey={col.key} onClick={() => onSort(col.key)}>
                    {col.label}{active ? <span className="cal-th-arrow">{sortDir === "asc" ? "↑" : "↓"}</span> : null}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.length ? rows.map((b) => (
              <tr key={b.id}>
                <td className="wrap">{fincaName(b.fincaId)}</td>
                <td className="wrap">{b.guest}</td>
                <td>{b.cedula || "—"}</td>
                <td className="wrap">{b.email || "—"}</td>
                <td>{formatDateEs(b.checkin)}</td>
                <td>{formatDateEs(b.checkout)}</td>
                <td>{b.time}</td>
                <td className="tabular">{b.guests}</td>
                <td>{b.payMethod || "—"}</td>
                <td className="tabular">{cop(b.total || 0)}</td>
                <td className="tabular">{cop(b.advance || 0)}</td>
                <td className="tabular">{cop(b.balance || 0)}</td>
              </tr>
            )) : (
              <tr><td colSpan={12}><p className="empty-note">No hay reservas para esta finca.</p></td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="cal-pager">
        <span className="cal-pager-count">{all.length} reserva(s){totalPages > 1 ? " · página " + current + " de " + totalPages : ""}</span>
        {totalPages > 1 ? (
          <div className="cal-pager-nav">
            <button type="button" className="icon-btn" id="calPagePrev" disabled={current <= 1} onClick={() => onPage(Math.max(1, current - 1))}><Icon name="chevLeft" /></button>
            <button type="button" className="icon-btn" id="calPageNext" disabled={current >= totalPages} onClick={() => onPage(current + 1)}><Icon name="chevRight" /></button>
          </div>
        ) : null}
      </div>
    </>
  );
}
