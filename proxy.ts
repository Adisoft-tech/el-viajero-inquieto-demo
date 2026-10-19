import { NextResponse, type NextRequest } from "next/server";

/** En producción, cualquier ruta fuera de /gestion (sitio público y admin) redirige al panel de gestión. */
export function proxy(request: NextRequest) {
  if (process.env.VERCEL_ENV !== "production") return NextResponse.next();
  return NextResponse.redirect(new URL("/gestion", request.url));
}

export const config = {
  // Deja pasar /gestion, las imágenes subidas (/api/media), los assets de Next y los archivos estáticos de /public.
  matcher: ["/((?!gestion(?:/|$)|api/media(?:/|$)|_next/|.*\\.[\\w]+$).*)"],
};
