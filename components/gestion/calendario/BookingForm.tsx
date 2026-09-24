"use client";

import { useState } from "react";
import type { FincaBooking, Listing } from "@/lib/data";
import { Icon } from "@/lib/icons";
import { cop } from "@/lib/format";

/** Reserva sin id (el id lo asigna el calendario al guardar). */
export type NewBooking = { [K in keyof FincaBooking as string extends K ? never : K extends "id" ? never : K]: FincaBooking[K] } & { adults: number; children: number };

/** Equivalente a calBookingForm() + el handler de calSaveBtn. */
export function BookingForm({ fincas, defaultFincaId, defaultCheckin, onClose, onSave, onError }: {
  fincas: Listing[]; defaultFincaId: string; defaultCheckin: string;
  onClose: () => void; onSave: (b: NewBooking) => void; onError: (msg: string) => void;
}) {
  const [fincaId, setFincaId] = useState(defaultFincaId || fincas[0]?.id || "");
  const [guest, setGuest] = useState("");
  const [cedula, setCedula] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [checkin, setCheckin] = useState(defaultCheckin);
  const [checkout, setCheckout] = useState("");
  const [time, setTime] = useState("15:00");
  const [adults, setAdults] = useState("2");
  const [children, setChildren] = useState("0");
  const [payMethod, setPayMethod] = useState("Transferencia");
  const [total, setTotal] = useState("");
  const [advance, setAdvance] = useState("");

  const balance = Math.max((parseFloat(total) || 0) - (parseFloat(advance) || 0), 0);

  function save() {
    const g = guest.trim();
    const a = parseInt(adults, 10) || 1;
    const ch = parseInt(children, 10) || 0;
    const t = parseFloat(total) || 0;
    const adv = parseFloat(advance) || 0;
    if (!g) { onError("Escribe el nombre del huésped"); return; }
    if (!checkin || !checkout || checkout <= checkin) { onError("Revisa las fechas de llegada y salida"); return; }
    onSave({
      fincaId, guest: g, cedula: cedula.trim(), phone: phone.trim(), email: email.trim(),
      checkin, checkout, time: time || "15:00", guests: a + ch, adults: a, children: ch,
      payMethod, total: t, advance: adv, balance: Math.max(t - adv, 0),
    });
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <h3>Nueva reserva</h3>
        <button className="icon-btn" id="calFormClose" aria-label="Cerrar" onClick={onClose}><Icon name="close" /></button>
      </div>
      <div className="form-grid">
        <div className="field full"><label>Finca</label>
          <select id="calFinca" value={fincaId} onChange={(e) => setFincaId(e.target.value)}>
            {fincas.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </div>
        <div className="field"><label>Nombre completo</label><input id="calGuest" placeholder="Nombre del huésped" value={guest} onChange={(e) => setGuest(e.target.value)} /></div>
        <div className="field"><label>Cédula / Pasaporte</label><input id="calCedula" placeholder="C.C. 0000000" value={cedula} onChange={(e) => setCedula(e.target.value)} /></div>
        <div className="field"><label>Celular</label><input id="calPhone" placeholder="300 000 0000" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
        <div className="field"><label>Correo</label><input id="calEmail" type="email" placeholder="correo@ejemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div className="field"><label>Llegada</label>
          <input id="calCheckin" type="date" value={checkin} onChange={(e) => {
            const v = e.target.value;
            setCheckin(v);
            if (checkout && checkout < v) setCheckout("");
          }} />
        </div>
        <div className="field"><label>Salida</label><input id="calCheckout" type="date" min={checkin} value={checkout} onChange={(e) => setCheckout(e.target.value)} /></div>
        <div className="field"><label>Hora de llegada</label><input id="calTime" type="time" value={time} onChange={(e) => setTime(e.target.value)} /></div>
        <div className="field"><label>Adultos</label><input id="calAdults" type="number" min={1} value={adults} onChange={(e) => setAdults(e.target.value)} /></div>
        <div className="field"><label>Niños</label><input id="calChildren" type="number" min={0} value={children} onChange={(e) => setChildren(e.target.value)} /></div>
        <div className="cal-form-subhead">Información de pago</div>
        <div className="field"><label>Forma de pago</label>
          <select id="calPayMethod" value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
            <option value="Transferencia">Transferencia</option><option value="Efectivo">Efectivo</option>
            <option value="Contado">Contado</option><option value="Crédito">Crédito</option>
          </select>
        </div>
        <div className="field"><label>Valor total</label><input id="calTotal" type="number" min={0} step={10000} placeholder="0" value={total} onChange={(e) => setTotal(e.target.value)} /></div>
        <div className="field"><label>Abona (anticipo)</label><input id="calAdvance" type="number" min={0} step={10000} placeholder="0" value={advance} onChange={(e) => setAdvance(e.target.value)} /></div>
        <div className="field"><label>Saldo pendiente</label><input id="calBalance" className="cal-readonly" type="text" value={cop(balance)} readOnly /></div>
      </div>
      <button className="btn btn-accent" style={{ marginTop: 16 }} id="calSaveBtn" onClick={save}>Guardar reserva</button>
    </div>
  );
}
