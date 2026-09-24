-- Usuarios del equipo (acceso a los paneles de gestión y administrativo) y sus sesiones.
-- La contraseña se guarda con scrypt ("scrypt$<salt>$<hash>", ver lib/auth.ts) y de cada token de sesión
-- solo se guarda su SHA-256: quien lea la tabla no puede suplantar a nadie.

create table public.usuarios (
  id            bigint generated always as identity primary key,
  email         text not null unique check (email = lower(email)),
  name          text not null default '',
  password_hash text not null,
  created_at    timestamptz not null default now()
);

create table public.sesiones (
  token_hash   text primary key,
  usuario_id   bigint not null references public.usuarios (id) on delete cascade,
  expires_at   timestamptz not null,
  created_at   timestamptz not null default now()
);
create index sesiones_usuario_idx on public.sesiones (usuario_id);

alter table public.usuarios enable row level security;
alter table public.sesiones enable row level security;
