import "server-only";

// Cliente de Postgres (Supabase) compartido por las Server Actions. Solo corre en el servidor:
// la cadena de conexión nunca llega al navegador.

import postgres from "postgres";

declare global {
  // Reutiliza la conexión entre recargas en desarrollo.
  var __sql: postgres.Sql | undefined;
}

/** Se crea al primer uso (no al importar) para que el build no dependa de DATABASE_URL. */
export function db(): postgres.Sql {
  if (globalThis.__sql) return globalThis.__sql;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Falta DATABASE_URL — cópiala de .env.example a .env.local.");
  globalThis.__sql = postgres(url, {
    ssl: "require",
    // El pooler de Supabase en modo transacción (puerto 6543) no admite sentencias preparadas.
    prepare: false,
    max: 5,
    idle_timeout: 20,
  });
  return globalThis.__sql;
}
