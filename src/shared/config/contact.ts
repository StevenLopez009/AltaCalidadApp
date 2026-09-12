/** Número de WhatsApp del negocio, en formato internacional sin signos. */
export const WHATSAPP_NUMBER = "573161534971";

export function buildWhatsAppUrl(message?: string) {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;

  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
