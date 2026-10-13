"use client";

import { useAdminBookings } from "./adminData";
import { ReservasTable } from "./ReservasTable";

export function AdminReservas() {
  const { rows, status, reload } = useAdminBookings();
  return (
    <div className="fade-in">
      <div className="admin-head"><div><h1>Reservas</h1><p>Las reservas creadas en el panel de gestión (calendario) y las solicitudes que llegan desde el sitio web.</p></div></div>
      <div className="panel">
        {status === "loading" || status === "idle" ? <p className="empty-note">Cargando reservas…</p>
          : status === "error" ? <p className="empty-note">No se pudieron cargar las reservas del panel de gestión. <button type="button" className="btn btn-ghost btn-sm" onClick={() => void reload()}>Reintentar</button></p>
          : <ReservasTable rows={rows} showBalance />}
      </div>
    </div>
  );
}
