-- Notiviajero: blog de viajes, noticias y tips escrito por el administrador.
-- Como el resto de tablas, solo se accede desde el servidor (RLS activo y sin políticas).

create table public.blog_posts (
  id           text primary key,                       -- slug de la URL
  title        text not null,
  excerpt      text not null default '',
  body         text not null default '',
  category     text not null default 'Blog',
  cover_url    text not null default '',
  author       text not null default 'El Viajero Inquieto',
  published    boolean not null default false,
  published_at date not null default current_date,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index blog_posts_published_idx on public.blog_posts (published, published_at desc);
alter table public.blog_posts enable row level security;
