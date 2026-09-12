export function getWhatsAppHref(message: string): string {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER?.replace(
    /\D/g,
    "",
  );
  const text = encodeURIComponent(message);

  return phone
    ? `https://wa.me/${phone}?text=${text}`
    : `https://wa.me/?text=${text}`;
}
