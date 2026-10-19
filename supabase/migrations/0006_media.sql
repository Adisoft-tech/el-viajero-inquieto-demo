-- Imágenes subidas desde el panel administrativo (portadas de Notiviajero). Se guardan en la base y se sirven
-- desde /api/media/<id>; el navegador las comprime antes de subirlas. Solo se accede desde el servidor.

create table public.media (
  id           text primary key,
  content_type text not null,
  data         bytea not null,
  size         integer not null,
  created_at   timestamptz not null default now()
);
alter table public.media enable row level security;
