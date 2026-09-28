-- Añade el tipo de documento "itinerario" (día a día, sin ítems ni totales monetarios).
-- documentos.type ya es FK a doc_counters(type), así que basta con ampliar el check y crear el contador.

alter table public.doc_counters drop constraint doc_counters_type_check;
alter table public.doc_counters add constraint doc_counters_type_check
  check (type in ('cotizacion', 'cobro', 'pago', 'itinerario'));

insert into public.doc_counters (type) values ('itinerario') on conflict do nothing;
