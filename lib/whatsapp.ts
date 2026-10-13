// Número de WhatsApp por defecto de la agencia (con indicativo de país, sin "+" ni espacios; el administrador
// lo puede cambiar desde Contenido del sitio) y helper para armar enlaces wa.me con un mensaje precargado.
export const WHATSAPP_PHONE_INTL = "573148734314";

export function whatsappUrl(message: string, phone: string = WHATSAPP_PHONE_INTL): string {
  return "https://wa.me/" + phone + "?text=" + encodeURIComponent(message);
}
