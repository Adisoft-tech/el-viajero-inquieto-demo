// Mientras el sitio público y el panel administrativo no salgan para el cliente,
// producción solo expone /gestion. En local y en previews de Vercel todo sigue accesible.
export const GESTION_ONLY = process.env.NEXT_PUBLIC_VERCEL_ENV === "production";
