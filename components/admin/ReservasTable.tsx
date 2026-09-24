import type { Booking } from "@/lib/data";
import { cop } from "@/lib/format";
import { Icon } from "@/lib/icons";
import { PayChip, StatusChip } from "./Chips";

/** Tabla de reservas (resumen y pestaña Reservas). El botón de ver no tenía acción en el original. */
export function ReservasTable({ rows, withActions }: { rows: Booking[]; withActions: boolean }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Código</th><th>Huésped</th><th>Experiencia</th><th>Fechas</th><th>Huéspedes</th><th>Total</th><th>Pago</th><th>Estado</th>
            {withActions && <th></th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((b) => (
            <tr key={b.code}>
              <td>{b.code}</td><td className="wrap">{b.guest}</td><td className="wrap">{b.listing}</td><td>{b.dates}</td>
              <td className="tabular">{b.guests}</td><td className="tabular">{cop(b.total)}</td>
              <td><PayChip pay={b.pay} /></td><td><StatusChip status={b.status} /></td>
              {withActions && (
                <td><div className="row-actions"><button className="icon-btn" data-viewbooking={b.code}><Icon name="eye" /></button></div></td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
