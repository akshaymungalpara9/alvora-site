import { MessageCircle } from "lucide-react";
import { trackWhatsappClick } from "@/lib/ga4";
import { buildWhatsAppHref } from "@/lib/whatsapp";
import { COMPANY } from "@shared/companyInfo";

export default function WhatsAppQuickContact() {
  const href = buildWhatsAppHref(COMPANY.whatsappNumber);
  if (!href) return null;
  return <a className="whatsapp-quick-contact" href={href} target="_blank" rel="noreferrer" data-umami-event="whatsapp_click" aria-label="Message Alvora on WhatsApp" onClick={() => trackWhatsappClick('floating_button')}><span className="whatsapp-monogram">A</span><span>WhatsApp</span><MessageCircle size={15} strokeWidth={1.6} aria-hidden="true" /></a>;
}
