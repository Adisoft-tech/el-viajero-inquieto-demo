// Datos semilla de la demo (sin backend). El estado mutable vive en lib/store.tsx.

export type Category = "alojamientos" | "parques" | "tours";
export interface Listing {
  id: string; cat: Category; name: string; town: string; dept: string;
  icon: string; tone: "sage" | "lagoon" | "ink"; unit: "noche" | "persona";
  price: number; cap: number; rating: number; reviews: number;
  duration?: string; tags: string[]; desc: string; highlights: string[];
  /** false = oculto del sitio público (se cambia desde Inventario). */
  active?: boolean; [key: string]: unknown;
}
export interface SiteContent { heroEyebrow: string; heroTitle: string; heroLede: string; [key: string]: string }
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
  heroEyebrow: "Agencia de viajes · Eje cafetero y Colombia",
  heroTitle: "Colombia, en una forma <em>más cercana</em>",
  heroLede: "Fincas que se vuelven refugio, rutas que despiertan curiosidad y destinos vividos desde la emoción. Reserva directamente con quienes conocen cada camino.",
};

export const INITIAL_LISTINGS: Listing[] = [
  {id:"finca-serrana", cat:"alojamientos", name:"Finca La Serrana", town:"Salento", dept:"Quindío", icon:"valle", tone:"sage", unit:"noche", price:420000, cap:8, rating:4.9, reviews:86, tags:["Vista al Valle de Cocora","Fogata nocturna"], desc:"Casona de finca cafetera restaurada con balcón corrido hacia el Valle de Cocora. Los anfitriones preparan un desayuno campesino cada mañana y organizan una caminata guiada opcional entre palmas de cera.", highlights:["Desayuno campesino incluido","Fogata y chocolate al atardecer","A 8 min del mirador de Cocora","Wifi y parqueadero privado"]},
  {id:"mirador-quindio", cat:"alojamientos", name:"Cabañas El Mirador del Quindío", town:"Filandia", dept:"Quindío", icon:"mirador", tone:"lagoon", unit:"noche", price:310000, cap:6, rating:4.8, reviews:64, tags:["Mirador 360°","Cerca a Colina Iluminada"], desc:"Tres cabañas de madera y guadua en lo alto de Filandia, con vista abierta a la cordillera. Ideal para quienes quieren atardeceres largos y silencio real.", highlights:["Mirador privado 360°","A 10 min del pueblo","Chimenea de leña","Terraza para café de la tarde"]},
  {id:"hacienda-buenavista", cat:"alojamientos", name:"Hacienda Buenavista", town:"Circasia", dept:"Quindío", icon:"cafe", tone:"ink", unit:"noche", price:650000, cap:12, rating:5.0, reviews:41, tags:["Cultivo propio","Piscina"], desc:"Casona centenaria en medio de un cultivo de café activo, con piscina, corredores de tapia y un tour de finca incluido para entender el grano de punta a punta.", highlights:["Tour de finca cafetera incluido","Piscina y zona de BBQ","6 habitaciones, 12 huéspedes","Ideal para grupos y familias grandes"]},
  {id:"refugio-cocora", cat:"alojamientos", name:"Refugio Cocora", town:"Salento", dept:"Quindío", icon:"valle", tone:"sage", unit:"noche", price:280000, cap:4, rating:4.7, reviews:53, tags:["A pie del valle","Ideal parejas"], desc:"Una cabaña pequeña y sencilla, pensada para parejas o familias cortas que quieren caminar al Valle de Cocora sin madrugar en carretera.", highlights:["A 5 min a pie del sendero","Cocina equipada","Vista directa a las palmas de cera","Estufa a leña"]},
  {id:"cafe-bosque", cat:"alojamientos", name:"Finca Café y Bosque", town:"Chinchiná", dept:"Caldas", icon:"cafe", tone:"sage", unit:"noche", price:360000, cap:10, rating:4.8, reviews:37, tags:["Trapiche activo","Bosque de niebla"], desc:"Finca productiva con trapiche en funcionamiento y senderos propios hacia un fragmento de bosque de niebla. Los anfitriones son la tercera generación de la familia caficultora.", highlights:["Trapiche panelero activo","Senderos privados de bosque","Cena típica bajo pedido","A 25 min de Manizales"]},
  {id:"termales-otun", cat:"alojamientos", name:"Cabañas Termales del Otún", town:"Santa Rosa de Cabal", dept:"Risaralda", icon:"termal", tone:"lagoon", unit:"noche", price:390000, cap:6, rating:4.9, reviews:58, tags:["Piscinas termales","Acceso privado"], desc:"Cabañas junto al cañón del río Otún, con acceso privado a un sistema de piscinas termales alimentadas por aguas volcánicas.", highlights:["Acceso privado a termales","Vista al cañón del Otún","Zona de picnic junto al río","A 20 min de Santa Rosa de Cabal"]},

  {id:"parque-cafe", cat:"parques", name:"Parque del Café", town:"Montenegro", dept:"Quindío", icon:"ferris", tone:"lagoon", unit:"persona", price:75000, cap:1, rating:4.7, reviews:212, tags:["Funicoaster","Museo del café"], desc:"El parque temático más reconocido del eje cafetero: atracciones mecánicas, teleférico, recorrido histórico del café y shows en vivo durante todo el día.", highlights:["Funicoaster y teleférico incluidos","Museo interactivo del café","Shows folclóricos en vivo","Zona de restaurantes"]},
  {id:"panaca", cat:"parques", name:"PANACA", town:"Quimbaya", dept:"Quindío", icon:"animal", tone:"sage", unit:"persona", price:68000, cap:1, rating:4.6, reviews:189, tags:["Parque agropecuario","Shows con animales"], desc:"Parque temático agropecuario con shows educativos de vaquería, aves, perros y cerdos, pensado especialmente para viajar en familia.", highlights:["6 shows con animales incluidos","Zona de granja para niños","Restaurantes campestres","Parqueadero amplio"]},
  {id:"recuca", cat:"parques", name:"RECUCA · Recorrido del Café", town:"Alcalá", dept:"Valle del Cauca", icon:"cafe", tone:"ink", unit:"persona", price:45000, cap:1, rating:4.8, reviews:97, tags:["Cata guiada","Finca cafetera"], desc:"Recorrido guiado por una finca cafetera real, desde la siembra hasta la taza, cerrando con una cata dirigida por catadores certificados.", highlights:["Guía especializado incluido","Cata de café certificada","Siembra y cosecha en vivo","Duración aprox. 2.5 horas"]},
  {id:"jardin-botanico", cat:"parques", name:"Jardín Botánico del Quindío", town:"Calarcá", dept:"Quindío", icon:"mariposa", tone:"sage", unit:"persona", price:32000, cap:1, rating:4.7, reviews:74, tags:["Mariposario","Senderos"], desc:"Reserva natural con el mariposario más grande de Suramérica y senderos interpretativos por guadua y bosque húmedo tropical.", highlights:["Mariposario cubierto","Senderos guiados opcionales","Torre de observación","Ideal para fotografía de naturaleza"]},

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
  "parque-cafe": ["/photos/parque-cafe.jpg","/photos/jeep-willys.jpg"],
  "panaca": ["/photos/salento-casa.jpg","/photos/jeep-willys.jpg"],
  "recuca": ["/photos/salento-calle-2.jpg","/photos/cafe-cerezas.jpg"],
  "jardin-botanico": ["/photos/mariposario.jpg","/photos/rio-quindio.jpg"],
  "ruta-cafe": ["/photos/salento-calle.jpg","/photos/cocora.jpg","/photos/salento-calle-3.jpg"],
  "tour-termales": ["/photos/termales.jpg","/photos/filandia-mirador.jpg"],
  "avistamiento-aves": ["/photos/tangara.jpg","/photos/cocora.jpg"],
  "manizales-nevado": ["/photos/manizales-catedral.jpg","/photos/filandia-mirador.jpg"],
  "filandia-colina": ["/photos/filandia-colina.jpg","/photos/filandia-calle.jpg"],
  "kayak-quindio": ["/photos/kayak-action.jpg","/photos/rio-quindio.jpg"],
};
export function galleryFor(l: Pick<Listing, "id">): string[] { return LISTING_GALLERY[l.id] || []; }
export function photoFor(l: Pick<Listing, "id">): string | null { const g=galleryFor(l); return g.length?g[0]:null; }

export const REVIEWS: Review[] = [
  {name:"Camila Restrepo", origin:"Bogotá, Colombia", rating:5, quote:"La Serrana nos hizo sentir en casa desde el primer café de la mañana. Volveremos con toda la familia.", listing:"Finca La Serrana"},
  {name:"James & Laura Whitfield", origin:"Reino Unido", rating:5, quote:"Booking felt effortless and our host even had breakfast waiting. The Cocora Valley view from the cabin was unreal.", listing:"Refugio Cocora"},
  {name:"Andrés Molina", origin:"Medellín, Colombia", rating:4, quote:"El atardecer en la Colina Iluminada superó las expectativas, el guía conocía cada rincón del pueblo.", listing:"Tour Filandia + Colina Iluminada"},
  {name:"Sophie Dubois", origin:"Francia", rating:5, quote:"Une expérience authentique, loin des clichés touristiques. La cata de café en la finca fue el mejor momento del viaje.", listing:"RECUCA · Recorrido del Café"},
  {name:"Familia Gómez", origin:"Cali, Colombia", rating:5, quote:"Reservamos PANACA y las cabañas termales en un solo lugar, todo clarísimo y sin necesidad de llamar a nadie.", listing:"PANACA"},
  {name:"Julián Torres", origin:"Pereira, Colombia", rating:5, quote:"El kayak en el río Quindío fue tranquilo y el instructor muy paciente con los que íbamos por primera vez.", listing:"Kayak y Senderismo · Río Quindío"},
];

export const INITIAL_BOOKINGS: Booking[] = [
  {code:"VJI-1042", guest:"Familia Gómez", listing:"Finca La Serrana", dates:"14–16 sep 2026", guests:6, total:1260000, pay:"pagado", status:"confirmada"},
  {code:"VJI-1043", guest:"James Whitfield", listing:"Refugio Cocora", dates:"20–22 sep 2026", guests:2, total:560000, pay:"pagado", status:"confirmada"},
  {code:"VJI-1044", guest:"Sophie Dubois", listing:"Ruta del Café: Salento + Valle de Cocora", dates:"18 sep 2026", guests:2, total:300000, pay:"pagado", status:"confirmada"},
  {code:"VJI-1045", guest:"Andrés Molina", listing:"PANACA", dates:"21 sep 2026", guests:4, total:272000, pay:"pendiente", status:"pendiente"},
  {code:"VJI-1046", guest:"Camila Restrepo", listing:"Cabañas Termales del Otún", dates:"25–27 sep 2026", guests:5, total:780000, pay:"pagado", status:"confirmada"},
  {code:"VJI-1047", guest:"Laura Kim", listing:"Parque del Café", dates:"19 sep 2026", guests:3, total:225000, pay:"pagado", status:"confirmada"},
  {code:"VJI-1048", guest:"Familia Meyer", listing:"Hacienda Buenavista", dates:"30 sep–3 oct 2026", guests:10, total:1950000, pay:"pendiente", status:"pendiente"},
  {code:"VJI-1049", guest:"Julián Torres", listing:"Kayak y Senderismo · Río Quindío", dates:"22 sep 2026", guests:2, total:260000, pay:"pagado", status:"confirmada"},
  {code:"VJI-1050", guest:"Marta Londoño", listing:"Tour Filandia + Colina Iluminada", dates:"17 sep 2026", guests:2, total:180000, pay:"reembolsado", status:"cancelada"},
];

export const WEEKLY: [string, number][] = [["Sem 1",5],["Sem 2",8],["Sem 3",11],["Sem 4",9],["Sem 5",13],["Sem 6",16]];

export const EMISOR = {
  nombre: "El Viajero Inquieto",
  titular: "Robin Julián Murillo Ramírez",
  identificacion: "C.C. 75.100.397 de Manizales",
  direccion: "Carrera 42A # 11-42, Barrio Estambul, Manizales, Caldas",
  ciudad: "Manizales, Caldas",
  telefono: "314 873 4314",
  correo: "elviajeroinquieto11@gmail.com",
};
export const DEMO_TODAY = "2026-09-21";
export const MONTHS_ES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
export const DOC_ILLUSTRATIONS = ["whale","caribbean","bogota","amazon","international","trip","beach","sea","docCafe","farm"];
export const WEEKDAYS_ES = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
