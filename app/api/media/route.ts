import { randomUUID } from "node:crypto";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";

// Sube una imagen desde el panel administrativo. El token de sesión va en el encabezado x-session-token.
const TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    await requireSession(req.headers.get("x-session-token"));
  } catch {
    return Response.json({ error: "Inicia sesión de nuevo." }, { status: 401 });
  }
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return Response.json({ error: "No llegó ninguna imagen." }, { status: 400 });
  if (!TYPES.has(file.type)) return Response.json({ error: "Formato no permitido: usa JPG, PNG, WebP o GIF." }, { status: 400 });
  if (file.size > MAX_BYTES) return Response.json({ error: "La imagen pesa más de 4 MB." }, { status: 400 });

  const id = randomUUID();
  const bytes = Buffer.from(await file.arrayBuffer());
  await db()`insert into media (id, content_type, data, size) values (${id}, ${file.type}, ${bytes}, ${bytes.length})`;
  return Response.json({ url: "/api/media/" + id });
}
