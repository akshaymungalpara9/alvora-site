import { MessageCircle } from "lucide-react";

const inquiry = "Hello Alvora, I'd like to enquire about production availability.";

export default function WhatsAppQuickContact() {
  const number = String(import.meta.env.VITE_ALVORA_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");
  if (!/^\d{8,15}$/.test(number)) return null;
  const href = `https://wa.me/${number}?text=${encodeURIComponent(inquiry)}`;
  return <a className="whatsapp-quick-contact" href={href} target="_blank" rel="noreferrer" data-umami-event="whatsapp_click" aria-label="Message Alvora on WhatsApp"><span className="whatsapp-monogram">A</span><span>WhatsApp</span><MessageCircle size={15} strokeWidth={1.6} aria-hidden="true" /></a>;
}
