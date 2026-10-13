"use client";

import { useCallback, useEffect, useState } from "react";
import { adminListPosts, deletePost, savePost, type BlogInput, type BlogPost } from "@/lib/actions/blog";
import { Icon } from "@/lib/icons";
import { useApp } from "@/lib/store";
import { Modal } from "./Modal";
import { formatPostDate, POST_CATEGORIES } from "@/components/site/Notiviajero";

const today = () => new Date().toISOString().slice(0, 10);
const EMPTY: BlogInput = { title: "", excerpt: "", body: "", category: "Blog", coverUrl: "", author: "El Viajero Inquieto", published: true, publishedAt: today() };

function PostEditor({ post, onSave, onCancel }: { post: BlogPost | null; onSave: (v: BlogInput) => Promise<void>; onCancel: () => void }) {
  const [f, setF] = useState<BlogInput>(post ? { ...post } : EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = <K extends keyof BlogInput>(k: K, v: BlogInput[K]) => setF((p) => ({ ...p, [k]: v }));

  async function submit() {
    if (!f.title.trim()) { setError("El título es obligatorio."); return; }
    setBusy(true); setError("");
    try { await onSave(f); }
    catch (err) { setError(err instanceof Error && err.message ? err.message : "No se pudo guardar. Intenta de nuevo."); setBusy(false); }
  }

  return (
    <Modal label={post ? "Editar publicación" : "Nueva publicación"} width={780} locked={busy} onClose={onCancel}>
        <div className="admin-modal-head">
          <h3>{post ? "Editar publicación" : "Nueva publicación"}</h3>
          <button type="button" className="icon-btn" aria-label="Cerrar" onClick={onCancel} disabled={busy}><Icon name="close" /></button>
        </div>
        <div className="form-grid">
          <div className="field full"><label>Título</label><input id="pbTitle" value={f.title} onChange={(e) => set("title", e.target.value)} /></div>
          <div className="field"><label>Categoría</label>
            <input id="pbCat" list="pbCats" value={f.category} onChange={(e) => set("category", e.target.value)} />
            <datalist id="pbCats">{POST_CATEGORIES.map((c) => <option key={c} value={c} />)}</datalist>
          </div>
          <div className="field"><label>Fecha de publicación</label><input id="pbDate" type="date" value={f.publishedAt} onChange={(e) => set("publishedAt", e.target.value)} /></div>
          <div className="field"><label>Autor</label><input id="pbAuthor" value={f.author} onChange={(e) => set("author", e.target.value)} /></div>
          <div className="field"><label>Imagen de portada (enlace)</label><input id="pbCover" placeholder="https://…/foto.jpg" value={f.coverUrl} onChange={(e) => set("coverUrl", e.target.value)} /></div>
          <div className="field full"><label>Resumen (se ve en la lista)</label><textarea id="pbExcerpt" rows={2} value={f.excerpt} onChange={(e) => set("excerpt", e.target.value)} /></div>
          <div className="field full"><label>Contenido</label>
            <textarea id="pbBody" rows={14} value={f.body} onChange={(e) => set("body", e.target.value)} />
            <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 6 }}>Separa los párrafos con una línea en blanco. Empieza una línea con <b>## </b> para un subtítulo, y con <b>- </b> para una lista.</p>
          </div>
          <label className="field full" style={{ display: "flex", gap: 10, alignItems: "center", cursor: "pointer" }}>
            <input type="checkbox" style={{ width: "auto" }} checked={f.published} onChange={(e) => set("published", e.target.checked)} />
            <span style={{ fontSize: 14 }}>Publicado (visible en Notiviajero)</span>
          </label>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="admin-modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={busy}>Cancelar</button>
          <button type="button" className="btn btn-primary" id="pbSave" onClick={() => void submit()} disabled={busy}>{busy ? "Guardando…" : "Guardar"}</button>
        </div>
    </Modal>
  );
}

export function AdminNotiviajero() {
  const { authed, toast } = useApp();
  const [posts, setPosts] = useState<BlogPost[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [editing, setEditing] = useState<BlogPost | "new" | null>(null);

  const load = useCallback(async () => {
    setFailed(false);
    try { setPosts(await authed(adminListPosts)); } catch (err) { console.error(err); setFailed(true); }
  }, [authed]);
  useEffect(() => { void load(); }, [load]);

  const save = async (id: string | null, v: BlogInput, quiet = false) => {
    const saved = await authed(savePost, id, v);
    setPosts((prev) => {
      const list = prev ?? [];
      return (id ? list.map((p) => (p.id === saved.id ? saved : p)) : [saved, ...list]).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    });
    if (!quiet) toast(id ? "Publicación actualizada" : "Publicación creada");
  };
  const toggle = async (p: BlogPost) => {
    try { await save(p.id, { ...p, published: !p.published }, true); toast(p.published ? "Publicación oculta del sitio" : "Publicación visible en Notiviajero"); }
    catch (err) { console.error(err); toast("No se pudo cambiar. Intenta de nuevo."); }
  };
  const remove = async (p: BlogPost) => {
    if (!confirm("¿Eliminar \"" + p.title + "\"? No se puede deshacer.")) return;
    try { await authed(deletePost, p.id); setPosts((prev) => (prev ?? []).filter((x) => x.id !== p.id)); toast("Publicación eliminada"); }
    catch (err) { console.error(err); toast("No se pudo eliminar. Intenta de nuevo."); }
  };

  return (
    <div className="fade-in">
      <div className="admin-head">
        <div><h1>Notiviajero</h1><p>Blogs, noticias y tips de viaje. Lo que publiques aparece en la página Notiviajero del sitio.</p></div>
        <button className="btn btn-primary btn-sm" onClick={() => setEditing("new")}><Icon name="plus" /> Nueva publicación</button>
      </div>
      <div className="panel">
        {failed ? <p className="empty-note">No se pudieron cargar las publicaciones. <button type="button" className="btn btn-ghost btn-sm" onClick={() => void load()}>Reintentar</button></p>
          : posts === null ? <p className="empty-note">Cargando publicaciones…</p>
          : posts.length === 0 ? <p className="empty-note">Aún no hay publicaciones. Crea la primera con “Nueva publicación”.</p>
          : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Título</th><th>Categoría</th><th>Fecha</th><th>Publicado</th><th></th></tr></thead>
                <tbody>
                  {posts.map((p) => (
                    <tr key={p.id}>
                      <td className="wrap">{p.title}</td><td>{p.category}</td><td>{formatPostDate(p.publishedAt)}</td>
                      <td><div className={"switch" + (p.published ? " on" : "")} role="switch" aria-checked={p.published} onClick={() => void toggle(p)} /></td>
                      <td><div className="row-actions">
                        <button className="icon-btn" aria-label="Editar" onClick={() => setEditing(p)}><Icon name="edit" /></button>
                        <a className="icon-btn" aria-label="Ver en el sitio" href={"/notiviajero/" + p.id} target="_blank" rel="noopener noreferrer"><Icon name="eye" /></a>
                        <button className="icon-btn" aria-label="Eliminar" onClick={() => void remove(p)}><Icon name="trash" /></button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>
      {editing && (
        <PostEditor
          key={editing === "new" ? "new" : editing.id} post={editing === "new" ? null : editing}
          onCancel={() => setEditing(null)}
          onSave={async (v) => { await save(editing === "new" ? null : editing.id, v); setEditing(null); }}
        />
      )}
    </div>
  );
}
