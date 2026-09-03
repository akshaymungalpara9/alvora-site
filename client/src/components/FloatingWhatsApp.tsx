import { MessageCircle } from "lucide-react";
import { useLocation } from "wouter";
import { trackWhatsappClick } from "@/lib/ga4";
import { findProductPage } from "@/lib/productPages";
import { buildWhatsAppHrefWithMessage, WhatsAppInquiry } from "@/lib/whatsapp";
import { COMPANY } from "@shared/companyInfo";

const ADMIN_ROUTES = ["/admin", "/admin/buyers", "/admin/availability", "/admin/briefs"];

function buildMessage(location: string): string {
  const page = findProductPage(location);
  if (page) return `Hello Alvora, I'd like availability & pricing for ${page.h1}.`;
  return WhatsAppInquiry;
}

export default function FloatingWhatsApp() {
  const [location] = useLocation();

  if (ADMIN_ROUTES.includes(location)) return null;

  const message = buildMessage(location);
  const href = buildWhatsAppHrefWithMessage(COMPANY.whatsappNumber, message);
  if (!href) return null;

  return (
    <a
      className="whatsapp-quick-contact"
      href={href}
      target="_blank"
      rel="noreferrer"
      data-umami-event="whatsapp_click"
      aria-label="Message Alvora on WhatsApp"
      onClick={() => trackWhatsappClick("floating_button")}
    >
      <span className="whatsapp-monogram">A</span>
      <span>WhatsApp</span>
      <MessageCircle size={15} strokeWidth={1.6} aria-hidden="true" />
    </a>
  );
}
