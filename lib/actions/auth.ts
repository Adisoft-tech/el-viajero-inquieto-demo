"use server";

// Login del equipo: valida correo y contraseña contra la tabla usuarios y entrega un token de sesión
// que el navegador guarda en localStorage (ver lib/store.tsx). La misma sesión abre gestión y admin.

import { db } from "@/lib/db";
import { findSession, hashPassword, hashToken, newSessionToken, verifyPassword, type SessionUser } from "@/lib/auth";

const SESSION_DAYS = 30;

export type { SessionUser };

export type LoginResult = { ok: true; token: string; user: SessionUser } | { ok: false; error: string };

// Hash de relleno para que un correo inexistente tarde lo mismo que una contraseña errada.
let dummyHash: Promise<string> | undefined;

export async function login(email: string, password: string): Promise<LoginResult> {
  const mail = typeof email === "string" ? email.trim().toLowerCase().slice(0, 160) : "";
  const pw = typeof password === "string" ? password.slice(0, 200) : "";
  if (!mail || !pw) return { ok: false, error: "Escribe tu correo y tu contraseña." };

  const sql = db();
  const [u] = await sql<(SessionUser & { passwordHash: string })[]>`
    select id::int, email, name, password_hash as "passwordHash" from usuarios where email = ${mail}`;
  const valid = await verifyPassword(pw, u?.passwordHash ?? (await (dummyHash ??= hashPassword("x"))));
  if (!u || !valid) return { ok: false, error: "Correo o contraseña incorrectos." };

  const token = newSessionToken();
  await sql`
    insert into sesiones (token_hash, usuario_id, expires_at)
    values (${hashToken(token)}, ${u.id}, now() + make_interval(days => ${SESSION_DAYS}))`;
  // Limpieza oportunista de sesiones vencidas.
  await sql`delete from sesiones where expires_at < now()`;
  return { ok: true, token, user: { id: u.id, email: u.email, name: u.name } };
}

/** Devuelve el usuario dueño del token, o null si no existe o ya venció. */
export async function getSession(token: string): Promise<SessionUser | null> {
  return findSession(token);
}

export async function logout(token: string): Promise<void> {
  if (typeof token !== "string" || !token || token.length > 100) return;
  await db()`delete from sesiones where token_hash = ${hashToken(token)}`;
}
