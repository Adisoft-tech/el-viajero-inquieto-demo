"use client";

import { useRef, useState } from "react";
import { MONTHS_ES, type Listing } from "@/lib/data";
import { Icon } from "@/lib/icons";
import { useApp } from "@/lib/store";
import { bookingsFromExcelRows, fincaListings } from "@/lib/calendar";
import { createFincaBooking, deleteFinca as deleteFincaDb, importFincaBookings, saveFinca as saveFincaDb } from "@/lib/actions/gestion";
import { CalendarGrid } from "./CalendarGrid";
import { AvailabilityPanel, DayDetailPanel } from "./SidePanels";
import { BookingForm, type NewBooking } from "./BookingForm";
import { BookingsTable } from "./BookingsTable";
import { AvailabilityMatrix } from "./AvailabilityMatrix";
import { FincaManager, type FincaFormValues } from "./FincaManager";
import { CalChatWidget } from "./CalChatWidget";

/** Equivalente a adminCalendario() + la parte de calendario de bindGestion(). */
export function CalendarioView() {
  const { listings, setListings, fincaBookings, setFincaBookings, fincaBookingsStatus, loadFincaBookings, authed, toast } = useApp();

  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(8);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [filterFinca, setFilterFinca] = useState("todas");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [sortKey, setSortKey] = useState("checkin");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const [fincaManagerOpen, setFincaManagerOpen] = useState(false);
  const [editingFincaId, setEditingFincaId] = useState<string | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const fincas = fincaListings(listings);
  const fincaById = (id: string): Listing | undefined => listings.find((l) => l.id === id);
  const filteredBookings = !filterFinca || filterFinca === "todas"
    ? fincaBookings
    : fincaBookings.filter((b) => b.fincaId === filterFinca);
  const hasSelection = !!(selectedDate || (filterFrom && filterTo));

  function gotoMonthOf(iso: string) {
    const dt = new Date(iso + "T00:00:00");
    setYear(dt.getFullYear());
    setMonth(dt.getMonth());
  }
  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1);
  }

  /* ---- Reservas ---- */
  async function saveBooking(b: NewBooking) {
    let saved;
    try { saved = await authed(createFincaBooking, b); } catch (err) {
      console.error(err);
      toast("No se pudo guardar la reserva. Revisa tu conexión e inténtalo de nuevo.");
      return;
    }
    setFincaBookings((prev) => [...prev, saved]);
    gotoMonthOf(b.checkin);
    setSelectedDate(b.checkin);
    setFormOpen(false);
    setPage(1);
    const f = fincaById(b.fincaId);
    toast("Reserva creada para " + (f ? f.name : b.fincaId));
  }

  /* ---- Excel ---- */
  async function downloadExcelTemplate() {
    let XLSX: typeof import("xlsx");
    try { XLSX = await import("xlsx"); } catch { toast("No se pudo cargar el generador de Excel. Revisa tu conexión."); return; }
    const rows = [
      ["Finca", "Huésped", "Fecha", "Huéspedes", "Valor a pagar", "Abonado"],
      ["Finca La Serrana", "María Pérez", "2026-11-10", 4, 900000, 300000],
    ];
    const sheet = XLSX.utils.aoa_to_sheet(rows);
    sheet["!cols"] = [{ wch: 24 }, { wch: 20 }, { wch: 14 }, { wch: 12 }, { wch: 16 }, { wch: 14 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, "Reservas");
    XLSX.writeFile(wb, "Plantilla_Reservas_El_Viajero_Inquieto.xlsx");
  }

  async function importBookingsFromExcel(file: File) {
    let XLSX: typeof import("xlsx");
    try { XLSX = await import("xlsx"); } catch { toast("No se pudo cargar el lector de Excel. Revisa tu conexión."); return; }
    let buf: ArrayBuffer;
    try { buf = await file.arrayBuffer(); } catch { toast("No se pudo leer el archivo."); return; }
    let rows: Record<string, unknown>[];
    try {
      const workbook = XLSX.read(new Uint8Array(buf), { type: "array", cellDates: true });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
    } catch {
      toast("No se pudo leer el archivo. Verifica que sea un Excel válido.");
      return;
    }
    const res = bookingsFromExcelRows(rows, fincas);
    if (!res.ok) { toast(res.error || "No se pudo importar el archivo."); return; }
    const imported = res.imported.length;
    if (imported) {
      let saved;
      try { saved = await authed(importFincaBookings, res.imported); } catch (err) {
        console.error(err);
        toast("No se pudieron guardar las reservas importadas — no se guardó ninguna. Inténtalo de nuevo.");
        return;
      }
      setFincaBookings((prev) => [...prev, ...saved]);
      gotoMonthOf(res.lastCheckin);
      setPage(1);
    }
    if (res.skipped) {
      console.warn("Filas omitidas al importar reservas:", res.skippedReasons);
      toast(imported + " reserva(s) importada(s), " + res.skipped + " fila(s) omitida(s) — revisa la consola para el detalle.");
    } else {
      toast(imported + " reserva(s) importada(s) correctamente.");
    }
  }

  /* ---- Gestión de fincas y cabañas (actualiza el catálogo público) ---- */
  async function deleteFinca(id: string) {
    const f = fincaById(id);
    if (!f) return;
    const hasBookings = fincaBookings.some((b) => b.fincaId === id);
    const msg = hasBookings
      ? ("\"" + f.name + "\" tiene reservas registradas en el calendario. ¿Eliminarla igual del catálogo? Sus reservas quedan guardadas.")
      : ("¿Eliminar \"" + f.name + "\" del catálogo?");
    if (!confirm(msg)) return;
    try { await authed(deleteFincaDb, id); } catch (err) {
      console.error(err);
      toast("No se pudo eliminar la finca. Inténtalo de nuevo.");
      return;
    }
    setListings((prev) => prev.filter((l) => l.id !== id));
    if (filterFinca === id) setFilterFinca("todas");
    if (editingFincaId === id) setEditingFincaId(null);
    toast(f.name + " eliminada del catálogo");
  }
  async function saveFinca(v: FincaFormValues) {
    if (!v.name) { toast("Escribe el nombre de la finca"); return; }
    const editing = editingFincaId && editingFincaId !== "new" ? editingFincaId : null;
    let saved: Listing;
    try { saved = await authed(saveFincaDb, editing, v); } catch (err) {
      console.error(err);
      toast("No se pudo guardar la finca. Inténtalo de nuevo.");
      return;
    }
    if (editing) {
      // Conserva los campos que solo existen en memoria (p. ej. `active` desde Inventario).
      setListings((prev) => prev.map((f) => f.id !== editing ? f : { ...f, ...saved }));
      toast("Finca actualizada");
    } else {
      setListings((prev) => [...prev, saved]);
      toast(v.name + " agregada al catálogo");
    }
    setEditingFincaId(null);
  }

  function onSort(key: string) {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
    setPage(1);
  }

  return (
    <>
      <div className="fade-in">
        <div className="admin-head">
          <div><h1>Calendario de reservas</h1><p>Disponibilidad de las fincas y cabañas ya cargadas en el catálogo.</p></div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <button className="btn btn-ghost btn-sm" id="calFincaManagerToggle" onClick={() => { setFincaManagerOpen(!fincaManagerOpen); setEditingFincaId(null); }}>
              <Icon name="inventory" /> {fincaManagerOpen ? "Ocultar fincas" : "Gestionar fincas"}
            </button>
            <button className="btn btn-ghost btn-sm" id="calImportBtn" onClick={() => importInputRef.current?.click()}>
              <Icon name="upload" /> Importar Excel
            </button>
            <input type="file" id="calImportInput" ref={importInputRef} accept=".xlsx,.xls,.csv" style={{ display: "none" }} onChange={(e) => {
              const input = e.currentTarget;
              const file = input.files && input.files[0];
              if (file) void importBookingsFromExcel(file);
              input.value = "";
            }} />
            <button className="btn btn-primary btn-sm" id="calNewBtn" onClick={() => setFormOpen(true)}>
              <Icon name="plus" /> Nueva reserva
            </button>
          </div>
        </div>
        <p className="cal-import-hint">
          Importa reservas desde Excel — columnas esperadas: <b>Finca</b>, <b>Huésped</b>, <b>Fecha</b>, <b>Huéspedes</b>, <b>Valor a pagar</b>, <b>Abonado</b>.{" "}
          <span className="cal-import-template" id="calTemplateBtn" onClick={() => void downloadExcelTemplate()}>Descargar plantilla</span>
        </p>

        {fincaManagerOpen ? (
          <FincaManager
            fincas={fincas} editingId={editingFincaId}
            onAdd={() => setEditingFincaId("new")} onEdit={setEditingFincaId} onDelete={(id) => void deleteFinca(id)}
            onCancel={() => setEditingFincaId(null)} onSave={(v) => void saveFinca(v)}
          />
        ) : null}

        <div className="cal-filters">
          <div className="field"><label>Finca</label>
            <select id="calFilterFinca" value={filterFinca} onChange={(e) => { setFilterFinca(e.target.value); setPage(1); }}>
              <option value="todas">Todas las fincas</option>
              {fincas.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
          <div className="cal-daterange">
            <div className="cal-daterange-part"><label>Desde</label>
              <input id="calFilterFrom" type="date" value={filterFrom} onChange={(e) => {
                const v = e.target.value;
                setFilterFrom(v);
                if (filterTo && filterTo < v) setFilterTo("");
                setPage(1);
              }} />
            </div>
            <span className="cal-daterange-sep"><Icon name="chevRight" /></span>
            <div className="cal-daterange-part"><label>Hasta</label>
              <input id="calFilterTo" type="date" min={filterFrom} value={filterTo} onChange={(e) => { setFilterTo(e.target.value); setPage(1); }} />
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" id="calFilterClear" type="button" onClick={() => {
            setFilterFinca("todas"); setFilterFrom(""); setFilterTo(""); setPage(1);
          }}>Limpiar filtros</button>
        </div>

        {fincaBookingsStatus === "loading" || fincaBookingsStatus === "idle" ? (
          <p className="cal-select-hint">Cargando reservas…</p>
        ) : fincaBookingsStatus === "error" ? (
          <p className="cal-select-hint">
            No se pudieron cargar las reservas.{" "}
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => void loadFincaBookings()}>Reintentar</button>
          </p>
        ) : null}

        {formOpen ? (
          <BookingForm
            fincas={fincas}
            defaultFincaId={filterFinca !== "todas" ? filterFinca : ""}
            defaultCheckin={selectedDate || ""}
            onClose={() => setFormOpen(false)} onSave={saveBooking} onError={toast}
          />
        ) : null}

        {hasSelection ? null : (
          <p className="cal-select-hint">Selecciona un día en el calendario para ver el detalle de sus reservas, o crea una nueva con el botón &quot;Nueva reserva&quot;.</p>
        )}
        <div className={"cal-wrap" + (hasSelection ? "" : " cal-wrap-solo")}>
          <div className="panel">
            <div className="cal-head">
              <h3>{MONTHS_ES[month]} {year}</h3>
              <div className="cal-nav">
                <button id="calPrev" aria-label="Mes anterior" onClick={prevMonth}><Icon name="chevLeft" /></button>
                <button id="calNext" aria-label="Mes siguiente" onClick={nextMonth}><Icon name="chevRight" /></button>
              </div>
            </div>
            <CalendarGrid year={year} month={month} bookings={filteredBookings} selectedDate={selectedDate} fincaById={fincaById} onSelect={setSelectedDate} />
          </div>
          {hasSelection ? (
            filterFrom && filterTo
              ? <AvailabilityPanel fincas={fincas} allBookings={fincaBookings} from={filterFrom} to={filterTo} />
              : <DayDetailPanel date={selectedDate} bookings={filteredBookings} fincaById={fincaById} />
          ) : null}
        </div>

        <AvailabilityMatrix year={year} month={month} fincas={fincas} allBookings={fincaBookings} selectedDate={selectedDate} onSelect={setSelectedDate} />

        <div className="panel" style={{ marginTop: 24 }}>
          <div className="panel-head"><h3>Próximas reservas</h3></div>
          <BookingsTable
            bookings={filteredBookings} fincaById={fincaById}
            sortKey={sortKey} sortDir={sortDir} page={page} pageSize={pageSize}
            onSort={onSort} onPage={setPage}
          />
        </div>
      </div>
      <CalChatWidget onGotoDate={(iso) => { gotoMonthOf(iso); setSelectedDate(iso); }} />
    </>
  );
}
