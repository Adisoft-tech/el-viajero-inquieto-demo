-- Versión en inglés (opcional) de los textos de cada finca, para el sitio en inglés.
alter table public.fincas add column name_en text not null default '';
alter table public.fincas add column description_en text not null default '';
alter table public.fincas add column highlights_en text[] not null default '{}';
alter table public.fincas add column tags_en text[] not null default '{}';
