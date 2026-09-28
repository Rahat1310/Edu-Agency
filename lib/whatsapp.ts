/**
 * Default agency WhatsApp number in international format without leading plus.
 * Corresponds to the agency's hotline: +880 1354-935958.
 */
export const DEFAULT_AGENCY_WHATSAPP = "8801354935958";

export function getWhatsAppHref(message: string = "", customPhone?: string): string {
  const raw =
    customPhone ||
    process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER ||
    DEFAULT_AGENCY_WHATSAPP;
  const phone = raw.replace(/\D/g, "");
  const text = encodeURIComponent(message);

  if (phone) {
    return text ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/${phone}`;
  }

  return text ? `https://wa.me/?text=${text}` : "https://wa.me/";
}

