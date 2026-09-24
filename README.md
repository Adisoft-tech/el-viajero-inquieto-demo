# El Viajero Inquieto — Demo de plataforma

Demo interactiva de una plataforma web y portal de reservas para **El Viajero Inquieto**, agencia de viajes del eje cafetero (Colombia). Proyecto realizado por [AdiSoft](https://github.com/Adisoft-tech).

Es una aplicación **Next.js (App Router, React, TypeScript)** que simula el sitio público y el panel de administración de la agencia. No tiene backend real: todos los datos (catálogo, reservas, contenido) viven en memoria del navegador y algunos se persisten en `localStorage` (favoritos, si ya viste el aviso del chat).

## Contenido

- **Landing page** con la identidad de marca del cliente y fotografía real del eje cafetero.
- **Catálogo** de fincas/cabañas, parques temáticos y tours, con filtros, favoritos y galería de fotos con lightbox por cada ficha.
- **Flujo de reserva** de 4 pasos con checkout simulado (Wompi: tarjeta, PSE, Nequi).
- **Asistente de chat** que responde preguntas leyendo el catálogo cargado en la página — reglas locales en JavaScript, sin LLM ni backend.
- **Panel de administración** (login simulado): resumen con métricas y gráfico, tabla de reservas, inventario editable en vivo, y edición de contenido de la portada.
- **Panel de gestión** (login simulado, separado del panel administrativo): calendario de reservas de las fincas y generador de documentos (cotizaciones, cuentas de cobro y de pago) en PDF con el membrete de la marca.
- **Instalable como PWA**: tiene manifest, ícono e íconos y service worker (`sw.js`), así que se puede "agregar a la pantalla de inicio" desde el navegador — al abrirse como app instalada entra directo al panel de gestión. Optimizado para verse bien en pantallas de celular.

## Cómo correrlo en local

Requiere Node.js 20+:

```bash
npm install
npm run dev
```

Luego abre [http://localhost:8743](http://localhost:8743). Para producción: `npm run build && npm start` (o despliega el repo en Vercel, que detecta Next.js automáticamente).

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
