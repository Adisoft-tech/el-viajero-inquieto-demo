"use client";

// Documento "Itinerario": día a día, con horas y actividades — vive aparte de DocForm/DocPreview
// porque su forma de datos (días → actividades) no tiene nada que ver con ítems/cantidades/totales.
// No se numera de cara al viajero: el consecutivo interno solo sirve para identificar la fila
// guardada (columna "No." en Itinerarios emitidos), no aparece en el documento en sí.

import { useCallback, useEffect, useState } from "react";
import { ACTIVITY_CATEGORIES, formatDateEs, generateItinerarioPDF, type ActivityCategoryKey, type ItinerarioData } from "@/lib/pdf";
import { Icon } from "@/lib/icons";
import { useApp } from "@/lib/store";
import { emitirItinerario, listItinerarios, type ItinerarioDoc } from "@/lib/actions/gestion";
import { newActivity, newDay, useItinerarioState, type ActivityRow, type ItinerarioState } from "./ItinerarioState";

type Update = (fn: (s: ItinerarioState) => ItinerarioState) => void;

function addDaysIso(iso: string, n: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

function ItinerarioForm({ s, update, onDownload, busy }: { s: ItinerarioState; update: Update; onDownload: () => void; busy: boolean }) {
  const set = (field: "destino" | "fechaInicio" | "notas") => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const v = e.target.value;
    update((st) => ({ ...st, [field]: v }));
  };
  const setDayTitle = (dayIdx: number, v: string) => {
    update((st) => ({ ...st, dias: st.dias.map((d, i) => i !== dayIdx ? d : { ...d, title: v }) }));
  };
  const addDay = () => update((st) => ({ ...st, dias: [...st.dias, newDay()] }));
  const removeDay = (dayIdx: number) => {
    update((st) => {
      const dias = st.dias.filter((_, i) => i !== dayIdx);
      return { ...st, dias: dias.length ? dias : [newDay()] };
    });
  };
  const addActivity = (dayIdx: number) => {
    update((st) => ({ ...st, dias: st.dias.map((d, i) => i !== dayIdx ? d : { ...d, activities: [...d.activities, newActivity()] }) }));
  };
  const removeActivity = (dayIdx: number, actIdx: number) => {
    update((st) => ({
      ...st,
      dias: st.dias.map((d, i) => {
        if (i !== dayIdx) return d;
        const activities = d.activities.filter((_, j) => j !== actIdx);
        return { ...d, activities: activities.length ? activities : [newActivity()] };
      }),
    }));
  };
  const setActivity = (dayIdx: number, actIdx: number, field: keyof ActivityRow, v: string) => {
    update((st) => ({
      ...st,
      dias: st.dias.map((d, i) => i !== dayIdx ? d : {
        ...d, activities: d.activities.map((a, j) => j !== actIdx ? a : { ...a, [field]: v }),
      }),
    }));
  };

  return (
    <div className="panel">
      <div className="panel-head"><h3>Itinerario</h3></div>
      <div className="form-grid">
        <div className="field"><label>Destino</label><input placeholder="Ej. Eje cafetero" value={s.destino || ""} onChange={set("destino")} /></div>
        <div className="field"><label>Fecha de inicio</label><input type="date" value={s.fechaInicio || ""} onChange={set("fechaInicio")} /></div>
      </div>

      <div style={{ marginTop: 20 }}>
        <label className="itin-days-label">Días del itinerario</label>
        {s.dias.map((day, di) => (
          <div className="itin-day-card" key={day.id}>
            <div className="itin-day-card-head">
              <span className="itin-day-badge">Día {di + 1}{s.fechaInicio ? " · " + formatDateEs(addDaysIso(s.fechaInicio, di)) : ""}</span>
              {s.dias.length > 1 && (
                <button type="button" className="icon-btn" aria-label="Quitar día" onClick={() => removeDay(di)}><Icon name="close" /></button>
              )}
            </div>
            <input className="itin-day-title-input" placeholder="Título del día (opcional) — ej. Llegada y Valle de Cocora"
              value={day.title || ""} onChange={(e) => setDayTitle(di, e.target.value)} />

            {day.activities.map((act, ai) => (
              <div className="itin-activity-block" key={act.id}>
                <div className="itin-activity-row">
                  <input type="time" value={act.time} onChange={(e) => setActivity(di, ai, "time", e.target.value)} />
                  <select value={act.category} onChange={(e) => setActivity(di, ai, "category", e.target.value)}>
                    {ACTIVITY_CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select>
                  <input placeholder="Actividad — ej. Caminata al Valle de Cocora" value={act.title} onChange={(e) => setActivity(di, ai, "title", e.target.value)} />
                  <button type="button" className="doc-item-remove" aria-label="Quitar actividad" onClick={() => removeActivity(di, ai)}><Icon name="close" /></button>
                </div>
                <div className="itin-activity-detail-row">
                  <input placeholder="Lugar (opcional)" value={act.place || ""} onChange={(e) => setActivity(di, ai, "place", e.target.value)} />
                  <input placeholder="Descripción corta (opcional)" value={act.desc || ""} onChange={(e) => setActivity(di, ai, "desc", e.target.value)} />
                </div>
              </div>
            ))}
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => addActivity(di)}><Icon name="plus" /> Agregar actividad</button>
          </div>
        ))}
        <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 4 }} onClick={addDay}><Icon name="plus" /> Agregar día</button>
      </div>

      <div className="field full" style={{ marginTop: 16 }}>
        <label>Recomendaciones (opcional)</label>
        <textarea rows={3} placeholder="Qué llevar, clima esperado, indicaciones generales…" value={s.notas || ""} onChange={set("notas")} />
      </div>
      <button className="btn btn-accent btn-block" style={{ marginTop: 22 }} onClick={onDownload} disabled={busy}>
        <Icon name="download" /> {busy ? "Guardando…" : "Descargar PDF"}
      </button>
    </div>
  );
}

function ActivityPreview({ act }: { act: ActivityRow }) {
  const cat = ACTIVITY_CATEGORIES.find((c) => c.key === act.category) || ACTIVITY_CATEGORIES[2];
  return (
    <div className="itin-tl-item">
      <div className="itin-tl-time">{act.time || "—:—"}</div>
      <div className="itin-tl-dot-col"><span className="itin-tl-dot" /><span className="itin-tl-line" /></div>
      <div className="itin-tl-body">
        <span className={"itin-chip itin-chip-" + cat.key}><Icon name={cat.icon} />{cat.label}</span>
        <b>{act.title || "Actividad sin nombre"}</b>
        {(act.place || act.desc) && (
          <span className="itin-tl-meta">{[act.place, act.desc].filter(Boolean).join("  ·  ")}</span>
        )}
      </div>
    </div>
  );
}

function ItinerarioPreview({ s }: { s: ItinerarioState }) {
  const totalDays = s.dias.length;
  const duracion = totalDays + (totalDays === 1 ? " día" : " días")
    + (s.fechaInicio ? "  ·  " + formatDateEs(s.fechaInicio) + (totalDays > 1 ? " – " + formatDateEs(addDaysIso(s.fechaInicio, totalDays - 1)) : "") : "");
  return (
    <div className="doc-preview itin-preview"><div className="doc-preview-inner">
      <div className="doc-preview-head">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/photos/logo-mark-ink.png" alt="" />
        <div><b>El Viajero Inquieto</b><span>Tu aliado al viajar</span></div>
      </div>
      <div className="doc-preview-title"><h2>Itinerario</h2></div>
      <div className="itin-summary">
        <div><span>Destino</span><b>{s.destino || "—"}</b></div>
        <div><span>Duración</span><b>{duracion}</b></div>
      </div>

      {s.dias.map((day, di) => (
        <div className="itin-day" key={day.id}>
          <div className="itin-day-band">
            <span>DÍA {di + 1}</span>
            {s.fechaInicio && <span>{formatDateEs(addDaysIso(s.fechaInicio, di))}</span>}
          </div>
          {day.title && <p className="itin-day-title">{day.title}</p>}
          <div className="itin-timeline">
            {day.activities.map((act) => <ActivityPreview key={act.id} act={act} />)}
          </div>
        </div>
      ))}

      {s.notas && <div className="doc-preview-obs"><b>Recomendaciones</b>{s.notas}</div>}

      <div className="doc-preview-foot itin-foot">El Viajero Inquieto — contacto en la última página</div>
    </div></div>
  );
}

function ItinerarioHistory({ docs, status, onRetry, onDownload, onUse }: {
  docs: ItinerarioDoc[]; status: "loading" | "ready" | "error";
  onRetry: () => void; onDownload: (doc: ItinerarioDoc) => void; onUse: (doc: ItinerarioDoc) => void;
}) {
  return (
    <div className="panel" style={{ marginTop: 24 }}>
      <div className="panel-head"><h3>Itinerarios emitidos</h3></div>
      {status === "loading" ? <p className="empty-note">Cargando itinerarios…</p>
        : status === "error" ? (
          <p className="empty-note">
            No se pudieron cargar los itinerarios.{" "}
            <button type="button" className="btn btn-ghost btn-sm" onClick={onRetry}>Reintentar</button>
          </p>
        ) : !docs.length ? <p className="empty-note">Aún no hay itinerarios emitidos. Se guardan aquí al descargar el PDF.</p>
        : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Fecha</th><th>Destino</th><th>Días</th><th></th></tr></thead>
              <tbody>
                {docs.map((doc) => (
                  <tr key={doc.id}>
                    <td>{formatDateEs(doc.fecha)}</td>
                    <td className="wrap">{doc.data.destino || "—"}</td>
                    <td className="tabular">{doc.data.dias.length}</td>
                    <td style={{ whiteSpace: "nowrap", textAlign: "right" }}>
                      <button type="button" className="icon-btn" aria-label="Descargar PDF" title="Descargar PDF" onClick={() => onDownload(doc)}><Icon name="download" /></button>
                      <button type="button" className="icon-btn" aria-label="Usar como base" title="Usar como base para un itinerario nuevo" onClick={() => onUse(doc)}><Icon name="edit" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </div>
  );
}

export default function Itinerarios() {
  const { authed, toast } = useApp();
  const [s, update] = useItinerarioState();
  const [busy, setBusy] = useState(false);
  const [docs, setDocs] = useState<ItinerarioDoc[]>([]);
  const [docsStatus, setDocsStatus] = useState<"loading" | "ready" | "error">("loading");

  const loadFromDb = useCallback(async () => {
    setDocsStatus("loading");
    try {
      const list = await authed(listItinerarios);
      setDocs(list);
      setDocsStatus("ready");
    } catch (err) {
      console.error("No se pudieron cargar los itinerarios:", err);
      setDocsStatus("error");
    }
  }, [authed]);
  useEffect(() => { void loadFromDb(); }, [loadFromDb]);

  async function onDownload() {
    if (busy) return;
    setBusy(true);
    try {
      try { await import("jspdf"); } catch { toast("No se pudo cargar el generador de PDF. Revisa tu conexión."); return; }
      const snapshot = s;
      const content: ItinerarioData = {
        destino: snapshot.destino, fechaInicio: snapshot.fechaInicio, notas: snapshot.notas,
        dias: snapshot.dias.map((d) => ({ title: d.title, activities: d.activities.map(({ id: _id, ...a }) => a) })),
      };
      try { await authed(emitirItinerario, content, new Date().toISOString().slice(0, 10)); } catch (err) {
        console.error(err);
        toast("No se pudo guardar el itinerario. Revisa tu conexión e inténtalo de nuevo.");
        return;
      }
      authed(listItinerarios).then(setDocs).catch((err) => console.error(err));
      const ok = await generateItinerarioPDF(content);
      if (!ok) { toast("Itinerario guardado, pero no se pudo generar el PDF — descárgalo desde Itinerarios emitidos."); return; }
      toast("Itinerario guardado y descargado");
    } finally {
      setBusy(false);
    }
  }

  async function downloadSaved(doc: ItinerarioDoc) {
    const ok = await generateItinerarioPDF(doc.data);
    if (!ok) toast("No se pudo cargar el generador de PDF. Revisa tu conexión.");
  }

  function loadAsBase(doc: ItinerarioDoc) {
    update((st) => ({
      ...st,
      destino: doc.data.destino, fechaInicio: undefined, notas: doc.data.notas,
      dias: doc.data.dias.length
        ? doc.data.dias.map((d) => newDay({ title: d.title, activities: d.activities.map((a) => newActivity(a)) }))
        : [newDay()],
    }));
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast("Datos cargados en el formulario");
  }

  return (
    <div className="doc-layout">
      <ItinerarioForm s={s} update={update} onDownload={onDownload} busy={busy} />
      <ItinerarioPreview s={s} />
      <div style={{ gridColumn: "1 / -1" }}>
        <ItinerarioHistory docs={docs} status={docsStatus} onRetry={() => void loadFromDb()}
          onDownload={(doc) => void downloadSaved(doc)} onUse={loadAsBase} />
      </div>
    </div>
  );
}

export type { ActivityCategoryKey };
