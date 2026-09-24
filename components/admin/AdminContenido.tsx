"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";

type Field = "heroEyebrow" | "heroTitle" | "heroLede";

export function AdminContenido() {
  const { content, setContent, toast } = useApp();
  const [form, setForm] = useState({
    heroEyebrow: content.heroEyebrow,
    heroTitle: content.heroTitle.replace(/<\/?em>/g, ""),
    heroLede: content.heroLede,
  });
  // Como en el original: la vista previa muestra el HTML guardado hasta que se edita el campo; luego, el texto tecleado.
  const [touched, setTouched] = useState<Record<Field, boolean>>({ heroEyebrow: false, heroTitle: false, heroLede: false });

  const onInput = (f: Field, v: string) => {
    setForm((p) => ({ ...p, [f]: v }));
    setTouched((p) => ({ ...p, [f]: true }));
  };
  const save = () => {
    setContent((p) => ({ ...p, ...form }));
    setTouched({ heroEyebrow: false, heroTitle: false, heroLede: false });
    toast("Contenido de la página de inicio actualizado");
  };
  const preview = (f: Field) => (touched[f] ? { children: form[f] } : { dangerouslySetInnerHTML: { __html: content[f] } });

  return (
    <div className="fade-in">
      <div className="admin-head"><div><h1>Contenido del sitio</h1><p>Edita el mensaje principal de la página de inicio y ve el resultado al instante.</p></div></div>
      <div className="cms-grid">
        <div className="panel">
          <div className="cms-field"><label>Etiqueta superior</label><input id="cmsEyebrow" value={form.heroEyebrow} onChange={(e) => onInput("heroEyebrow", e.target.value)} /></div>
          <div className="cms-field"><label>Título principal</label><textarea id="cmsTitle" value={form.heroTitle} onChange={(e) => onInput("heroTitle", e.target.value)} /></div>
          <div className="cms-field"><label>Texto de apoyo</label><textarea id="cmsLede" value={form.heroLede} onChange={(e) => onInput("heroLede", e.target.value)} /></div>
          <button className="btn btn-primary" id="cmsSave" onClick={save}>Guardar cambios</button>
        </div>
        <div>
          <p className="cms-preview-tag">Vista previa en vivo</p>
          <div className="cms-preview">
            <p className="eyebrow" id="cmsPrevEyebrow" {...preview("heroEyebrow")} />
            <h2 id="cmsPrevTitle" style={{ marginTop: 8 }} {...preview("heroTitle")} />
            <p id="cmsPrevLede" {...preview("heroLede")} />
          </div>
        </div>
      </div>
    </div>
  );
}
