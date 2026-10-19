"use client";

import { useState } from "react";
import { createFincaBooking } from "@/lib/actions/gestion";
import { Icon } from "@/lib/icons";
import { useApp } from "@/lib/store";
import { BookingForm, type NewBooking } from "@/components/gestion/calendario/BookingForm";
import { useAdminBookings } from "./adminData";
import { Modal } from "./Modal";
import { ReservasTable } from "./ReservasTable";

export function AdminReservas() {
  const { rows, status, reload } = useAdminBookings();
  const { listings, setFincaBookings, authed, toast } = useApp();
  const [formOpen, setFormOpen] = useState(false);
  const fincas = listings.filter((l) => l.cat === "alojamientos");

  /** Se guarda en la misma tabla que usa el calendario, así que aparece también en el panel de gestión. */
  async function save(b: NewBooking) {
    let saved;
    try { saved = await authed(createFincaBooking, b); } catch (err) {
      console.error(err);
      toast("No se pudo guardar la reserva. Revisa tu conexión e inténtalo de nuevo.");
      return;
    }
    setFincaBookings((prev) => [...prev, saved]);
    setFormOpen(false);
    toast("Reserva creada para " + (fincas.find((f) => f.id === b.fincaId)?.name ?? "la finca") + " · ya aparece en el calendario de gestión");
  }

  return (
    <div className="fade-in">
      <div className="admin-head">
        <div><h1>Reservas</h1><p>Las reservas del panel de gestión (calendario) y las solicitudes que llegan desde el sitio web. Lo que crees aquí aparece también en el calendario de gestión.</p></div>
        <button className="btn btn-primary btn-sm" id="admNewBooking" onClick={() => setFormOpen(true)} disabled={!fincas.length}><Icon name="plus" /> Nueva reserva</button>
      </div>
      <div className="panel">
        {status === "loading" || status === "idle" ? <p className="empty-note">Cargando reservas…</p>
          : status === "error" ? <p className="empty-note">No se pudieron cargar las reservas del panel de gestión. <button type="button" className="btn btn-ghost btn-sm" onClick={() => void reload()}>Reintentar</button></p>
          : <ReservasTable rows={rows} showBalance />}
      </div>
      {formOpen && (
        <Modal label="Nueva reserva" width={760} onClose={() => setFormOpen(false)}>
          <BookingForm
            fincas={fincas} defaultFincaId={fincas[0]?.id ?? ""} defaultCheckin={new Date().toLocaleDateString("en-CA")}
            onClose={() => setFormOpen(false)} onSave={save} onError={toast}
          />
        </Modal>
      )}
    </div>
  );
}
