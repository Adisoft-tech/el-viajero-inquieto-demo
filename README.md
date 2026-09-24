# El Viajero Inquieto — Demo de plataforma

Demo interactiva de una plataforma web y portal de reservas para **El Viajero Inquieto**, agencia de viajes del eje cafetero (Colombia). Proyecto realizado por [AdiSoft](https://github.com/Adisoft-tech).

Es una aplicación **Next.js (App Router, React, TypeScript)** que simula el sitio público y el panel de administración de la agencia. El **panel de gestión** guarda sus datos en **Supabase (Postgres)**: fincas, reservas del calendario y documentos emitidos con sus consecutivos. El resto (catálogo de parques y tours, reservas del panel administrativo, contenido) sigue viviendo en memoria del navegador, y algunos datos se persisten en `localStorage` (favoritos, si ya viste el aviso del chat).

## Contenido

- **Landing page** con la identidad de marca del cliente y fotografía real del eje cafetero.
- **Catálogo** de fincas/cabañas, parques temáticos y tours, con filtros, favoritos y galería de fotos con lightbox por cada ficha.
- **Flujo de reserva** de 4 pasos con checkout simulado (Wompi: tarjeta, PSE, Nequi).
- **Asistente de chat** que responde preguntas leyendo el catálogo cargado en la página — reglas locales en JavaScript, sin LLM ni backend.
- **Panel de administración** (login con usuario de Supabase): resumen con métricas y gráfico, tabla de reservas, inventario editable en vivo, y edición de contenido de la portada.
- **Panel de gestión** (comparte la sesión con el panel administrativo): calendario de reservas de las fincas y generador de documentos (cotizaciones, cuentas de cobro y de pago) en PDF con el membrete de la marca.
- **Instalable como PWA**: tiene manifest, ícono e íconos y service worker (`sw.js`), así que se puede "agregar a la pantalla de inicio" desde el navegador — al abrirse como app instalada entra directo al panel de gestión. Optimizado para verse bien en pantallas de celular.

## Cómo correrlo en local

Requiere Node.js 20+:

```bash
npm install
npm run dev
```

Luego abre [http://localhost:8743](http://localhost:8743). Para producción: `npm run build && npm start` (o despliega el repo en Vercel, que detecta Next.js automáticamente).

## Base de datos (Supabase)

1. Copia `.env.example` a `.env.local` y pon la cadena de conexión del **Transaction pooler** (Supabase → Project Settings → Database, puerto `6543`). La conexión directa `db.<ref>.supabase.co` es solo IPv6 y no funciona desde Vercel ni desde muchas redes locales.
2. En Vercel, agrega la misma variable `DATABASE_URL` en los entornos Production y Preview.
3. El esquema está en `supabase/migrations/`. Para aplicar las migraciones pendientes (lleva el registro en la tabla `schema_migrations`):

   ```bash
   npm run db:migrate
   ```

4. Crea un usuario del equipo para entrar a los paneles (si el correo ya existe, le cambia la contraseña y cierra sus sesiones):

   ```bash
   npm run db:create-user -- equipo@elviajeroinquieto.co "<contraseña>" "Equipo El Viajero Inquieto"
   ```

Al iniciar sesión, el servidor entrega un token que se guarda en `localStorage` (`vi_session_token`) y dura 30 días. Una misma sesión abre el panel de gestión y el administrativo; si el token no está o ya no es válido, los paneles mandan al login. En la base solo queda el SHA-256 del token. Las Server Actions del panel de gestión (`lib/actions/gestion.ts`) reciben ese token como primer argumento y lo validan en el servidor antes de leer o escribir; la única pública es `listFincas`, el catálogo que muestra el sitio.

| Tabla | Contenido |
| --- | --- |
| `usuarios` | Equipo con acceso a los paneles; contraseña con scrypt. |
| `sesiones` | Tokens de sesión (solo su hash) con fecha de vencimiento. |
| `fincas` | Catálogo de fincas y cabañas (lo edita "Gestionar fincas" y lo lee el sitio público). Al eliminar, se marca `deleted_at` y las reservas se conservan. |
| `finca_bookings` | Reservas del calendario. El saldo (`balance`) lo calcula la base. |
| `doc_counters` | Último consecutivo emitido por tipo de documento. |
| `documentos` | Cada cotización / cuenta de cobro / cuenta de pago descargada, con su número y una copia del formulario para volver a generar el PDF. |

La app solo accede a la base desde el servidor (Server Actions en `lib/actions/gestion.ts`); RLS está activo sin políticas, así que la API pública de Supabase no expone estas tablas. **Pendiente:** el login de gestión todavía es simulado, por lo que las Server Actions no validan sesión.

## Rutas

| Ruta | Contenido |
| --- | --- |
| `/` | Landing |
| `/alojamientos`, `/parques`, `/tours` | Catálogo |
| `/ficha/[id]` | Ficha con galería |
| `/reservar/[id]` | Flujo de reserva |
| `/nosotros`, `/experiencias`, `/contacto`, `/favoritos` | Páginas simples |
| `/admin/login`, `/admin/{resumen,reservas,inventario,contenido}` | Panel administrativo |
| `/gestion/login`, `/gestion/{calendario,documentos}` | Panel de gestión (inicio de la PWA) |

## Estructura

```
app/                # rutas (App Router): (site) público, admin/, gestion/
components/         # componentes por área: site/, admin/, gestion/
lib/                # datos semilla, estado global, formato, íconos, motores de chat, PDF
public/photos/      # fotografía real (Wikimedia Commons, CC) y logo de marca
public/sw.js        # service worker de la PWA
```

## Licencia de las fotos

Las fotografías del catálogo provienen de Wikimedia Commons bajo licencia Creative Commons. Antes de pasar esto a producción, reemplázalas por fotografía propia de El Viajero Inquieto o por imágenes con licencia comercial.
