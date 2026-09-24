"use client";

// Port de adminDocumentos() / docTypeTab() / docForm() / docPreviewPanel() y de los handlers
// de Documentos en bindGestion(). La vista previa se deriva del estado en cada tecla.

import { useState } from "react";
import { DEMO_TODAY, DOC_ILLUSTRATIONS, EMISOR } from "@/lib/data";
import { cop, copWords } from "@/lib/format";
import { Icon } from "@/lib/icons";
import { useApp } from "@/lib/store";
import { docCounter, docTypeLabelUpper, formatDateEs, generateDocPDF, type DocType } from "@/lib/pdf";
import { newItem, useDocsState, type DocsState } from "./DocsState";

type Update = (fn: (d: DocsState) => DocsState) => void;
type TextField =
  | "fecha" | "cliente" | "clienteId" | "formaPago" | "validoHasta" | "clienteCelular"
  | "clienteCorreo" | "clienteDireccion" | "clienteCiudad" | "objeto" | "observaciones";

const ITEMS_LABEL_STYLE: React.CSSProperties = {
  display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8,
  textTransform: "uppercase", letterSpacing: ".05em",
};
const TEXTAREA_STYLE: React.CSSProperties = {
  width: "100%", border: "1px solid var(--border-strong)", background: "var(--surface-sunken)", color: "var(--text)",
  borderRadius: "var(--radius-s)", padding: "10px 12px", fontFamily: "var(--font-body)", fontSize: 14,
};

function DocTypeTab({ d, k, label, update }: { d: DocsState; k: DocType; label: string; update: Update }) {
  return (
    <button type="button" className={"doc-type-tab" + (d.type === k ? " active" : "")} data-doctype={k}
      onClick={() => update((s) => ({ ...s, type: k }))}>{label}</button>
  );
}

function DocForm({ d, update, onDownload, busy }: { d: DocsState; update: Update; onDownload: () => void; busy: boolean }) {
  const type = d.type;
  const counter = docCounter(d);
  const typeLabel = type === "cotizacion" ? "Cotización" : type === "cobro" ? "Cuenta de cobro" : "Cuenta de pago";
  const clienteLabel = type === "pago" ? "Beneficiario (a quién se paga)" : type === "cobro" ? "Cobrar a" : "Cliente / Razón social";
  const titleText = type === "cotizacion" ? typeLabel : (typeLabel + " No. " + counter);
  const itemsLabel = type === "cotizacion" ? "Ítems de la cotización" : type === "cobro" ? "Ítems a cobrar" : "Ítems del pago";

  const set = (field: TextField) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const v = e.target.value;
    update((s) => ({ ...s, [field]: v }));
  };
  const setItem = (idx: number, field: "desc" | "qty" | "price", raw: string) => {
    update((s) => ({
      ...s,
      items: s.items.map((it, i) => i !== idx ? it : field === "desc" ? { ...it, desc: raw } : { ...it, [field]: parseFloat(raw) || 0 }),
    }));
  };
  const removeItem = (idx: number) => {
    update((s) => {
      const items = s.items.filter((_, i) => i !== idx);
      if (!items.length) items.push(newItem());
      return { ...s, items };
    });
  };

  return (
    <div className="panel">
      <div className="panel-head"><h3>{titleText}</h3></div>
      <div className="form-grid">
        <div className="field"><label>Fecha</label><input id="docFecha" type="date" value={d.fecha || DEMO_TODAY} onChange={set("fecha")} /></div>
        <div className="field"><label>{clienteLabel}</label><input id="docCliente" placeholder="Nombre o empresa" value={d.cliente || ""} onChange={set("cliente")} /></div>
        <div className="field"><label>Cédula / NIT (opcional)</label><input id="docClienteId" placeholder="C.C. o NIT" value={d.clienteId || ""} onChange={set("clienteId")} /></div>
        {type !== "cotizacion" ? (
          <div className="field"><label>Forma de pago</label>
            <select id="docFormaPago" value={d.formaPago || "Transferencia"} onChange={set("formaPago")}>
              {["Transferencia", "Efectivo", "Nequi"].map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
        ) : (
          <>
            <div className="field"><label>Válida hasta</label><input id="docValidez" type="date" value={d.validoHasta || ""} onChange={set("validoHasta")} /></div>
            <div className="cal-form-subhead">Datos de contacto del cliente</div>
            <div className="field"><label>Celular</label><input id="docClienteCelular" placeholder="300 000 0000" value={d.clienteCelular || ""} onChange={set("clienteCelular")} /></div>
            <div className="field"><label>Correo</label><input id="docClienteCorreo" type="email" placeholder="correo@ejemplo.com" value={d.clienteCorreo || ""} onChange={set("clienteCorreo")} /></div>
            <div className="field"><label>Dirección</label><input id="docClienteDireccion" placeholder="Dirección" value={d.clienteDireccion || ""} onChange={set("clienteDireccion")} /></div>
            <div className="field"><label>Ciudad</label><input id="docClienteCiudad" placeholder="Ciudad" value={d.clienteCiudad || ""} onChange={set("clienteCiudad")} /></div>
            <div className="field full"><label>Objeto de la cotización</label><input id="docObjeto" placeholder="Ej. Plan familiar 4 días / 3 noches en el eje cafetero" value={d.objeto || ""} onChange={set("objeto")} /></div>
          </>
        )}
      </div>

      <div style={{ marginTop: 18 }}>
        <label style={ITEMS_LABEL_STYLE}>{itemsLabel}</label>
        {d.items.map((it, i) => (
          <div className="doc-items-row" key={it.id}>
            <input placeholder="Descripción" value={it.desc} onChange={(e) => setItem(i, "desc", e.target.value)} />
            {/* Numéricos sin controlar para que el usuario pueda vaciar el campo mientras escribe (el valor se lee con parseFloat||0 como en el original). */}
            <input type="number" min={1} placeholder="Cant." defaultValue={it.qty} onChange={(e) => setItem(i, "qty", e.target.value)} />
            <input type="number" min={0} step={1000} placeholder="Valor unit." defaultValue={it.price} onChange={(e) => setItem(i, "price", e.target.value)} />
            <button type="button" className="doc-item-remove" aria-label="Quitar ítem" onClick={() => removeItem(i)}><Icon name="close" /></button>
          </div>
        ))}
        <button type="button" className="btn btn-ghost btn-sm" id="docAddItem" style={{ marginTop: 6 }}
          onClick={() => update((s) => ({ ...s, items: [...s.items, newItem()] }))}>
          <Icon name="plus" /> Agregar ítem
        </button>
      </div>
      <div className="field full" style={{ marginTop: 14 }}>
        <label>Observaciones (opcional)</label>
        <textarea id="docObservaciones" rows={type === "cotizacion" ? 3 : 2}
          placeholder={type === "cotizacion" ? "Términos, incluye/no incluye, condiciones de pago…" : "Notas adicionales…"}
          style={TEXTAREA_STYLE} value={d.observaciones || ""} onChange={set("observaciones")} />
      </div>
      <button className="btn btn-accent btn-block" style={{ marginTop: 22 }} id="docDownloadBtn" onClick={onDownload} disabled={busy}>
        <Icon name="download" /> Descargar PDF
      </button>
    </div>
  );
}

function DocPreview({ d }: { d: DocsState }) {
  const type = d.type;
  const counter = docCounter(d);
  const typeLabel = docTypeLabelUpper(type);
  const fecha = formatDateEs(d.fecha || DEMO_TODAY);
  const clienteTag = type === "pago" ? "Beneficiario" : type === "cobro" ? "Cobrar a" : "Cliente";

  const clienteLines: string[] = [];
  if (d.clienteId) clienteLines.push(d.clienteId);
  if (type === "cotizacion") {
    if (d.clienteCelular) clienteLines.push("Cel: " + d.clienteCelular);
    if (d.clienteCorreo) clienteLines.push(d.clienteCorreo);
    const dirCiudad = [d.clienteDireccion, d.clienteCiudad].filter(Boolean).join(", ");
    if (dirCiudad) clienteLines.push(dirCiudad);
  }
  const emisorLines = type === "cotizacion"
    ? [EMISOR.ciudad, "Cel: " + EMISOR.telefono, EMISOR.correo]
    : [EMISOR.titular, EMISOR.identificacion, EMISOR.direccion, EMISOR.telefono + " · " + EMISOR.correo];

  const itemsTotal = d.items.reduce((a, it) => a + (it.qty || 0) * (it.price || 0), 0);
  const itemsTable = (
    <table>
      <thead><tr><th>Descripción</th><th style={{ textAlign: "center" }}>Cant.</th><th style={{ textAlign: "right" }}>Valor unit.</th><th style={{ textAlign: "right" }}>Subtotal</th></tr></thead>
      <tbody>
        {d.items.length ? d.items.map((it) => {
          const sub = (it.qty || 0) * (it.price || 0);
          return (
            <tr key={it.id}>
              <td>{it.desc || "—"}</td>
              <td className="tabular" style={{ textAlign: "center" }}>{it.qty || 0}</td>
              <td className="tabular" style={{ textAlign: "right" }}>{cop(it.price || 0)}</td>
              <td className="tabular" style={{ textAlign: "right" }}>{cop(sub)}</td>
            </tr>
          );
        }) : <tr><td colSpan={4} style={{ color: "#8A958E" }}>Agrega ítems…</td></tr>}
      </tbody>
    </table>
  );

  const footInfo = type === "cotizacion" ? EMISOR.nombre : (EMISOR.direccion + " · " + EMISOR.telefono + " · " + EMISOR.correo);

  return (
    <div className="doc-preview"><div className="doc-preview-inner">
      <div className="doc-preview-head">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/photos/logo-mark-ink.png" alt="" />
        <div><b>El Viajero Inquieto</b><span>Tu aliado al viajar</span></div>
      </div>
      <div className="doc-preview-title"><h2>{type === "cotizacion" ? typeLabel : (typeLabel + " No. " + counter)}</h2><span>Fecha: {fecha}</span></div>
      {type === "cotizacion" && <p className="doc-preview-tagline">Tu viaje te espera — este es el plan que armamos para ti.</p>}
      <div className="doc-preview-parties">
        <div className="doc-preview-party">
          <span className="doc-preview-party-tag">De</span><b>{EMISOR.nombre}</b>
          {emisorLines.map((l, i) => <p key={i}>{l}</p>)}
        </div>
        <div className="doc-preview-party">
          <span className="doc-preview-party-tag">{clienteTag}</span><b>{d.cliente || "—"}</b>
          {clienteLines.length ? clienteLines.map((l, i) => <p key={i}>{l}</p>) : <p>—</p>}
        </div>
      </div>
      {type === "cotizacion" ? (
        <>
          {d.objeto && <div className="doc-preview-objeto"><b>Asunto</b>{d.objeto}</div>}
          {itemsTable}
          <div className="doc-preview-total"><span>Valor de tu viaje</span><b>{cop(itemsTotal)}</b></div>
          {d.validoHasta && <span className="doc-preview-badge"><Icon name="calendar" />Válida hasta el {formatDateEs(d.validoHasta)}</span>}
        </>
      ) : (
        <>
          <div className="doc-preview-row"><b>Forma de pago</b><span>{d.formaPago || "Transferencia"}</span></div>
          {itemsTable}
          <div className="doc-preview-total"><span>{type === "pago" ? "Valor pagado" : "Valor a cobrar"}</span><b>{cop(itemsTotal)}</b></div>
          <p className="doc-preview-words">Son: {copWords(itemsTotal)}.</p>
        </>
      )}
      {d.observaciones && <div className="doc-preview-obs"><b>Observaciones</b>{d.observaciones}</div>}
      <div className="doc-illustration-row">
        {DOC_ILLUSTRATIONS.map((k) => <span key={k} className="doc-illustration"><Icon name={k} /></span>)}
      </div>
      <p className="doc-illustration-tagline">viajando lento, profundo y con sentido</p>
      {type !== "cotizacion" && (
        <div className="doc-preview-sign"><div className="doc-preview-sign-line"></div><b>{EMISOR.titular}</b><span>{EMISOR.identificacion}</span></div>
      )}
      <div className="doc-preview-foot">{footInfo}</div>
    </div></div>
  );
}

export default function Documentos() {
  const { toast } = useApp();
  const [d, update] = useDocsState();
  const [busy, setBusy] = useState(false);

  async function onDownload() {
    if (busy) return;
    setBusy(true);
    try {
      const snapshot = d;
      const ok = await generateDocPDF(snapshot);
      if (!ok) { toast("No se pudo cargar el generador de PDF. Revisa tu conexión."); return; }
      const type = snapshot.type;
      const typeLabel = docTypeLabelUpper(type);
      const next = snapshot.counters[type] + 1;
      update((s) => ({ ...s, counters: { ...s.counters, [type]: s.counters[type] + 1 } }));
      toast(type === "cotizacion" ? (typeLabel + " descargada") : (typeLabel + " descargada — próximo consecutivo No. " + String(next).padStart(4, "0")));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fade-in">
      <div className="admin-head"><div><h1>Documentos</h1><p>Genera cuentas de cobro, cuentas de pago y cotizaciones con el membrete de El Viajero Inquieto.</p></div></div>
      <div className="doc-type-tabs">
        <DocTypeTab d={d} k="cotizacion" label="Cotización" update={update} />
        <DocTypeTab d={d} k="cobro" label="Cuenta de cobro" update={update} />
        <DocTypeTab d={d} k="pago" label="Cuenta de pago" update={update} />
      </div>
      <div className="doc-layout">
        <DocForm d={d} update={update} onDownload={onDownload} busy={busy} />
        <DocPreview d={d} />
      </div>
    </div>
  );
}
