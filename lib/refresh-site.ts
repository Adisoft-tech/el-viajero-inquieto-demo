import "server-only";

import { revalidatePath } from "next/cache";

/** El HTML público se regenera con el cambio del administrador (si no, tardaría hasta 5 minutos). */
export function refreshSite() {
  revalidatePath("/", "layout");
}
