"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { BlogPost } from "@/lib/actions/blog";
import { Icon } from "@/lib/icons";
import { ROUTES } from "@/lib/routes";
import { CrumbLink } from "./Crumb";
import { useI18n } from "./SiteContext";

export const POST_CATEGORIES = ["Blog", "Noticias", "Tips", "Destinos", "Guías"];

export function formatPostDate(iso: string): string {
  return new Date(iso.slice(0, 10) + "T00:00:00").toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
}

function Cover({ post }: { post: Pick<BlogPost, "coverUrl" | "title"> }) {
  return (
    <div className="blog-cover">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {post.coverUrl ? <img src={post.coverUrl} alt={post.title} loading="lazy" /> : <Icon name="trip" />}
    </div>
  );
}

/** Texto del artículo: párrafos separados por línea en blanco, "## " para subtítulos y "- " para listas. */
export function PostBody({ text }: { text: string }) {
  const blocks = text.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className="post-body">
      {blocks.map((b, i) => {
        if (b.startsWith("## ")) return <h2 key={i}>{b.slice(3)}</h2>;
        const lines = b.split("\n");
        if (lines.every((l) => l.trim().startsWith("- "))) return <ul key={i}>{lines.map((l, j) => <li key={j}>{l.trim().slice(2)}</li>)}</ul>;
        return <p key={i}>{lines.map((l, j) => <span key={j}>{j > 0 && <br />}{l}</span>)}</p>;
      })}
    </div>
  );
}

export function Notiviajero({ posts }: { posts: Omit<BlogPost, "body">[] }) {
  const { t, tx, fmtDate } = useI18n();
  const [cat, setCat] = useState("Todas");
  const cats = useMemo(() => ["Todas", ...Array.from(new Set(posts.map((p) => p.category)))], [posts]);
  const shown = cat === "Todas" ? posts : posts.filter((p) => p.category === cat);
  return (
    <section className="section" style={{ paddingTop: 40 }}><div className="container">
      <div className="crumb"><CrumbLink href={ROUTES.home}>{t("Inicio")}</CrumbLink> / <span>Notiviajero</span></div>
      <div className="section-head">
        <div><p className="eyebrow">Notiviajero</p><h2>{t("Historias, noticias y tips para viajar mejor")}</h2><p>{t("Lo que aprendemos en el camino: destinos, consejos y novedades del turismo en Colombia.")}</p></div>
      </div>
      {cats.length > 2 && (
        <div className="blog-chips">
          {cats.map((c) => <button key={c} type="button" className={"blog-chip" + (c === cat ? " active" : "")} onClick={() => setCat(c)}>{tx(c)}</button>)}
        </div>
      )}
      {shown.length ? (
        <div className="blog-grid">
          {shown.map((p) => (
            <Link key={p.id} href={ROUTES.post(p.id)} className="blog-card">
              <Cover post={p} />
              <div className="blog-card-body">
                <div className="blog-meta"><span className="blog-tag">{tx(p.category)}</span><span>{fmtDate(p.publishedAt)}</span></div>
                <h3>{p.title}</h3>
                {p.excerpt && <p>{p.excerpt}</p>}
                <span className="blog-more">{t("Leer más")} <Icon name="arrow" /></span>
              </div>
            </Link>
          ))}
        </div>
      ) : <p className="empty-note">{t("Aún no hay publicaciones. Muy pronto compartiremos historias y consejos de viaje.")}</p>}
    </div></section>
  );
}

export function PostPage({ post }: { post: BlogPost | null }) {
  const { t, tx, fmtDate } = useI18n();
  if (!post) {
    return (
      <div className="container section">
        <p>{t("No encontramos esta publicación.")}</p>
        <Link href={ROUTES.notiviajero} className="btn btn-ghost" style={{ marginTop: 12 }}>{t("Ver Notiviajero")}</Link>
      </div>
    );
  }
  return (
    <section className="section" style={{ paddingTop: 36 }}><div className="container">
      <div className="crumb"><CrumbLink href={ROUTES.home}>{t("Inicio")}</CrumbLink> / <CrumbLink href={ROUTES.notiviajero}>Notiviajero</CrumbLink> / <span>{post.title}</span></div>
      <article className="post-wrap">
        <div className="blog-meta"><span className="blog-tag">{tx(post.category)}</span><span>{fmtDate(post.publishedAt)}</span><span>{t("Por")} {post.author}</span></div>
        <h1>{post.title}</h1>
        {post.excerpt && <p className="post-lede">{post.excerpt}</p>}
        {post.coverUrl && (
          <div className="post-cover">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.coverUrl} alt={post.title} />
          </div>
        )}
        <PostBody text={post.body} />
        <Link href={ROUTES.notiviajero} className="btn btn-ghost" style={{ marginTop: 30 }}>← {t("Más publicaciones")}</Link>
      </article>
    </div></section>
  );
}
