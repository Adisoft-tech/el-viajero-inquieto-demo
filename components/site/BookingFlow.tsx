"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { cop } from "@/lib/format";
import { Icon } from "@/lib/icons";
import { useApp } from "@/lib/store";
import { ROUTES } from "@/lib/routes";
import { NotFound } from "./Detail";
import { useSite, useVisibleListing, type PayMethod } from "./SiteContext";

const STEPS = ["Fechas", "Datos", "Pago", "Confirmación"];
const PAY_LABEL: Record<PayMethod, string> = { card: "Tarjeta", pse: "PSE", nequi: "Nequi" };

export function BookingFlow({ id }: { id: string }) {
  const router = useRouter();
  const l = useVisibleListing(id);
  const { setBookings } = useApp();
  const { booking: b, updateBooking } = useSite();

  // Si se entra directo por URL a otro listado, el flujo arranca en el paso 1
  const sameListing = b.listingId === id;
  useEffect(() => {
    if (!sameListing) updateBooking({ listingId: id, step: 1 });
  }, [sameListing, id, updateBooking]);

  if (!l) return <NotFound />;
  const step = sameListing ? b.step : 1;
  const isStay = l.cat === "alojamientos";
  const subtotal = l.price * b.guests;
  const fee = Math.round(subtotal * 0.05);
  const total = subtotal + fee;

  function next() {
    if (!l) return;
    if (step === 3) {
      const code = "VJI-" + Math.floor(2000 + Math.random() * 7999);
      setBookings((prev) => [{
        code, guest: b.name || "Viajero Demo", listing: l.name,
        dates: isStay ? (b.checkin || "—") + " → " + (b.checkout || "—") : (b.date || "—"),
        guests: b.guests, total: Math.round(l.price * b.guests * 1.05), pay: "pagado", status: "confirmada",
      }, ...prev]);
      updateBooking({ lastCode: code, step: 4 });
    } else {
      updateBooking({ step: step + 1 });
    }
  }

  const payOpt = (icon: string, val: PayMethod, label: string) => (
    <div className={"pay-opt" + (b.payMethod === val ? " selected" : "")} onClick={() => updateBooking({ payMethod: val })}>
      <Icon name={icon} /><span>{label}</span>
    </div>
  );

  let body: React.ReactNode;
  if (step === 1) {
    body = (<>
      <h2>Fechas y huéspedes</h2><p className="flow-sub">Confirma cuándo viajas y cuántas personas te acompañan.</p>
      <div className="form-grid">
        {isStay ? (<>
          <div className="field"><label>Llegada</label><input type="date" id="fCheckin" value={b.checkin} onChange={(e) => updateBooking({ checkin: e.target.value })} /></div>
          <div className="field"><label>Salida</label><input type="date" id="fCheckout" value={b.checkout} onChange={(e) => updateBooking({ checkout: e.target.value })} /></div>
        </>) : (
          <div className="field full"><label>Fecha</label><input type="date" id="fDate" value={b.date} onChange={(e) => updateBooking({ date: e.target.value })} /></div>
        )}
        <div className="field full">
          <label>Huéspedes</label>
          <div className="stepper">
            <button type="button" onClick={() => updateBooking({ guests: Math.max(1, b.guests - 1) })}>−</button>
            <span id="fgCount" className="tabular">{b.guests}</span>
            <button type="button" onClick={() => updateBooking({ guests: Math.min(20, b.guests + 1) })}>+</button>
          </div>
        </div>
      </div>
    </>);
  } else if (step === 2) {
    body = (<>
      <h2>Tus datos</h2><p className="flow-sub">Los usaremos para confirmar la reserva y enviarte el comprobante.</p>
      <div className="form-grid">
        <div className="field full"><label>Nombre completo</label><input id="fName" placeholder="Como aparece en tu documento" value={b.name} onChange={(e) => updateBooking({ name: e.target.value })} /></div>
        <div className="field"><label>Correo electrónico</label><input id="fEmail" type="email" placeholder="tucorreo@email.com" value={b.email} onChange={(e) => updateBooking({ email: e.target.value })} /></div>
        <div className="field"><label>Teléfono</label><input id="fPhone" placeholder="+57 300 000 0000" value={b.phone} onChange={(e) => updateBooking({ phone: e.target.value })} /></div>
      </div>
    </>);
  } else if (step === 3) {
    body = (<>
      <h2>Método de pago</h2><p className="flow-sub">Elige cómo quieres pagar. El cobro lo procesa Wompi de forma segura.</p>
      <div className="pay-methods">
        {payOpt("card", "card", "Tarjeta")}{payOpt("bank", "pse", "PSE")}{payOpt("phone", "nequi", "Nequi")}
      </div>
      {b.payMethod === "card" ? (
        <div className="form-grid">
          <div className="field full"><label>Número de tarjeta</label><input id="fCard" placeholder="4111 1111 1111 1111" /></div>
          <div className="field"><label>Vencimiento</label><input id="fExp" placeholder="MM/AA" /></div>
          <div className="field"><label>CVV</label><input id="fCvv" placeholder="123" /></div>
        </div>
      ) : (
        <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>Serás redirigido a tu entidad financiera para confirmar el pago de forma segura (simulado en esta demo).</p>
      )}
      <div className="wompi-badge"><span className="wompi-dot"></span>Pago procesado por <b>Wompi</b> · conexión cifrada</div>
    </>);
  } else {
    body = (
      <div className="confirm-hero">
        <div className="confirm-check"><Icon name="check" /></div>
        <p className="eyebrow">Reserva confirmada</p>
        <div className="confirm-code">{b.lastCode || "VJI-0000"}</div>
        <p style={{ color: "var(--text-muted)", marginTop: 8 }}>Enviamos el comprobante a {b.email || "tu correo"}</p>
        <div className="confirm-grid">
          <div className="row"><span>Experiencia</span><b>{l.name}</b></div>
          <div className="row"><span>{isStay ? "Fechas" : "Fecha"}</span><b>{isStay ? (b.checkin || "—") + " → " + (b.checkout || "—") : (b.date || "—")}</b></div>
          <div className="row"><span>Huéspedes</span><b>{b.guests}</b></div>
          <div className="row"><span>Método de pago</span><b>{PAY_LABEL[b.payMethod]}</b></div>
          <div className="row"><span>Total pagado</span><b className="tabular">{cop(total)}</b></div>
        </div>
        <div className="flow-actions" style={{ justifyContent: "center" }}>
          <button className="btn btn-primary" onClick={() => router.push(ROUTES.home)}>Volver al inicio</button>
        </div>
      </div>
    );
  }

  return (
    <section className="section" style={{ paddingTop: 40 }}><div className="flow-wrap container">
      {step < 4 && (
        <div className="flow-steps">
          {STEPS.map((s, i) => {
            const n = i + 1;
            const cls = n < step ? "done" : n === step ? "current" : "";
            return <div key={s} className={"flow-step " + cls}><div className="flow-dot">{n < step ? "✓" : n}</div><div className="flow-label">{s}</div></div>;
          })}
        </div>
      )}
      {/* key={step}: el panel se vuelve a montar y repite la animación fade-in como en el original */}
      <div className="flow-panel fade-in" key={step}>
        {body}
        {step < 4 && (
          <div className="flow-actions">
            {step > 1 ? <button className="btn btn-ghost" id="stepBack" onClick={() => updateBooking({ step: Math.max(1, step - 1) })}>Atrás</button> : <span></span>}
            <button className="btn btn-accent" id="stepNext" onClick={next}>{step === 3 ? "Pagar " + cop(total) : "Continuar"}</button>
          </div>
        )}
      </div>
    </div></section>
  );
}
