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

/** Comprime y sube una imagen al servidor; devuelve la URL con la que queda guardada. */
export async function uploadImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Elige un archivo de imagen (JPG, PNG, WebP o GIF).");
  const blob = await compress(file);
  const body = new FormData();
  body.append("file", blob, file.name);
  const res = await fetch("/api/media", { method: "POST", headers: { "x-session-token": readToken() ?? "" }, body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.url) throw new Error(data.error || "No se pudo subir la imagen.");
  return data.url;
}

/** Imagen desde el computador (o pegando un enlace). `value` es la URL guardada. */
export function ImageUpload({ value, onChange, id }: { value: string; onChange: (url: string) => void; id?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function upload(file: File) {
    setBusy(true); setError("");
    try {
      onChange(await uploadImage(file));
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

/** Varias fotos desde el computador (o por enlace). La primera es la principal; se pueden reordenar y quitar. */
export function PhotoListUpload({ value, onChange, id }: { value: string[]; onChange: (urls: string[]) => void; id?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  const busy = progress !== null;

  async function uploadAll(files: File[]) {
    if (!files.length) return;
    setError(""); setProgress({ done: 0, total: files.length });
    const added: string[] = [];
    const failed: string[] = [];
    for (const [i, file] of files.entries()) {
      try { added.push(await uploadImage(file)); }
      catch (err) { failed.push(file.name + ": " + (err instanceof Error ? err.message : "no se pudo subir")); }
      setProgress({ done: i + 1, total: files.length });
    }
    if (added.length) onChange([...value, ...added]);
    if (failed.length) setError(failed.join(" · "));
    setProgress(null);
    if (input.current) input.current.value = "";
  }

  function addLink() {
    const url = link.trim();
    if (!url) return;
    onChange([...value, url]); setLink("");
  }
  const move = (i: number, to: number) => {
    const next = [...value]; const [item] = next.splice(i, 1); next.splice(to, 0, item); onChange(next);
  };

  return (
    <div className="img-upload">
      {value.length > 0 && (
        <ul className="photo-list">
          {value.map((url, i) => (
            <li key={url + i} className="photo-list-item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={"Foto " + (i + 1)} />
              {i === 0 && <span className="photo-list-main">Principal</span>}
              <div className="photo-list-actions">
                {i > 0 && <button type="button" className="icon-btn" aria-label="Mover antes" title="Mover antes" onClick={() => move(i, i - 1)} disabled={busy}><Icon name="chevLeft" /></button>}
                {i < value.length - 1 && <button type="button" className="icon-btn" aria-label="Mover después" title="Mover después" onClick={() => move(i, i + 1)} disabled={busy}><Icon name="chevRight" /></button>}
                <button type="button" className="icon-btn" aria-label="Quitar foto" title="Quitar foto" onClick={() => onChange(value.filter((_, j) => j !== i))} disabled={busy}><Icon name="trash" /></button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="img-upload-row"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); void uploadAll(Array.from(e.dataTransfer.files)); }}>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => input.current?.click()} disabled={busy}>
          <Icon name="upload" /> {progress ? `Subiendo ${Math.min(progress.done + 1, progress.total)} de ${progress.total}…` : "Subir fotos desde el computador"}
        </button>
        <span className="img-upload-or">o pega un enlace</span>
        <input id={id} className="img-upload-url" placeholder="https://…/foto.jpg" value={link} disabled={busy}
          onChange={(e) => setLink(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addLink(); } }} />
        <button type="button" className="btn btn-ghost btn-sm" onClick={addLink} disabled={busy || !link.trim()}><Icon name="plus" /> Agregar</button>
      </div>
      <input ref={input} type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" hidden
        onChange={(e) => void uploadAll(Array.from(e.target.files ?? []))} />
      {error && <p className="form-error" role="alert">{error}</p>}
    </div>
  );
}
