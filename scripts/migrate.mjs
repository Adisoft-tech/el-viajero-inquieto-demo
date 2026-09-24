// Aplica en orden las migraciones de supabase/migrations que aún no se han corrido.
// Uso: npm run db:migrate   (lee DATABASE_URL de .env.local)

import { readdir, readFile } from "node:fs/promises";
import postgres from "postgres";

const dir = new URL("../supabase/migrations/", import.meta.url);
const sql = postgres(process.env.DATABASE_URL, { ssl: "require", prepare: false, max: 1, onnotice: () => {} });

try {
  await sql`create table if not exists public.schema_migrations (name text primary key, applied_at timestamptz not null default now())`;
  await sql`alter table public.schema_migrations enable row level security`;

  // Bases creadas antes de este script: la 0001 ya se aplicó a mano con psql.
  const [{ baseline }] = await sql`select to_regclass('public.fincas') is not null as baseline`;
  if (baseline) await sql`insert into schema_migrations (name) values ('0001_gestion.sql') on conflict do nothing`;

  const applied = new Set((await sql`select name from schema_migrations`).map((r) => r.name));
  const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();
  let count = 0;
  for (const file of files) {
    if (applied.has(file)) continue;
    const body = await readFile(new URL(file, dir), "utf8");
    await sql.begin(async (tx) => {
      await tx.unsafe(body);
      await tx`insert into schema_migrations (name) values (${file})`;
    });
    console.log("✓ " + file);
    count++;
  }
  console.log(count ? `${count} migración(es) aplicada(s).` : "La base ya está al día.");
} finally {
  await sql.end();
}
