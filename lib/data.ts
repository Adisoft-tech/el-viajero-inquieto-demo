// Datos semilla de la demo (sin backend). El estado mutable vive en lib/store.tsx.

export type Category = "alojamientos" | "parques" | "tours";
export interface Listing {
  id: string; cat: Category; name: string; town: string; dept: string;
  icon: string; tone: "sage" | "lagoon" | "ink"; unit: "noche" | "persona";
  price: number; cap: number; rating: number; reviews: number;
  duration?: string; tags: string[]; desc: string; highlights: string[];
  /** Versión en inglés (opcional): si falta, el sitio en inglés usa la traducción por defecto o el texto en español. */
  nameEn?: string; descEn?: string; highlightsEn?: string[]; tagsEn?: string[]; durationEn?: string; scheduleEn?: string;
  /** Fecha del viaje programado, en texto libre (ej. "15–18 de marzo de 2027"); se muestra en el inicio. */
  schedule?: string;
  /** Fotos propias del listado (URLs); si faltan se usan las de LISTING_GALLERY. */
  photos?: string[];
  /** Si existe, el listado enlaza a esta página externa (ej. el parque aliado en Triviantes) en vez de a nuestro propio detalle. */
  externalUrl?: string;
  /** false = oculto del sitio público (se cambia desde Inventario). */
  active?: boolean; [key: string]: unknown;
}
export type SiteContent = Record<string, string>;
export interface Review { name: string; origin: string; rating: number; quote: string; listing: string }
export interface Booking {
  code: string; guest: string; listing: string; dates: string; guests: number;
  total: number; pay: string; status: string; [key: string]: unknown;
}
export interface FincaBooking {
  id: number; fincaId: string; guest: string; cedula: string; phone: string; email: string;
  checkin: string; checkout: string; time: string; guests: number; payMethod: string;
  total: number; advance: number; balance: number; [key: string]: unknown;
}

export const INITIAL_CONTENT: SiteContent = {
  // Inicio
  heroEyebrow: "Agencia de viajes · Colombia",
  heroTitle: "Colombia, en una forma <em>más cercana</em>",
  heroLede: "Fincas que se vuelven refugio, rutas que despiertan curiosidad y destinos vividos desde la emoción. Reserva directamente con quienes conocen cada camino.",
  rnt: "222679",
  rntLabel: "Registro Nacional de Turismo activo",
  heroTripsTitle: "Viajes programados 2027",
  heroTripsText: "Salidas con fecha fija, guía y todo organizado. Reserva tu cupo con tiempo.",
  catSectionTitle: "Tres formas de recorrer Colombia",
  catAlojTitle: "Fincas y Cabañas",
  catAlojDesc: "Casonas cafeteras, cabañas de montaña y refugios con anfitriones reales.",
  catParquesTitle: "Parques Temáticos",
  catParquesDesc: "Café, agro, agua y naturaleza en los parques más visitados de Colombia.",
  catToursTitle: "Experiencias",
  catToursDesc: "Caminatas, kayak, avistamiento de aves y rutas guiadas de un día.",
  featuredTitle: "Lo que más reservan nuestros viajeros",
  trustTitle: "Anfitrión atento, no una vitrina más",
  trust1Title: "Reserva directa por WhatsApp",
  trust1Desc: "Coordinas fechas y pago directamente con nuestro equipo, sin intermediarios.",
  trust2Title: "Anfitriones reales",
  trust2Desc: "Cada finca y tour lo opera gente del territorio, no un intermediario anónimo.",
  trust3Title: "Curaduría local",
  trust3Desc: "Seleccionamos cada experiencia por calidad, no por comisión.",
  trust4Title: "Atención humana",
  trust4Desc: "Antes, durante y después del viaje, alguien responde de verdad.",
  reviewsTitle: "Voces de quienes ya viajaron",
  aboutEyebrow: "Nuestra esencia",
  aboutTitle: "El lujo de sentirse en casa",
  aboutText: "Creamos experiencias de viaje personalizadas y memorables en Colombia, conectando de manera responsable a los viajeros con la riqueza cultural, natural y humana de cada destino. Viajar juntos: la experiencia empieza antes de llegar y continúa en la memoria.",
  // Página Nosotros (los párrafos se separan con una línea en blanco)
  nosEyebrow: "Nuestra esencia",
  nosName: "AGENCIA DE VIAJES",
  nosMotto: "Viajando lento, profundo y con sentido.",
  nosMissionTitle: "Misión",
  nosMission: "En El Viajero Inquieto Agencia de Viajes creamos y acompañamos experiencias de viaje que conectan a las personas con los territorios, sus culturas y sus comunidades.\n\nDiseñamos viajes con sentido, combinando turismo, educación y experiencias pedagógicas que permitan a niños, jóvenes, familias y viajeros conocer, aprender, disfrutar y comprender mejor el país que habitamos.\n\nTrabajamos con cercanía, transparencia y responsabilidad, procurando que cada viaje genere valor no solo para quien viaja, sino también para los lugares y las personas que nos reciben.\n\nPorque creemos que viajar puede enseñarnos, transformarnos y también transformar positivamente los lugares que visitamos.",
  nosVisionTitle: "Visión",
  nosVision: "Queremos que El Viajero Inquieto sea una agencia de viajes reconocida en Colombia por su manera humana y responsable de hacer turismo, creciendo sin perder nuestra esencia y llevando cada vez más personas a descubrir el país y el mundo.\n\nAspiramos a seguir construyendo experiencias que dejen huella, especialmente en nuestros procesos educativos con colegios y en las comunidades que visitamos.\n\nQueremos que, con el paso de los años, podamos regresar a esos lugares y encontrarnos con personas, familias y comunidades que hayan avanzado, crecido y encontrado nuevas oportunidades, sintiendo que nuestra presencia alguna vez aportó algo positivo a sus vidas.",
  nosPurposeTitle: "Nuestro propósito",
  nosPurpose: "Viajar para conocer, aprender, conectar y dejar algo bueno en el camino.\n\nPorque para nosotros el verdadero valor de un viaje no termina cuando regresamos a casa.\n\nA veces, lo más bonito es volver y descubrir que algo cambió.",
  // Contacto y redes
  contactEyebrow: "Contacto",
  contactTitle: "Hablemos de tu próximo viaje",
  contactEmail: "elviajeroinquieto11@gmail.com",
  contactPhone: "314 873 4314",
  contactCity: "Manizales, Caldas",
  whatsappNumber: "573148734314",
  whatsappMessage: "Hola! Estoy interesado en una experiencia con El Viajero Inquieto",
  socialTitle: "Síguenos",
  facebookUrl: "https://www.facebook.com/people/El-viajero-inquieto/61572239858718/?mibextid=wwXIfr&rdid=BObk5mMe9Qp2PFFH&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1e2pvzghQU%2F%3Fmibextid%3DwwXIfr",
  instagramUrl: "https://www.instagram.com/elviajeroinquieto11?stkn=MWJxaWtlbnVtdXZvYw%3D%3D&utm_source=qr",
  // Pie de página
  footerTagline: "Turismo familiar, fincas y experiencias con raíz colombiana, en toda Colombia y en el exterior.",
};

export const INITIAL_LISTINGS: Listing[] = [
  {id:"finca-serrana", cat:"alojamientos", name:"Finca La Serrana", town:"Salento", dept:"Quindío", icon:"valle", tone:"sage", unit:"noche", price:420000, cap:8, rating:4.9, reviews:86, tags:["Vista al Valle de Cocora","Fogata nocturna"], desc:"Casona de finca cafetera restaurada con balcón corrido hacia el Valle de Cocora. Los anfitriones preparan un desayuno campesino cada mañana y organizan una caminata guiada opcional entre palmas de cera.", highlights:["Desayuno campesino incluido","Fogata y chocolate al atardecer","A 8 min del mirador de Cocora","Wifi y parqueadero privado"]},
  {id:"mirador-quindio", cat:"alojamientos", name:"Cabañas El Mirador del Quindío", town:"Filandia", dept:"Quindío", icon:"mirador", tone:"lagoon", unit:"noche", price:310000, cap:6, rating:4.8, reviews:64, tags:["Mirador 360°","Cerca a Colina Iluminada"], desc:"Tres cabañas de madera y guadua en lo alto de Filandia, con vista abierta a la cordillera. Ideal para quienes quieren atardeceres largos y silencio real.", highlights:["Mirador privado 360°","A 10 min del pueblo","Chimenea de leña","Terraza para café de la tarde"]},
  {id:"hacienda-buenavista", cat:"alojamientos", name:"Hacienda Buenavista", town:"Circasia", dept:"Quindío", icon:"cafe", tone:"ink", unit:"noche", price:650000, cap:12, rating:5.0, reviews:41, tags:["Cultivo propio","Piscina"], desc:"Casona centenaria en medio de un cultivo de café activo, con piscina, corredores de tapia y un tour de finca incluido para entender el grano de punta a punta.", highlights:["Tour de finca cafetera incluido","Piscina y zona de BBQ","6 habitaciones, 12 huéspedes","Ideal para grupos y familias grandes"]},
  {id:"refugio-cocora", cat:"alojamientos", name:"Refugio Cocora", town:"Salento", dept:"Quindío", icon:"valle", tone:"sage", unit:"noche", price:280000, cap:4, rating:4.7, reviews:53, tags:["A pie del valle","Ideal parejas"], desc:"Una cabaña pequeña y sencilla, pensada para parejas o familias cortas que quieren caminar al Valle de Cocora sin madrugar en carretera.", highlights:["A 5 min a pie del sendero","Cocina equipada","Vista directa a las palmas de cera","Estufa a leña"]},
  {id:"cafe-bosque", cat:"alojamientos", name:"Finca Café y Bosque", town:"Chinchiná", dept:"Caldas", icon:"cafe", tone:"sage", unit:"noche", price:360000, cap:10, rating:4.8, reviews:37, tags:["Trapiche activo","Bosque de niebla"], desc:"Finca productiva con trapiche en funcionamiento y senderos propios hacia un fragmento de bosque de niebla. Los anfitriones son la tercera generación de la familia caficultora.", highlights:["Trapiche panelero activo","Senderos privados de bosque","Cena típica bajo pedido","A 25 min de Manizales"]},
  {id:"termales-otun", cat:"alojamientos", name:"Cabañas Termales del Otún", town:"Santa Rosa de Cabal", dept:"Risaralda", icon:"termal", tone:"lagoon", unit:"noche", price:390000, cap:6, rating:4.9, reviews:58, tags:["Piscinas termales","Acceso privado"], desc:"Cabañas junto al cañón del río Otún, con acceso privado a un sistema de piscinas termales alimentadas por aguas volcánicas.", highlights:["Acceso privado a termales","Vista al cañón del Otún","Zona de picnic junto al río","A 20 min de Santa Rosa de Cabal"]},

  // Parques temáticos aliados de Triviantes (https://afiliados.triviantes.com/id/elviajero) — precios, ubicación
  // y descripciones tomados de la página oficial de cada parque.
  {id:"acuario-mundo-marino", cat:"parques", name:"Acuario Mundo Marino", town:"Santa Marta", dept:"Magdalena", icon:"whale", tone:"lagoon", unit:"persona", price:32000, externalUrl:"https://acuariomundomarino.triviantes.com", cap:1, rating:4.8, reviews:180, tags:["Vida marina","Frente al mar"], desc:"Situado en Santa Marta, un lugar en el que podrás conocer 25 acuarios, 2 mega acuarios y otros escenarios, donde podrás observar más de 150 especies.", highlights:["Recorrido con más de 150 especies marinas","Código QR, ingreso directo sin filas","Modificaciones gratis hasta 72h antes","El Rodadero, a orillas del mar"]},
  {id:"aviario-nacional", cat:"parques", name:"Aviario Nacional de Colombia", town:"Cartagena", dept:"Bolívar", icon:"ave", tone:"sage", unit:"persona", price:50000, externalUrl:"https://aviarionacional.triviantes.com", cap:1, rating:4.8, reviews:2200, tags:["135 especies de aves","Isla Barú"], desc:"Ubicado en la Isla Barú de Cartagena, un lugar donde conocerás 135 especies de aves nativas, 15 especies de aves exóticas y 1.700 ejemplares del aviario más grande de Colombia.", highlights:["El aviario más grande de Colombia","Ingreso rápido con QR","Modificaciones gratis hasta 48h antes","Guía incluido en el recorrido"]},
  {id:"bioparque-ukumari", cat:"parques", name:"Bioparque Ukumarí", town:"Pereira", dept:"Risaralda", icon:"animal", tone:"sage", unit:"persona", duration:"~3 horas", price:57000, externalUrl:"https://bioparqueukumari.triviantes.com", cap:1, rating:4.6, reviews:150, tags:["Biorregiones","+90 especies"], desc:"Embárcate en un viaje salvaje por biorregiones que recrean hábitats naturales. Conoce más de 90 especies animales en un entorno educativo y sostenible que promueve la conservación.", highlights:["Recorrido autoguiado de ~3 horas","Más de 90 especies animales","Código QR, ingreso sin filas","Vía Pereira – Cerritos"]},
  {id:"caribe-aventura", cat:"parques", name:"Caribe Aventura", town:"Piojó", dept:"Atlántico", icon:"caribbean", tone:"lagoon", unit:"persona", price:89900, externalUrl:"https://caribeaventura.triviantes.com", cap:1, rating:4.2, reviews:130, tags:["Parque acuático","Piscinas de olas"], desc:"Parque acuático y temático en Piojó (Atlántico) inspirado en la cultura y paisajes del Caribe colombiano: toboganes, piscinas con olas, ríos lentos y réplicas de lugares icónicos como la Sierra Nevada o el Volcán del Totumo.", highlights:["Acceso ilimitado a todas las atracciones","Wifi gratis en el parque","A 30 min de Cartagena, 45 de Barranquilla","Modificaciones gratis hasta 72h antes"]},
  {id:"catedral-de-sal", cat:"parques", name:"Catedral de Sal", town:"Zipaquirá", dept:"Cundinamarca", icon:"shield", tone:"ink", unit:"persona", price:75000, externalUrl:"https://catedraldesal.triviantes.com", cap:1, rating:4.5, reviews:2100, tags:["Maravilla No. 1 de Colombia","180 m de profundidad"], desc:"Vive una experiencia inolvidable a 180 metros de profundidad en la maravilla No. 1 de Colombia: cortometraje 3D, show de luces, lago Espejo de Agua y mapping incluidos.", highlights:["Guía o audioguía incluida","Show de luces y mapping","Acceso al lago Espejo de Agua","Modificaciones gratis hasta 2 días antes"]},
  {id:"kanaloa", cat:"parques", name:"Kanaloa", town:"Santa Fe de Antioquia", dept:"Antioquia", icon:"kayak", tone:"lagoon", unit:"persona", price:69000, externalUrl:"https://parquekanaloa.triviantes.com", cap:1, rating:4.5, reviews:2500, tags:["Parque acuático","+7 atracciones"], desc:"Vive una aventura única en el Parque Kanaloa, el destino perfecto para disfrutar de diversión acuática, naturaleza y actividades inolvidables en Antioquia.", highlights:["Más de 7 atracciones acuáticas","Mismo precio que en taquilla","Modificaciones gratis hasta 48h antes","+7 medios de pago disponibles"]},
  {id:"laberinto-mil-caminos", cat:"parques", name:"Laberinto Mil Caminos", town:"Quimbaya", dept:"Quindío", icon:"amazon", tone:"sage", unit:"persona", price:44000, externalUrl:"https://milcaminos.triviantes.com", cap:1, rating:4.8, reviews:140, tags:["8.300 m²","24.000 arbustos"], desc:"Explora uno de los laberintos naturales más grandes de Latinoamérica, con 8.300 m² y 24.000 arbustos. Una experiencia única de aventura, introspección y conexión con la naturaleza.", highlights:["Uno de los laberintos naturales más grandes de Latam","Vereda Morelia Alta, Quimbaya","Modificaciones gratis hasta 48h antes","Entrada general para todas las edades"]},
  {id:"las-bailarinas", cat:"parques", name:"Las Bailarinas", town:"Quindío", dept:"Quindío", icon:"beach", tone:"lagoon", unit:"persona", price:79000, externalUrl:"https://lasbailarinas.triviantes.com", cap:1, rating:4.4, reviews:4000, tags:["Parque acuático","Hotel campestre"], desc:"El Hotel Campestre y Parque Acuático Las Bailarinas es el lugar perfecto para relajarte, divertirte en sus piscinas y toboganes, y vivir aventuras únicas en medio de la naturaleza.", highlights:["Piscinas y toboganes en plena naturaleza","Niños menores de 5 años ingresan gratis","Modificaciones gratis hasta 72h antes","Eje Cafetero"]},
  {id:"la-vida-bella", cat:"parques", name:"La Vida Bella", town:"Salento", dept:"Quindío", icon:"mirador", tone:"sage", unit:"persona", price:20000, externalUrl:"https://lavidabella.triviantes.com", cap:1, rating:3.8, reviews:90, tags:["Valle de Cocora","+20 escenarios fotogénicos"], desc:"Parque mirador turístico en el Valle del Cocora con más de 20 escenarios fotogénicos (miradores, casa al revés, columpios, nidos, exhibiciones de jeeps) para capturar fotos espectaculares del paisaje.", highlights:["Casa al revés y miradores","+20 escenarios fotogénicos","Primera entrada al Valle de Cocora","Código QR, ingreso sin filas"]},
  {id:"mina-de-sal-nemocon", cat:"parques", name:"Mina de Sal de Nemocón", town:"Nemocón", dept:"Cundinamarca", icon:"shield", tone:"ink", unit:"persona", price:46000, externalUrl:"https://minadesalnemocon.triviantes.com", cap:1, rating:4.8, reviews:10600, tags:["80 m bajo tierra","+500 años de historia"], desc:"Descubre un mundo mágico a 80 metros bajo tierra, explorando túneles y formaciones de sal con más de 500 años de historia.", highlights:["Túneles y formaciones de sal únicas","+500 años de historia","Modificaciones gratis hasta 48h antes","Recorrido guiado"]},
  {id:"mundo-aventura", cat:"parques", name:"Mundo Aventura", town:"Bogotá", dept:"Bogotá D.C.", icon:"ferris", tone:"ink", unit:"persona", price:90000, externalUrl:"https://mundoaventura.triviantes.com", cap:1, rating:4.3, reviews:220, tags:["Montañas rusas","33 atracciones"], desc:"Mundo Aventura es el lugar perfecto en Bogotá para vivir emociones increíbles, con atracciones, montañas rusas, shows y aventuras para todos los gustos.", highlights:["Pasaporte Gold: 33 atracciones","Ingreso sin filas en taquilla","Cancelación gratuita","Shows en vivo"]},
  {id:"parque-los-arrieros", cat:"parques", name:"Parque Los Arrieros", town:"Quimbaya", dept:"Quindío", icon:"farm", tone:"sage", unit:"persona", price:62100, externalUrl:"https://losarrieros.triviantes.com", cap:1, rating:4.4, reviews:110, tags:["Cultura arriera","Shows folclóricos"], desc:"Sumérgete en la cultura arriera con espectáculos en vivo, danzas folclóricas y actividades interactivas. Un día lleno de tradición, humor y aprendizaje en el Eje Cafetero.", highlights:["Espectáculos en vivo de danza y humor montañero","Km 3 vía Montenegro, Quimbaya","10% de descuento en entrada oficial","Opción con almuerzo incluido"]},
  {id:"panaca", cat:"parques", name:"Parque Panaca", town:"Quimbaya", dept:"Quindío", icon:"animal", tone:"sage", unit:"persona", price:76500, externalUrl:"https://panacaquindio.triviantes.com", cap:1, rating:4.5, reviews:189, tags:["Parque agropecuario","+4.500 animales"], desc:"Vive la cultura agropecuaria en el parque temático más grande de Latinoamérica. Interactúa con animales, disfruta de shows en vivo y aprende sobre el campo colombiano.", highlights:["Más de 4.500 animales","Shows en vivo incluidos","Km 7 vía Kerman, Quimbaya","10% de descuento en pasaporte"]},
  {id:"parque-quimbayas", cat:"parques", name:"Parque Quimbayas", town:"Quimbaya", dept:"Quindío", icon:"valle", tone:"lagoon", unit:"persona", price:60000, externalUrl:"https://parquequimbayas.triviantes.com", cap:1, rating:4.7, reviews:160, tags:["Piscinas y zonas verdes","Granja interactiva"], desc:"Un recorrido lleno de historia, cultura y belleza natural en el corazón del Eje Cafetero. Piscinas, zonas verdes, miradores y una granja donde puedes interactuar con los animales.", highlights:["Pasadía o pasanoche disponible","Granja interactiva incluida","Vía a Naranjal, Km 7, Quimbaya","Opciones con hospedaje"]},
  {id:"recuca", cat:"parques", name:"Parque Recuca", town:"Armenia", dept:"Quindío", icon:"cafe", tone:"ink", unit:"persona", price:60000, externalUrl:"https://parquerecuca.triviantes.com", cap:1, rating:4.8, reviews:8000, tags:["Cata guiada","Finca cafetera"], desc:"Visita Recuca (Recorrido de la Cultura Cafetera), la experiencia que te convierte en caficultor por un día. Un recorrido lleno de risas, sabor y tradición en el corazón del Quindío.", highlights:["Proceso completo del café, de la semilla a la taza","Disfraz de caficultor o chapolera incluido","Shows folclóricos con humor y tradición","Tour del cacao disponible"]},
  {id:"playa-hawai", cat:"parques", name:"Playa Hawai", town:"Ibagué", dept:"Tolima", icon:"sea", tone:"lagoon", unit:"persona", price:55000, externalUrl:"https://playahawai.triviantes.com", cap:1, rating:4.2, reviews:170, tags:["Pisci-playa más grande de Colombia","Parque acuático"], desc:"Playa Hawái es el parque acuático ideal cerca de Bogotá para divertirte con piscinas, toboganes y naturaleza. Un día inolvidable en la pisci-playa más grande de Colombia.", highlights:["La pisci-playa más grande de Colombia","Mismo precio que en taquilla","Niños menores de 4 años entran gratis","Modificaciones gratis hasta 48h antes"]},
  {id:"qinti", cat:"parques", name:"Qinti", town:"Córdoba", dept:"Quindío", icon:"mirador", tone:"sage", unit:"persona", price:38000, externalUrl:"https://qintiparque.triviantes.com", cap:1, rating:4.4, reviews:120, tags:["Casa invertida","Miradores y senderos"], desc:"Conocido por su casa construida completamente al revés y otros espacios creativos e interactivos que desafían la percepción y ofrecen experiencias visuales únicas.", highlights:["La Casa Invertida #1 del Quindío","Estación de hamacas y telarañas","A 1h20 de Armenia","Código QR, ingreso sin filas"]},
  {id:"recinto-del-pensamiento", cat:"parques", name:"Recinto del Pensamiento", town:"Manizales", dept:"Caldas", icon:"mariposa", tone:"sage", unit:"persona", duration:"~2.5 horas", price:35000, externalUrl:"https://recintodelpensamiento.triviantes.com", cap:1, rating:4.6, reviews:200, tags:["Bosque de niebla","Jardín de mariposas"], desc:"Conéctate con la naturaleza en un bosque de niebla a través de senderos ecológicos, observación de aves, mariposas y orquídeas, huertos aromáticos y miradores.", highlights:["Jardín de mariposas y casa de colibríes","Recorrido de ~2.5 horas","Parqueadero gratis","Modificaciones gratis hasta 72h antes"]},
  {id:"san-vicente-termal", cat:"parques", name:"San Vicente Reserva Termal", town:"Santa Rosa de Cabal", dept:"Risaralda", icon:"termal", tone:"ink", unit:"persona", price:55000, externalUrl:"https://sanvicentetermales.triviantes.com", cap:1, rating:4.3, reviews:150, tags:["Termales naturales","Bienestar"], desc:"Vive una experiencia única en San Vicente Reserva Termal. Relájate en los termales más naturales de Colombia, donde el agua, la naturaleza y la tranquilidad se fusionan.", highlights:["Los termales más naturales de Colombia","Planes con comida y transporte disponibles","Abierto todos los días hasta las 11 p.m.","Km 17 vereda Potreros"]},
  {id:"termales-santa-rosa", cat:"parques", name:"Termales de Santa Rosa de Cabal", town:"Santa Rosa de Cabal", dept:"Risaralda", icon:"termal", tone:"lagoon", unit:"persona", price:60000, externalUrl:"https://alianzas.triviantes.com", cap:1, rating:4.6, reviews:210, tags:["Cascada natural","Aguas termales"], desc:"Un paraíso natural en el Eje Cafetero, donde puedes relajarte en aguas termales junto a una espectacular cascada. Ideal para descansar y recargar energías.", highlights:["Aguas termales junto a una cascada natural","Varios pasaportes: termal, natural, energético","Cotización de hospedaje disponible","Ideal para descansar en pareja o familia"]},
  {id:"zoologico-cali", cat:"parques", name:"Zoológico de Cali", town:"Cali", dept:"Valle del Cauca", icon:"animal", tone:"ink", unit:"persona", price:40000, externalUrl:"https://zoologicodecali.triviantes.com", cap:1, rating:4.6, reviews:300, tags:["+200 especies","Sin tarifas ocultas"], desc:"Visita uno de los principales zoológicos de América Latina y conoce más de 2.500 animales de 200 especies diferentes. Una experiencia única para conectar con la fauna.", highlights:["Más de 200 especies de animales","Compra en línea sin tarifas ocultas","Código QR, ingreso sin filas","Santa Teresita, Cali"]},

  {id:"ruta-cafe", cat:"tours", name:"Ruta del Café: Salento + Valle de Cocora", town:"Salento", dept:"Quindío", icon:"cafe", tone:"sage", unit:"persona", duration:"Día completo", price:150000, cap:1, rating:4.9, reviews:143, tags:["Caminata guiada","Cata incluida"], desc:"Un día completo combinando el Valle de Cocora, el pueblo de Salento y una cata de café en finca, con transporte y guía incluidos desde el punto de encuentro.", highlights:["Transporte ida y vuelta","Caminata guiada al valle","Cata de café en finca","Tiempo libre en Salento"]},
  {id:"tour-termales", cat:"tours", name:"Tour Termales de Santa Rosa", town:"Santa Rosa de Cabal", dept:"Risaralda", icon:"termal", tone:"lagoon", unit:"persona", duration:"Medio día", price:120000, cap:1, rating:4.7, reviews:88, tags:["Transporte incluido","Entrada incluida"], desc:"Transporte, entrada y tiempo libre en las piscinas termales de Santa Rosa, con parada en cascada Amor Eterno.", highlights:["Transporte puerta a puerta","Entrada a termales incluida","Parada en cascada","Toallas disponibles en sitio"]},
  {id:"avistamiento-aves", cat:"tours", name:"Avistamiento de Aves · Reserva Bremen-La Popa", town:"Filandia", dept:"Quindío", icon:"ave", tone:"sage", unit:"persona", duration:"Medio día (madrugada)", price:95000, cap:1, rating:5.0, reviews:29, tags:["Guía ornitológico","Grupos pequeños"], desc:"Salida temprana con guía ornitológico certificado por senderos de bosque andino, con binoculares incluidos y grupos de máximo 8 personas.", highlights:["Guía ornitológico certificado","Binoculares incluidos","Grupos máx. 8 personas","Registro de especies del día"]},
  {id:"manizales-nevado", cat:"tours", name:"City Tour Manizales + Mirador Nevado del Ruiz", town:"Manizales", dept:"Caldas", icon:"mirador", tone:"ink", unit:"persona", duration:"Día completo", price:180000, cap:1, rating:4.6, reviews:52, tags:["Transporte incluido","Guía local"], desc:"Recorrido por el centro histórico de Manizales y ascenso hasta un mirador con vista al Nevado del Ruiz, clima permitiendo.", highlights:["Guía local incluido","Transporte todo el día","Parada fotográfica del nevado","Almuerzo típico opcional"]},
  {id:"filandia-colina", cat:"tours", name:"Tour Filandia + Colina Iluminada al Atardecer", town:"Filandia", dept:"Quindío", icon:"mirador", tone:"sage", unit:"persona", duration:"Medio día (tarde)", price:90000, cap:1, rating:4.8, reviews:66, tags:["Atardecer","Pueblo patrimonio"], desc:"Recorrido a pie por el pueblo patrimonio de Filandia, cerrando en la Colina Iluminada justo para el atardecer sobre el valle.", highlights:["Caminata guiada por el pueblo","Mirador al atardecer","Tiempo libre para artesanías","Grupos pequeños"]},
  {id:"kayak-quindio", cat:"tours", name:"Kayak y Senderismo · Río Quindío", town:"Salento", dept:"Quindío", icon:"kayak", tone:"lagoon", unit:"persona", duration:"Día completo", price:130000, cap:1, rating:4.7, reviews:34, tags:["Equipo incluido","Almuerzo incluido"], desc:"Descenso en kayak por tramos tranquilos del río Quindío combinado con senderismo corto y almuerzo campestre incluido.", highlights:["Equipo y chaleco incluidos","Instructor certificado","Almuerzo campestre incluido","Apto principiantes"]},
];

export const LISTING_GALLERY: Record<string, string[]> = {
  "finca-serrana": ["/photos/finca-a.jpg","/photos/cocora.jpg","/photos/salento-calle.jpg"],
  "mirador-quindio": ["/photos/filandia-mirador.jpg","/photos/filandia-colina.jpg","/photos/filandia-calle.jpg"],
  "hacienda-buenavista": ["/photos/finca-b.jpg","/photos/cafe-cerezas.jpg"],
  "refugio-cocora": ["/photos/cocora.jpg","/photos/rio-quindio.jpg"],
  "cafe-bosque": ["/photos/jeep-willys.jpg","/photos/cafe-cerezas.jpg"],
  "termales-otun": ["/photos/termales.jpg","/photos/rio-quindio.jpg"],
  "ruta-cafe": ["/photos/salento-calle.jpg","/photos/cocora.jpg","/photos/salento-calle-3.jpg"],
  "tour-termales": ["/photos/termales.jpg","/photos/filandia-mirador.jpg"],
  "avistamiento-aves": ["/photos/tangara.jpg","/photos/cocora.jpg"],
  "manizales-nevado": ["/photos/manizales-catedral.jpg","/photos/filandia-mirador.jpg"],
  "filandia-colina": ["/photos/filandia-colina.jpg","/photos/filandia-calle.jpg"],
  "kayak-quindio": ["/photos/kayak-action.jpg","/photos/rio-quindio.jpg"],

  // Fotos reales tomadas de la página de cada parque en Triviantes (ver externalUrl en cada listado).
  "acuario-mundo-marino": ["https://www.acuariomundomarino.triviantes.com/wp-content/uploads/2025/10/Acuario-Mundo-Marino-Santa-Marta.jpg"],
  "aviario-nacional": ["https://www.aviarionacional.triviantes.com/wp-content/uploads/2022/09/Aviario-Nacional-10-Custom.jpg"],
  "bioparque-ukumari": ["https://www.bioparqueukumari.triviantes.com/wp-content/uploads/2025/09/Plaza-de-Ancestros-Personalizado-Personalizado-1.jpg"],
  "caribe-aventura": ["https://www.caribeaventura.triviantes.com/wp-content/uploads/2025/11/Caribe-Aventura.jpg"],
  "catedral-de-sal": ["https://www.catedraldesal.triviantes.com/wp-content/uploads/2021/10/NAVE-CENTRAL-Y-MEDALLON-Personalizado.jpg"],
  "kanaloa": ["https://parquekanaloa.triviantes.com/wp-content/uploads/2022/08/rsz_1photo-2022-08-12-07-50-211.jpg"],
  "laberinto-mil-caminos": ["https://www.milcaminos.triviantes.com/wp-content/uploads/2025/01/MilCaminosLaberinto-01-1.jpg"],
  "las-bailarinas": ["https://www.lasbailarinas.triviantes.com/wp-content/uploads/2024/03/Las-Bailarinas-1.jpg"],
  "la-vida-bella": ["https://www.lavidabella.triviantes.com/wp-content/uploads/2021/10/La-Vida-Bella-e1766141549533.png"],
  "mina-de-sal-nemocon": ["https://www.minadesalnemocon.triviantes.com/wp-content/uploads/2024/09/Mina-de-Sal-Nemocon-02.jpg"],
  "mundo-aventura": ["https://mundoaventura.triviantes.com/wp-content/uploads/2023/05/parque-mundo-aventura-atracciones-moto-disko-bogota.webp"],
  "parque-los-arrieros": ["https://www.losarrieros.triviantes.com/wp-content/uploads/2026/04/643530771_1379468490873204_3906609730015985789_n.jpg"],
  "panaca": ["https://panacaquindio.triviantes.com/wp-content/uploads/2025/10/Landing-Panaca-1.png"],
  "parque-quimbayas": ["https://www.parquequimbayas.triviantes.com/wp-content/uploads/2023/08/Parque-Quimbayas.jpg"],
  "recuca": ["https://www.parquerecuca.triviantes.com/wp-content/uploads/2025/04/1534355222recuca.jpg"],
  "playa-hawai": ["https://playahawai.triviantes.com/wp-content/uploads/2022/07/Playa-hawai-3.jpg"],
  "qinti": ["https://www.qintiparque.triviantes.com/wp-content/uploads/2025/12/Qinti-Patas-Arriba.jpg"],
  "recinto-del-pensamiento": ["https://www.recintodelpensamiento.triviantes.com/wp-content/uploads/2025/12/F3F8F9-5.jpg"],
  "san-vicente-termal": ["https://www.sanvicentetermales.triviantes.com/wp-content/uploads/2025/10/Termales-San-Vicente.png"],
  "termales-santa-rosa": ["https://alianzas.triviantes.com/wp-content/uploads/2022/12/Termales.jpg"],
  "zoologico-cali": ["https://zoologicodecali.triviantes.com/wp-content/uploads/2025/09/Entradas-al-Zoologico-de-Cali.jpg"],
};
export function galleryFor(l: Pick<Listing, "id" | "photos">): string[] { return l.photos?.length ? l.photos : LISTING_GALLERY[l.id] || []; }
export function photoFor(l: Pick<Listing, "id" | "photos">): string | null { const g=galleryFor(l); return g.length?g[0]:null; }

export const REVIEWS: Review[] = [
  {name:"Camila Restrepo", origin:"Bogotá, Colombia", rating:5, quote:"La Serrana nos hizo sentir en casa desde el primer café de la mañana. Volveremos con toda la familia.", listing:"Finca La Serrana"},
  {name:"James & Laura Whitfield", origin:"Reino Unido", rating:5, quote:"Booking felt effortless and our host even had breakfast waiting. The Cocora Valley view from the cabin was unreal.", listing:"Refugio Cocora"},
  {name:"Andrés Molina", origin:"Medellín, Colombia", rating:4, quote:"El atardecer en la Colina Iluminada superó las expectativas, el guía conocía cada rincón del pueblo.", listing:"Tour Filandia + Colina Iluminada"},
  {name:"Sophie Dubois", origin:"Francia", rating:5, quote:"Une expérience authentique, loin des clichés touristiques. La cata de café en la finca fue el mejor momento del viaje.", listing:"RECUCA · Recorrido del Café"},
  {name:"Familia Gómez", origin:"Cali, Colombia", rating:5, quote:"Reservamos PANACA y las cabañas termales en un solo lugar, todo clarísimo y sin necesidad de llamar a nadie.", listing:"PANACA"},
  {name:"Julián Torres", origin:"Pereira, Colombia", rating:5, quote:"El kayak en el río Quindío fue tranquilo y el instructor muy paciente con los que íbamos por primera vez.", listing:"Kayak y Senderismo · Río Quindío"},
];

export const INITIAL_BOOKINGS: Booking[] = [];

export const EMISOR = {
  nombre: "El Viajero Inquieto",
  titular: "Robin Julián Murillo Ramírez",
  identificacion: "C.C. 75.100.397 de Manizales",
  direccion: "Carrera 42A # 11-42, Barrio Estambul, Manizales, Caldas",
  ciudad: "Manizales, Caldas",
  telefono: "314 873 4314",
  correo: "elviajeroinquieto11@gmail.com",
  rnt: "222679",
};
export const DEMO_TODAY = "2026-09-21";
export const MONTHS_ES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
export const DOC_ILLUSTRATIONS = ["whale","caribbean","bogota","amazon","international","trip","beach","sea","docCafe","farm"];
export const WEEKDAYS_ES = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
