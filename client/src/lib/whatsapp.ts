export const WhatsAppInquiry = "Hello Alvora, I'd like to enquire about production availability.";

export function normalizeWhatsAppNumber(value: unknown) {
  return String(value ?? "").replace(/\D/g, "");
}

export function isInternationalWhatsAppNumber(value: string) {
  return /^[1-9]\d{10,14}$/.test(value);
}

export function buildWhatsAppHref(value: unknown) {
  const number = normalizeWhatsAppNumber(value);
  if (!isInternationalWhatsAppNumber(number)) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(WhatsAppInquiry)}`;
}

export function buildWhatsAppHrefWithMessage(value: unknown, message: string) {
  const number = normalizeWhatsAppNumber(value);
  if (!isInternationalWhatsAppNumber(number)) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
