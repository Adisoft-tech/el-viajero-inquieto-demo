"use client";

import { useRef, useState } from "react";
import { Icon } from "@/lib/icons";
import { readToken } from "@/lib/store";

const MAX_SIDE = 1800;

/** Reduce la foto a máximo 1800 px por lado y la pasa a WebP/JPEG para que suba rápido y cargue liviana. */
async function compress(file: File): Promise<Blob> {
  if (file.type === "image/gif") return file; // conserva la animación
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const toBlob = (type: string) => new Promise<Blob | null>((res) => canvas.toBlob(res, type, 0.85));
  const out = (await toBlob("image/webp")) || (await toBlob("image/jpeg"));
  return out && out.size < file.size ? out : file;
}

/** Imagen desde el computador (o pegando un enlace). `value` es la URL guardada. */
export function ImageUpload({ value, onChange, id }: { value: string; onChange: (url: string) => void; id?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function upload(file: File) {
    if (!file.type.startsWith("image/")) { setError("Elige un archivo de imagen (JPG, PNG, WebP o GIF)."); return; }
    setBusy(true); setError("");
    try {
      const blob = await compress(file);
      const body = new FormData();
      body.append("file", blob, file.name);
      const res = await fetch("/api/media", { method: "POST", headers: { "x-session-token": readToken() ?? "" }, body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) throw new Error(data.error || "No se pudo subir la imagen.");
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir la imagen.");
    }
    setBusy(false);
    if (input.current) input.current.value = "";
  }

  return (
    <div className="img-upload">
      {value && (
        <div className="img-upload-preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Vista previa de la portada" />
          <button type="button" className="icon-btn" aria-label="Quitar imagen" onClick={() => onChange("")} disabled={busy}><Icon name="trash" /></button>
        </div>
      )}
      <div className="img-upload-row"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) void upload(f); }}>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => input.current?.click()} disabled={busy}>
          <Icon name="upload" /> {busy ? "Subiendo…" : value ? "Cambiar imagen" : "Subir desde el computador"}
        </button>
        <span className="img-upload-or">o pega un enlace</span>
        <input id={id} className="img-upload-url" placeholder="https://…/foto.jpg" value={value} onChange={(e) => onChange(e.target.value)} disabled={busy} />
      </div>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) void upload(f); }} />
      {error && <p className="form-error" role="alert">{error}</p>}
    </div>
  );
}
