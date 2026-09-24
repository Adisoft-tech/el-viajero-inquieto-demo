"use client";

import { useState } from "react";
import type { Listing } from "@/lib/data";
import { Icon } from "@/lib/icons";
import { cop } from "@/lib/format";

export interface FincaFormValues { name: string; town: string; dept: string; price: number; cap: number; desc: string }

function FincaForm({ editingFinca, onSave, onCancel }: {
  editingFinca: Listing | null; onSave: (v: FincaFormValues) => void; onCancel: () => void;
}) {
  const [name, setName] = useState(editingFinca ? editingFinca.name : "");
  const [town, setTown] = useState(editingFinca ? editingFinca.town : "");
  const [dept, setDept] = useState(editingFinca ? editingFinca.dept : "");
  const [price, setPrice] = useState(editingFinca ? String(editingFinca.price) : "");
  const [cap, setCap] = useState(editingFinca ? String(editingFinca.cap) : "4");
  const [desc, setDesc] = useState(editingFinca ? editingFinca.desc : "");
  return (
    <div className="finca-form">
      <h4>{editingFinca ? "Editar finca" : "Nueva finca"}</h4>
      <div className="form-grid">
        <div className="field full"><label>Nombre</label><input id="ffName" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre de la finca o cabaña" /></div>
        <div className="field"><label>Pueblo</label><input id="ffTown" value={town} onChange={(e) => setTown(e.target.value)} placeholder="Ej. Salento" /></div>
        <div className="field"><label>Departamento</label><input id="ffDept" value={dept} onChange={(e) => setDept(e.target.value)} placeholder="Ej. Quindío" /></div>
        <div className="field"><label>Precio por noche</label><input id="ffPrice" type="number" min={0} step={10000} value={price} onChange={(e) => setPrice(e.target.value)} /></div>
        <div className="field"><label>Capacidad (huéspedes)</label><input id="ffCap" type="number" min={1} value={cap} onChange={(e) => setCap(e.target.value)} /></div>
        <div className="field full"><label>Descripción</label><textarea id="ffDesc" rows={3} placeholder="Descripción breve para el catálogo" value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        <button className="btn btn-accent" id="ffSaveBtn" onClick={() => onSave({
          name: name.trim(), town: town.trim(), dept: dept.trim(),
          price: parseInt(price, 10) || 0, cap: parseInt(cap, 10) || 1, desc: desc.trim(),
        })}>{editingFinca ? "Guardar cambios" : "Agregar finca"}</button>
        <button className="btn btn-ghost" id="ffCancelBtn" onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  );
}

/** Equivalente a calFincaManager(). `editingId`: null = sin formulario, "new" = alta, id = edición. */
export function FincaManager({ fincas, editingId, onAdd, onEdit, onDelete, onCancel, onSave }: {
  fincas: Listing[]; editingId: string | null;
  onAdd: () => void; onEdit: (id: string) => void; onDelete: (id: string) => void;
  onCancel: () => void; onSave: (v: FincaFormValues) => void;
}) {
  const editingFinca = editingId && editingId !== "new" ? fincas.find((f) => f.id === editingId) || null : null;
  const showForm = editingId !== null;
  return (
    <div className="panel" style={{ marginBottom: 22 }}>
      <div className="panel-head">
        <h3>Fincas y cabañas</h3>
        {!showForm ? <button className="btn btn-primary btn-sm" id="ffAddBtn" onClick={onAdd}><Icon name="plus" /> Agregar finca</button> : null}
      </div>
      {fincas.length ? (
        <div className="finca-list">
          {fincas.map((f) => (
            <div key={f.id} className="finca-row">
              <div className="finca-row-info">
                <b>{f.name}</b>
                <span>{f.town}, {f.dept} · {cop(f.price)} / {f.unit} · hasta {f.cap} huéspedes</span>
              </div>
              <div className="finca-row-actions">
                <button type="button" className="icon-btn" data-editfinca={f.id} aria-label="Editar" onClick={() => onEdit(f.id)}><Icon name="edit" /></button>
                <button type="button" className="icon-btn" data-deletefinca={f.id} aria-label="Eliminar" onClick={() => onDelete(f.id)}><Icon name="trash" /></button>
              </div>
            </div>
          ))}
        </div>
      ) : <p className="empty-note">Aún no hay fincas registradas.</p>}
      {showForm ? <FincaForm key={editingId} editingFinca={editingFinca} onSave={onSave} onCancel={onCancel} /> : null}
    </div>
  );
}
