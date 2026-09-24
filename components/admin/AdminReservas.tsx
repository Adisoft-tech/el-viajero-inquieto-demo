"use client";

import { useApp } from "@/lib/store";
import { ReservasTable } from "./ReservasTable";

export function AdminReservas() {
  const { bookings } = useApp();
  return (
    <div className="fade-in">
      <div className="admin-head"><div><h1>Reservas</h1><p>Todas las reservas creadas desde la plataforma.</p></div></div>
      <div className="panel"><ReservasTable rows={bookings} withActions /></div>
    </div>
  );
}
