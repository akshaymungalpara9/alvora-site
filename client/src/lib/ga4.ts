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

// ── Conversions ─────────────────────────────────────────────────────────────
// Each conversion carries the session's landing page so search performance can
// be lined up with enquiries page by page (see seo/BRIEF.md).

const LANDING_KEY = "alvora_landing";

/** Remember the first page and referrer of this visit (per tab, no cookies). */
export function rememberLandingPage(): void {
  if (typeof window === "undefined") return;
  try {
    if (window.sessionStorage.getItem(LANDING_KEY)) return;
    const referrerHost = document.referrer ? new URL(document.referrer).hostname : "";
    const external = referrerHost && referrerHost !== window.location.hostname ? referrerHost : "";
    window.sessionStorage.setItem(LANDING_KEY, JSON.stringify({ path: window.location.pathname, referrer: external }));
  } catch {
    // Storage can be unavailable (private mode); attribution is best-effort.
  }
}

export function landingContext(): { landingPage: string; referrer: string } {
  try {
    const stored = JSON.parse(window.sessionStorage.getItem(LANDING_KEY) ?? "null") as { path?: string; referrer?: string } | null;
    return { landingPage: stored?.path ?? window.location.pathname, referrer: stored?.referrer ?? "" };
  } catch {
    return { landingPage: window.location.pathname, referrer: "" };
  }
}

type ConversionEvent = "jewellery_enquiry" | "consultation_request" | "trade_linesheet_request";

/** Named conversion, sent to GA4 and Umami. */
export function trackConversion(event: ConversionEvent, details: Record<string, string> = {}): void {
  const { landingPage, referrer } = landingContext();
  const params = { page_path: window.location.pathname, landing_page: landingPage, referrer_host: referrer, ...details };
  send(event, params);
  try {
    (window as Window & { umami?: { track?: (name: string, data: Record<string, string>) => void } }).umami?.track?.(event, params);
  } catch {
    // Analytics must never break a form submission.
  }
}
