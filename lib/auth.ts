import "server-only";

// Hash de contraseñas (scrypt) y de tokens de sesión (SHA-256), y validación de sesiones en el servidor.

import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { db } from "@/lib/db";

const scryptAsync = promisify(scrypt) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;

/** Formato "scrypt$<salt>$<hash>" en base64url; scripts/create-user.mjs genera el mismo. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt, 64);
  return `scrypt$${salt.toString("base64url")}$${hash.toString("base64url")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algo, salt, hash] = stored.split("$");
  if (algo !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64url");
  const actual = await scryptAsync(password, Buffer.from(salt, "base64url"), expected.length);
  return timingSafeEqual(actual, expected);
}

/** Token opaco que se entrega al navegador; en la base solo queda su hash. */
export function newSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export interface SessionUser { id: number; email: string; name: string }

/** Usuario dueño del token, o null si no existe o ya venció. */
export async function findSession(token: unknown): Promise<SessionUser | null> {
  if (typeof token !== "string" || !token || token.length > 100) return null;
  const [u] = await db()<SessionUser[]>`
    select u.id::int, u.email, u.name
    from sesiones s join usuarios u on u.id = s.usuario_id
    where s.token_hash = ${hashToken(token)} and s.expires_at > now()`;
  return u ?? null;
}

/** Guarda de las Server Actions protegidas: sin sesión válida no se ejecuta nada. */
export async function requireSession(token: unknown): Promise<SessionUser> {
  const user = await findSession(token);
  if (!user) throw new Error("No autorizado: inicia sesión de nuevo.");
  return user;
}
