"use client";

import { DEMO_TODAY, MONTHS_ES, type FincaBooking, type Listing } from "@/lib/data";
import { formatDateEs, isoDate } from "@/lib/calendar";
import { Icon } from "@/lib/icons";

/** Equivalente a calAvailabilityMatrix(): mapa finca × día del mes (todas las reservas, sin filtro). */
export function AvailabilityMatrix({ year: y, month: m, fincas, allBookings, selectedDate, onSelect, onPrevMonth, onNextMonth }: {
  year: number; month: number; fincas: Listing[]; allBookings: FincaBooking[];
  selectedDate: string | null; onSelect: (iso: string) => void;
  onPrevMonth: () => void; onNextMonth: () => void;
}) {
  const daysThis = new Date(y, m + 1, 0).getDate();
  const days = Array.from({ length: daysThis }, (_, i) => isoDate(y, m, i + 1));
  return (
    <div className="panel avail-panel" style={{ marginTop: 24 }}>
      <div className="panel-head">
        <h3>Mapa de disponibilidad — {MONTHS_ES[m]} {y}</h3>
        <div className="avail-legend">
          <span><span className="avail-legend-dot free"></span>Disponible</span>
          <span><span className="avail-legend-dot occupied"></span>Reservada</span>
        </div>
        <div className="cal-nav">
          <button type="button" aria-label="Mes anterior" onClick={onPrevMonth}><Icon name="chevLeft" /></button>
          <button type="button" aria-label="Mes siguiente" onClick={onNextMonth}><Icon name="chevRight" /></button>
        </div>
      </div>
      <p className="cal-avail-sub">Pasa el cursor o toca un día para ver el detalle · haz clic para abrirlo abajo.</p>
      <div className="avail-scroll">
        <div className="avail-grid">
          <div className="avail-row avail-row-head">
            <div className="avail-row-label"></div>
            <div className="avail-row-cells">
              {days.map((iso, i) => (
                <div key={iso} className={"avail-cell avail-daynum" + (iso === DEMO_TODAY ? " today" : "")}>{i + 1}</div>
              ))}
            </div>
          </div>
          {fincas.map((f) => (
            <div key={f.id} className="avail-row">
              <div className="avail-row-label">{f.name}</div>
              <div className="avail-row-cells">
                {days.map((iso) => {
                  const booking = allBookings.find((b) => b.fincaId === f.id && iso >= b.checkin && iso <= b.checkout);
                  const cls = "avail-cell avail-day" + (booking ? " occupied" : " free") + (iso === selectedDate ? " selected" : "") + (iso === DEMO_TODAY ? " today" : "");
                  const tip = f.name + " · " + formatDateEs(iso) + (booking ? " · Reservada por " + booking.guest : " · Disponible");
                  return <button key={iso} type="button" className={cls} data-caldate={iso} title={tip} onClick={() => onSelect(iso)}></button>;
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
