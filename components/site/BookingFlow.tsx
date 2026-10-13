"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { cop } from "@/lib/format";
import { Icon } from "@/lib/icons";
import { useApp } from "@/lib/store";
import { ROUTES } from "@/lib/routes";
import { whatsappUrl } from "@/lib/whatsapp";
import { NotFound } from "./Detail";
import { useSite, useVisibleListing, type BookingDraft } from "./SiteContext";
import { WhatsAppIcon } from "./WhatsAppIcon";
import type { Listing } from "@/lib/data";

const STEPS = ["Fechas", "Datos", "Reservar"];

/** Arma el mensaje de WhatsApp con toda la info que la persona llenó en el flujo. */
function buildWhatsAppMessage(l: Listing, isStay: boolean, b: BookingDraft, intro: string): string {
  const lines = [
    intro,
    "",
    "Finca/Experiencia: " + l.name,
    isStay ? "Fechas: " + (b.checkin || "—") + " → " + (b.checkout || "—") : "Fecha: " + (b.date || "—"),
    "Huéspedes: " + b.guests,
  ];
  if (b.name) lines.push("Nombre: " + b.name);
  if (b.email) lines.push("Correo: " + b.email);
  if (b.phone) lines.push("Teléfono: " + b.phone);
  if (b.observaciones) lines.push("Observaciones: " + b.observaciones);
  return lines.join("\n");
}

export function BookingFlow({ id }: { id: string }) {
  const router = useRouter();
  const l = useVisibleListing(id);
  const { setBookings, content } = useApp();
  const { booking: b, updateBooking } = useSite();

  // Si se entra directo por URL a otro listado, el flujo arranca en el paso 1
  const sameListing = b.listingId === id;
  useEffect(() => {
    if (!sameListing) updateBooking({ listingId: id, step: 1 });
  }, [sameListing, id, updateBooking]);

  if (!l) return <NotFound />;
  const step = sameListing ? b.step : 1;
  const isStay = l.cat === "alojamientos";
  const total = Math.round(l.price * b.guests);

  function next() {
    updateBooking({ step: step + 1 });
  }

  function sendToWhatsApp() {
    if (!l) return;
    setBookings((prev) => [{
      code: "VJI-" + Math.floor(2000 + Math.random() * 7999),
      guest: b.name || "Viajero Demo", listing: l.name,
      dates: isStay ? (b.checkin || "—") + " → " + (b.checkout || "—") : (b.date || "—"),
      guests: b.guests, total, pay: "pendiente", status: "solicitud por whatsapp", createdAt: new Date().toISOString(),
    }, ...prev]);
    window.open(whatsappUrl(buildWhatsAppMessage(l, isStay, b, content.whatsappMessage), content.whatsappNumber), "_blank", "noopener,noreferrer");
    updateBooking({ step: 4 });
  }

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
      <h2>Tus datos</h2><p className="flow-sub">Los usaremos para escribirte por WhatsApp y confirmar la reserva.</p>
      <div className="form-grid">
        <div className="field full"><label>Nombre completo</label><input id="fName" placeholder="Como aparece en tu documento" value={b.name} onChange={(e) => updateBooking({ name: e.target.value })} /></div>
        <div className="field"><label>Correo electrónico</label><input id="fEmail" type="email" placeholder="tucorreo@email.com" value={b.email} onChange={(e) => updateBooking({ email: e.target.value })} /></div>
        <div className="field"><label>Teléfono</label><input id="fPhone" placeholder="+57 300 000 0000" value={b.phone} onChange={(e) => updateBooking({ phone: e.target.value })} /></div>
        <div className="field full"><label>Observaciones</label><textarea id="fObservaciones" rows={3} placeholder="Algo que debamos saber: hora de llegada, ocasión especial, restricciones…" value={b.observaciones} onChange={(e) => updateBooking({ observaciones: e.target.value })} /></div>
      </div>
    </>);
  } else if (step === 3) {
    body = (<>
      <h2>Confirma tu reserva</h2><p className="flow-sub">Revisa los datos y envíalos por WhatsApp a nuestro equipo para coordinar el pago y los detalles finales.</p>
      <div className="confirm-grid">
        <div className="row"><span>Experiencia</span><b>{l.name}</b></div>
        <div className="row"><span>{isStay ? "Fechas" : "Fecha"}</span><b>{isStay ? (b.checkin || "—") + " → " + (b.checkout || "—") : (b.date || "—")}</b></div>
        <div className="row"><span>Huéspedes</span><b>{b.guests}</b></div>
        {b.observaciones && <div className="row"><span>Observaciones</span><b>{b.observaciones}</b></div>}
        <div className="row"><span>Valor estimado</span><b className="tabular">{cop(total)}</b></div>
      </div>
      <p style={{ fontSize: 13.5, color: "var(--text-muted)", marginTop: 14 }}>No se procesa ningún pago en esta página — el valor es una referencia y se confirma directamente con nuestro equipo por WhatsApp.</p>
    </>);
  } else {
    body = (
      <div className="confirm-hero">
        <div className="confirm-check"><Icon name="check" /></div>
        <p className="eyebrow">Te enviamos a WhatsApp</p>
        <p style={{ color: "var(--text-muted)", marginTop: 8, maxWidth: "40ch", marginInline: "auto", textAlign: "center" }}>Si no se abrió automáticamente, escríbenos tú mismo — ya tenemos tus datos listos para coordinar la reserva.</p>
        <div className="confirm-grid" style={{ marginTop: 20 }}>
          <div className="row"><span>Experiencia</span><b>{l.name}</b></div>
          <div className="row"><span>{isStay ? "Fechas" : "Fecha"}</span><b>{isStay ? (b.checkin || "—") + " → " + (b.checkout || "—") : (b.date || "—")}</b></div>
          <div className="row"><span>Huéspedes</span><b>{b.guests}</b></div>
        </div>
        <div className="flow-actions" style={{ justifyContent: "center", gap: 12 }}>
          <a className="btn btn-accent" href={whatsappUrl(buildWhatsAppMessage(l, isStay, b, content.whatsappMessage), content.whatsappNumber)} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
            <WhatsAppIcon /> Abrir WhatsApp
          </a>
          <button className="btn btn-ghost" onClick={() => router.push(ROUTES.home)}>Volver al inicio</button>
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
            {step === 3 ? (
              <button className="btn btn-accent" id="stepNext" onClick={sendToWhatsApp} style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
                <WhatsAppIcon /> Reservar por WhatsApp
              </button>
            ) : (
              <button className="btn btn-accent" id="stepNext" onClick={next}>Continuar</button>
            )}
          </div>
        )}
      </div>
    </div></section>
  );
}
