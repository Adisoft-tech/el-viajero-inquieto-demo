// Crea (o actualiza la contraseña de) un usuario del equipo.
// Uso: npm run db:create-user -- <correo> <contraseña> ["Nombre"]

import { randomBytes, scryptSync } from "node:crypto";
import postgres from "postgres";

const [email, password, name = ""] = process.argv.slice(2);
if (!email || !password) {
  console.error('Uso: npm run db:create-user -- <correo> <contraseña> ["Nombre"]');
  process.exit(1);
}
if (password.length < 8) {
  console.error("La contraseña debe tener al menos 8 caracteres.");
  process.exit(1);
}

// Mismo formato que hashPassword() en lib/auth.ts.
const salt = randomBytes(16);
const hash = `scrypt$${salt.toString("base64url")}$${scryptSync(password, salt, 64).toString("base64url")}`;

const sql = postgres(process.env.DATABASE_URL, { ssl: "require", prepare: false, max: 1 });
try {
  const [u] = await sql`
    insert into usuarios (email, name, password_hash) values (${email.trim().toLowerCase()}, ${name}, ${hash})
    on conflict (email) do update set password_hash = excluded.password_hash,
      name = coalesce(nullif(excluded.name, ''), usuarios.name)
    returning id, email`;
  // Cambiar la contraseña cierra las sesiones abiertas de ese usuario.
  await sql`delete from sesiones where usuario_id = ${u.id}`;
  console.log(`✓ Usuario listo: ${u.email} (id ${u.id})`);
} finally {
  await sql.end();
}
