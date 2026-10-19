import { db } from "@/lib/db";

// Sirve una imagen subida desde el panel. El contenido nunca cambia para un mismo id, así que se cachea un año.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) return new Response("No encontrada", { status: 404 });
  const [row] = await db()<{ content_type: string; data: Buffer }[]>`select content_type, data from media where id = ${id}`;
  if (!row) return new Response("No encontrada", { status: 404 });
  return new Response(new Uint8Array(row.data), {
    headers: { "Content-Type": row.content_type, "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
