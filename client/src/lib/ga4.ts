declare global {
  interface Window {
    dataLayer: unknown[];
    gtag(...args: unknown[]): void;
  }
}

const GA4_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID as string | undefined;
let ready = false;

export function initGA4(): void {
  if (!GA4_ID || ready || typeof window === 'undefined') return;
  ready = true;

  window.dataLayer = window.dataLayer ?? [];
  // GA4 library inspects the IArguments object — must use a regular function, not an arrow
  window.gtag = function gtag() {
    window.dataLayer.push(arguments); // eslint-disable-line prefer-rest-params
  } as typeof window.gtag;
  // Deny analytics storage BEFORE the library loads so GA4 never writes _ga / _ga_* cookies.
  // GA4 operates in cookieless-ping mode: events are collected but without persistent client ID.
  // This preserves the cookie-free posture documented in PRIVACY_AND_TRACKING_AUDIT.md.
  window.gtag('consent', 'default', { analytics_storage: 'denied' });
  window.gtag('js', new Date());
  window.gtag('config', GA4_ID);

  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
  script.async = true;
  document.head.appendChild(script);
}

function send(event: string, params: Record<string, string>): void {
  if (!GA4_ID || typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', event, params);
}

export function trackWhatsappClick(ctaLocation: string): void {
  send('whatsapp_click', { page_path: window.location.pathname, cta_location: ctaLocation });
}

export function trackRfqSubmit(productInterest: string, country: string, leadType?: string): void {
  send('rfq_submit', { product_interest: productInterest, country, ...(leadType ? { lead_type: leadType } : {}) });
}

export function trackArticleRead(slug: string): void {
  send('article_read', { slug });
}
