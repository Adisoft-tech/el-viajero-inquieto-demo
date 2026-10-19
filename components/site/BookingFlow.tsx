"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Icon } from "@/lib/icons";
import { useApp } from "@/lib/store";
import { ROUTES } from "@/lib/routes";
import { whatsappUrl } from "@/lib/whatsapp";
import { NotFound } from "./Detail";
import { useContent, useI18n, useSite, useVisibleListing, type BookingDraft } from "./SiteContext";
import { WhatsAppIcon } from "./WhatsAppIcon";
import type { Listing } from "@/lib/data";

const STEPS = ["Fechas", "Datos", "Reservar"];

/** Arma el mensaje de WhatsApp (en el idioma del visitante) con toda la info que llenó en el flujo. */
function buildWhatsAppMessage(l: Listing, isStay: boolean, b: BookingDraft, intro: string, t: (s: string) => string): string {
  const lines = [
    intro,
    "",
    t("Finca/Experiencia") + ": " + l.name,
    isStay ? t("Fechas") + ": " + (b.checkin || "—") + " → " + (b.checkout || "—") : t("Fecha") + ": " + (b.date || "—"),
    t("Huéspedes") + ": " + b.guests,
  ];
  if (b.name) lines.push(t("Nombre") + ": " + b.name);
  if (b.email) lines.push(t("Correo") + ": " + b.email);
  if (b.phone) lines.push(t("Teléfono") + ": " + b.phone);
  if (b.observaciones) lines.push(t("Observaciones") + ": " + b.observaciones);
  return lines.join("\n");
}

export function BookingFlow({ id }: { id: string }) {
  const router = useRouter();
  const l = useVisibleListing(id);
  const { setBookings, byId } = useApp();
  const content = useContent();
  const { t, price } = useI18n();
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
      guest: b.name || "Viajero Demo", listing: byId(l.id)?.name ?? l.name,
      dates: isStay ? (b.checkin || "—") + " → " + (b.checkout || "—") : (b.date || "—"),
      guests: b.guests, total, pay: "pendiente", status: "solicitud por whatsapp", createdAt: new Date().toISOString(),
    }, ...prev]);
    window.open(whatsappUrl(buildWhatsAppMessage(l, isStay, b, content.whatsappMessage, t), content.whatsappNumber), "_blank", "noopener,noreferrer");
    updateBooking({ step: 4 });
  }

  let body: React.ReactNode;
  if (step === 1) {
    body = (<>
      <h2>{t("Fechas y huéspedes")}</h2><p className="flow-sub">{t("Confirma cuándo viajas y cuántas personas te acompañan.")}</p>
      <div className="form-grid">
        {isStay ? (<>
          <div className="field"><label>{t("Llegada")}</label><input type="date" id="fCheckin" value={b.checkin} onChange={(e) => updateBooking({ checkin: e.target.value })} /></div>
          <div className="field"><label>{t("Salida")}</label><input type="date" id="fCheckout" value={b.checkout} onChange={(e) => updateBooking({ checkout: e.target.value })} /></div>
        </>) : (
          <div className="field full"><label>{t("Fecha")}</label><input type="date" id="fDate" value={b.date} onChange={(e) => updateBooking({ date: e.target.value })} /></div>
        )}
        <div className="field full">
          <label>{t("Huéspedes")}</label>
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
      <h2>{t("Tus datos")}</h2><p className="flow-sub">{t("Los usaremos para escribirte por WhatsApp y confirmar la reserva.")}</p>
      <div className="form-grid">
        <div className="field full"><label>{t("Nombre completo")}</label><input id="fName" placeholder={t("Como aparece en tu documento")} value={b.name} onChange={(e) => updateBooking({ name: e.target.value })} /></div>
        <div className="field"><label>{t("Correo electrónico")}</label><input id="fEmail" type="email" placeholder={t("tucorreo@email.com")} value={b.email} onChange={(e) => updateBooking({ email: e.target.value })} /></div>
        <div className="field"><label>{t("Teléfono")}</label><input id="fPhone" placeholder="+57 300 000 0000" value={b.phone} onChange={(e) => updateBooking({ phone: e.target.value })} /></div>
        <div className="field full"><label>{t("Observaciones")}</label><textarea id="fObservaciones" rows={3} placeholder={t("Algo que debamos saber: hora de llegada, ocasión especial, restricciones…")} value={b.observaciones} onChange={(e) => updateBooking({ observaciones: e.target.value })} /></div>
      </div>
    </>);
  } else if (step === 3) {
    body = (<>
      <h2>{t("Confirma tu reserva")}</h2><p className="flow-sub">{t("Revisa los datos y envíalos por WhatsApp a nuestro equipo para coordinar el pago y los detalles finales.")}</p>
      <div className="confirm-grid">
        <div className="row"><span>{t("Experiencia")}</span><b>{l.name}</b></div>
        <div className="row"><span>{t(isStay ? "Fechas" : "Fecha")}</span><b>{isStay ? (b.checkin || "—") + " → " + (b.checkout || "—") : (b.date || "—")}</b></div>
        <div className="row"><span>{t("Huéspedes")}</span><b>{b.guests}</b></div>
        {b.observaciones && <div className="row"><span>{t("Observaciones")}</span><b>{b.observaciones}</b></div>}
        <div className="row"><span>{t("Valor estimado")}</span><b className="tabular">{price(total)}</b></div>
      </div>
      <p style={{ fontSize: 13.5, color: "var(--text-muted)", marginTop: 14 }}>{t("No se procesa ningún pago en esta página — el valor es una referencia y se confirma directamente con nuestro equipo por WhatsApp.")}</p>
    </>);
  } else {
    body = (
      <div className="confirm-hero">
        <div className="confirm-check"><Icon name="check" /></div>
        <p className="eyebrow">{t("Te enviamos a WhatsApp")}</p>
        <p style={{ color: "var(--text-muted)", marginTop: 8, maxWidth: "40ch", marginInline: "auto", textAlign: "center" }}>{t("Si no se abrió automáticamente, escríbenos tú mismo — ya tenemos tus datos listos para coordinar la reserva.")}</p>
        <div className="confirm-grid" style={{ marginTop: 20 }}>
          <div className="row"><span>{t("Experiencia")}</span><b>{l.name}</b></div>
          <div className="row"><span>{t(isStay ? "Fechas" : "Fecha")}</span><b>{isStay ? (b.checkin || "—") + " → " + (b.checkout || "—") : (b.date || "—")}</b></div>
          <div className="row"><span>{t("Huéspedes")}</span><b>{b.guests}</b></div>
        </div>
        <div className="flow-actions" style={{ justifyContent: "center", gap: 12 }}>
          <a className="btn btn-accent" href={whatsappUrl(buildWhatsAppMessage(l, isStay, b, content.whatsappMessage, t), content.whatsappNumber)} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
            <WhatsAppIcon /> {t("Abrir WhatsApp")}
          </a>
          <button className="btn btn-ghost" onClick={() => router.push(ROUTES.home)}>{t("Volver al inicio")}</button>
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
            return <div key={s} className={"flow-step " + cls}><div className="flow-dot">{n < step ? "✓" : n}</div><div className="flow-label">{t(s)}</div></div>;
          })}
        </div>
      )}
      {/* key={step}: el panel se vuelve a montar y repite la animación fade-in como en el original */}
      <div className="flow-panel fade-in" key={step}>
        {body}
        {step < 4 && (
          <div className="flow-actions">
            {step > 1 ? <button className="btn btn-ghost" id="stepBack" onClick={() => updateBooking({ step: Math.max(1, step - 1) })}>{t("Atrás")}</button> : <span></span>}
            {step === 3 ? (
              <button className="btn btn-accent" id="stepNext" onClick={sendToWhatsApp} style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
                <WhatsAppIcon /> {t("Reservar por WhatsApp")}
              </button>
            ) : (
              <button className="btn btn-accent" id="stepNext" onClick={next}>{t("Continuar")}</button>
            )}
          </div>
        )}
      </div>
    </div></section>
  );
}
