-- Panel de gestión: fincas, reservas del calendario y documentos (cotizaciones, cuentas de cobro y de pago).
-- La app accede solo desde el servidor con el rol postgres; RLS queda activo y sin políticas para que
-- la API pública de Supabase (anon / authenticated) no pueda leer ni escribir estas tablas.

create table public.fincas (
  id          text primary key,
  name        text not null,
  town        text not null default 'Por definir',
  dept        text not null default 'Eje cafetero',
  icon        text not null default 'valle',
  tone        text not null default 'sage' check (tone in ('sage', 'lagoon', 'ink')),
  price       integer not null default 0 check (price >= 0),
  cap         integer not null default 1 check (cap >= 1),
  rating      numeric(2, 1) not null default 5.0,
  reviews     integer not null default 0,
  tags        text[] not null default '{}',
  description text not null default '',
  highlights  text[] not null default '{}',
  -- Borrado lógico: la finca sale del catálogo pero sus reservas conservan la referencia.
  deleted_at  timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.finca_bookings (
  id           bigint generated always as identity primary key,
  finca_id     text not null references public.fincas (id) on update cascade on delete restrict,
  guest        text not null,
  cedula       text not null default '',
  phone        text not null default '',
  email        text not null default '',
  checkin      date not null,
  checkout     date not null,
  arrival_time text not null default '15:00',
  guests       integer not null default 1 check (guests >= 1),
  adults       integer,
  children     integer,
  pay_method   text not null default 'Transferencia',
  total        bigint not null default 0 check (total >= 0),
  advance      bigint not null default 0 check (advance >= 0),
  balance      bigint generated always as (greatest(total - advance, 0)) stored,
  source       text not null default 'manual' check (source in ('manual', 'excel')),
  created_at   timestamptz not null default now(),
  constraint finca_bookings_dates check (checkout > checkin)
);
create index finca_bookings_finca_checkin_idx on public.finca_bookings (finca_id, checkin);

create table public.doc_counters (
  type        text primary key check (type in ('cotizacion', 'cobro', 'pago')),
  last_number integer not null default 0 check (last_number >= 0)
);
insert into public.doc_counters (type) values ('cotizacion'), ('cobro'), ('pago');

create table public.documentos (
  id         bigint generated always as identity primary key,
  type       text not null references public.doc_counters (type),
  numero     integer not null,
  fecha      date not null,
  cliente    text not null default '',
  total      bigint not null default 0,
  -- Copia completa del formulario (ítems, contacto, observaciones) para volver a generar el PDF igual.
  data       jsonb not null,
  created_at timestamptz not null default now(),
  unique (type, numero)
);
create index documentos_created_at_idx on public.documentos (created_at desc);

alter table public.fincas enable row level security;
alter table public.finca_bookings enable row level security;
alter table public.doc_counters enable row level security;
alter table public.documentos enable row level security;

-- Catálogo inicial de fincas y cabañas (mismo contenido que INITIAL_LISTINGS en lib/data.ts).
insert into public.fincas (id, name, town, dept, icon, tone, price, cap, rating, reviews, tags, description, highlights) values
('finca-serrana', 'Finca La Serrana', 'Salento', 'Quindío', 'valle', 'sage', 420000, 8, 4.9, 86,
  array['Vista al Valle de Cocora', 'Fogata nocturna'],
  'Casona de finca cafetera restaurada con balcón corrido hacia el Valle de Cocora. Los anfitriones preparan un desayuno campesino cada mañana y organizan una caminata guiada opcional entre palmas de cera.',
  array['Desayuno campesino incluido', 'Fogata y chocolate al atardecer', 'A 8 min del mirador de Cocora', 'Wifi y parqueadero privado']),
('mirador-quindio', 'Cabañas El Mirador del Quindío', 'Filandia', 'Quindío', 'mirador', 'lagoon', 310000, 6, 4.8, 64,
  array['Mirador 360°', 'Cerca a Colina Iluminada'],
  'Tres cabañas de madera y guadua en lo alto de Filandia, con vista abierta a la cordillera. Ideal para quienes quieren atardeceres largos y silencio real.',
  array['Mirador privado 360°', 'A 10 min del pueblo', 'Chimenea de leña', 'Terraza para café de la tarde']),
('hacienda-buenavista', 'Hacienda Buenavista', 'Circasia', 'Quindío', 'cafe', 'ink', 650000, 12, 5.0, 41,
  array['Cultivo propio', 'Piscina'],
  'Casona centenaria en medio de un cultivo de café activo, con piscina, corredores de tapia y un tour de finca incluido para entender el grano de punta a punta.',
  array['Tour de finca cafetera incluido', 'Piscina y zona de BBQ', '6 habitaciones, 12 huéspedes', 'Ideal para grupos y familias grandes']),
('refugio-cocora', 'Refugio Cocora', 'Salento', 'Quindío', 'valle', 'sage', 280000, 4, 4.7, 53,
  array['A pie del valle', 'Ideal parejas'],
  'Una cabaña pequeña y sencilla, pensada para parejas o familias cortas que quieren caminar al Valle de Cocora sin madrugar en carretera.',
  array['A 5 min a pie del sendero', 'Cocina equipada', 'Vista directa a las palmas de cera', 'Estufa a leña']),
('cafe-bosque', 'Finca Café y Bosque', 'Chinchiná', 'Caldas', 'cafe', 'sage', 360000, 10, 4.8, 37,
  array['Trapiche activo', 'Bosque de niebla'],
  'Finca productiva con trapiche en funcionamiento y senderos propios hacia un fragmento de bosque de niebla. Los anfitriones son la tercera generación de la familia caficultora.',
  array['Trapiche panelero activo', 'Senderos privados de bosque', 'Cena típica bajo pedido', 'A 25 min de Manizales']),
('termales-otun', 'Cabañas Termales del Otún', 'Santa Rosa de Cabal', 'Risaralda', 'termal', 'lagoon', 390000, 6, 4.9, 58,
  array['Piscinas termales', 'Acceso privado'],
  'Cabañas junto al cañón del río Otún, con acceso privado a un sistema de piscinas termales alimentadas por aguas volcánicas.',
  array['Acceso privado a termales', 'Vista al cañón del Otún', 'Zona de picnic junto al río', 'A 20 min de Santa Rosa de Cabal']);
