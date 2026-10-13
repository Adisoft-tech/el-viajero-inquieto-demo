"use server";

// Server Actions de Notiviajero. Leer los artículos publicados es público; crear, editar, ocultar y borrar
// exigen como primer argumento el token de sesión del equipo.

import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";

export interface BlogPost {
  id: string; title: string; excerpt: string; body: string; category: string;
  coverUrl: string; author: string; published: boolean; publishedAt: string; updatedAt: string;
}
export interface BlogInput {
  title: string; excerpt: string; body: string; category: string;
  coverUrl: string; author: string; published: boolean; publishedAt: string;
}

const COLS = `id, title, excerpt, body, category, cover_url as "coverUrl", author, published,
  published_at::text as "publishedAt", updated_at::text as "updatedAt"`;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function text(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}
function slugify(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "articulo";
}
/** Solo rutas del sitio o enlaces http(s). */
function url(v: unknown): string {
  const s = text(v, 1000);
  return /^(https?:\/\/|\/)/i.test(s) ? s : "";
}

/** Artículos publicados para el sitio (sin el cuerpo, que se pide aparte al abrir uno). */
export async function listPublishedPosts(): Promise<Omit<BlogPost, "body">[]> {
  return db().unsafe(
    `select ${COLS.replace("body, ", "")} from blog_posts where published and published_at <= current_date order by published_at desc, created_at desc`,
  );
}

export async function getPublishedPost(id: string): Promise<BlogPost | null> {
  const [row] = await db().unsafe<BlogPost[]>(
    `select ${COLS} from blog_posts where id = $1 and published and published_at <= current_date`, [text(id, 120)],
  );
  return row ?? null;
}

export async function adminListPosts(token: string): Promise<BlogPost[]> {
  await requireSession(token);
  return db().unsafe<BlogPost[]>(`select ${COLS} from blog_posts order by published_at desc, created_at desc`);
}

/** Crea el artículo (id null) o actualiza el existente. La dirección (slug) se fija al crear. */
export async function savePost(token: string, id: string | null, input: BlogInput): Promise<BlogPost> {
  await requireSession(token);
  const title = text(input.title, 160);
  if (!title) throw new Error("Falta el título");
  const publishedAt = ISO_DATE.test(String(input.publishedAt)) ? input.publishedAt : new Date().toISOString().slice(0, 10);
  const v = {
    title, excerpt: text(input.excerpt, 400), body: text(input.body, 50000),
    category: text(input.category, 40) || "Blog", cover_url: url(input.coverUrl),
    author: text(input.author, 120) || "El Viajero Inquieto", published: input.published === true, published_at: publishedAt,
  };
  const sql = db();
  if (id) {
    const rows = await sql.unsafe<BlogPost[]>(
      `update blog_posts set title=$2, excerpt=$3, body=$4, category=$5, cover_url=$6, author=$7, published=$8, published_at=$9, updated_at=now()
       where id=$1 returning ${COLS}`,
      [text(id, 120), v.title, v.excerpt, v.body, v.category, v.cover_url, v.author, v.published, v.published_at],
    );
    if (!rows.length) throw new Error("El artículo no existe");
    return rows[0];
  }
  const base = slugify(title);
  let slug = base;
  for (let n = 2; (await sql`select 1 from blog_posts where id = ${slug}`).length; n++) slug = base + "-" + n;
  const [row] = await sql.unsafe<BlogPost[]>(
    `insert into blog_posts (id, title, excerpt, body, category, cover_url, author, published, published_at)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9) returning ${COLS}`,
    [slug, v.title, v.excerpt, v.body, v.category, v.cover_url, v.author, v.published, v.published_at],
  );
  return row;
}

export async function deletePost(token: string, id: string): Promise<void> {
  await requireSession(token);
  await db()`delete from blog_posts where id = ${text(id, 120)}`;
}
