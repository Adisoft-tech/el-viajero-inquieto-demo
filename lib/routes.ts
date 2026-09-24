// Mapa de las rutas del HTML original (data-go="...") a URLs de Next.js.
export const ROUTES = {
  home: "/",
  alojamientos: "/alojamientos",
  parques: "/parques",
  tours: "/tours",
  experiencias: "/experiencias",
  nosotros: "/nosotros",
  contacto: "/contacto",
  favoritos: "/favoritos",
  listing: (id: string) => `/ficha/${id}`,
  booking: (id: string) => `/reservar/${id}`,
  adminLogin: "/admin/login",
  admin: "/admin/resumen",
  adminTab: (tab: string) => `/admin/${tab}`,
  gestionLogin: "/gestion/login",
  gestion: "/gestion/calendario",
  gestionTab: (tab: string) => `/gestion/${tab}`,
} as const;
