import { cop } from "@/lib/format";
import { PayChip, StatusChip } from "./Chips";
import type { AdminBooking } from "./adminData";

/** Tabla de reservas (resumen y pestaña Reservas): las del panel de gestión y las solicitudes del sitio. */
export function ReservasTable({ rows, showBalance }: { rows: AdminBooking[]; showBalance?: boolean }) {
  if (!rows.length) return <p className="empty-note">Aún no hay reservas. Las que se creen en el panel de gestión aparecerán aquí automáticamente.</p>;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Código</th><th>Huésped</th><th>Finca / experiencia</th><th>Fechas</th><th>Huéspedes</th><th>Total</th>
            {showBalance && <th>Saldo</th>}
            <th>Pago</th><th>Estado</th><th>Origen</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((b) => (
            <tr key={b.origin + b.code}>
              <td>{b.code}</td><td className="wrap">{b.guest}</td><td className="wrap">{b.listing}</td><td>{b.dates}</td>
              <td className="tabular">{b.guests}</td><td className="tabular">{cop(b.total)}</td>
              {showBalance && <td className="tabular">{b.origin === "gestion" ? cop(b.balance || 0) : "—"}</td>}
              <td><PayChip pay={b.pay} /></td><td><StatusChip status={b.status} /></td>
              <td>{b.origin === "gestion" ? "Panel de gestión" : "Sitio web"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
