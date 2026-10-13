-- Panel administrativo editable: textos del sitio, reseñas y catálogo de parques/tours guardados en la base,
-- y campos extra en fincas (visibilidad, fotos, duración) para poder editarlas por completo desde Inventario.
-- Como el resto de tablas, solo se accede desde el servidor (RLS activo y sin políticas).

create table public.site_content (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.site_content enable row level security;

alter table public.fincas add column active boolean not null default true;
alter table public.fincas add column photos text[] not null default '{}';
