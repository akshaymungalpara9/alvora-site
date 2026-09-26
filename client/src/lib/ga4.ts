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
  // GA4 library inspects the IArguments object - must use a regular function, not an arrow
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
  const ctx = landingContext();
  send('whatsapp_click', {
    page_path: window.location.pathname,
    cta_location: ctaLocation,
    landing_page: ctx.landingPage,
    referrer_host: ctx.referrer,
    source_class: classifySource(ctx.referrer, ctx.utmSource),
    ...(ctx.utmSource ? { utm_source: ctx.utmSource } : {}),
    ...(ctx.utmMedium ? { utm_medium: ctx.utmMedium } : {}),
    ...(ctx.utmCampaign ? { utm_campaign: ctx.utmCampaign } : {}),
  });
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
    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get("utm_source") ?? "";
    const utmMedium = params.get("utm_medium") ?? "";
    const utmCampaign = params.get("utm_campaign") ?? "";
    window.sessionStorage.setItem(LANDING_KEY, JSON.stringify({ path: window.location.pathname, referrer: external, utmSource, utmMedium, utmCampaign }));
  } catch {
    // Storage can be unavailable (private mode); attribution is best-effort.
  }
}

export interface LandingContext {
  landingPage: string;
  referrer: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
}

export function landingContext(): LandingContext {
  const fallback = { landingPage: window.location.pathname, referrer: "", utmSource: "", utmMedium: "", utmCampaign: "" };
  try {
    const stored = JSON.parse(window.sessionStorage.getItem(LANDING_KEY) ?? "null") as
      | { path?: string; referrer?: string; utmSource?: string; utmMedium?: string; utmCampaign?: string }
      | null;
    if (!stored) return fallback;
    return {
      landingPage: stored.path ?? fallback.landingPage,
      referrer: stored.referrer ?? "",
      utmSource: stored.utmSource ?? "",
      utmMedium: stored.utmMedium ?? "",
      utmCampaign: stored.utmCampaign ?? "",
    };
  } catch {
    return fallback;
  }
}

export type SourceClass =
  | "google"
  | "bing"
  | "ai_assistant"
  | "pinterest"
  | "instagram"
  | "indiamart"
  | "email"
  | "direct"
  | "other";

const AI_ASSISTANT_HOSTS = new Set([
  "chatgpt.com",
  "chat.openai.com",
  "perplexity.ai",
  "www.perplexity.ai",
  "gemini.google.com",
  "copilot.microsoft.com",
  "claude.ai",
]);

/**
 * Best-effort bucket for where a visit came from. UTM source wins over the
 * referrer host because campaigns set it deliberately; "direct" means neither.
 */
export function classifySource(referrerHost: string, utmSource: string): SourceClass {
  const utm = utmSource.trim().toLowerCase();
  if (utm) {
    if (utm === "pinterest") return "pinterest";
    if (utm === "instagram" || utm === "ig") return "instagram";
    if (utm === "indiamart") return "indiamart";
    if (utm === "google") return "google";
    if (utm === "bing") return "bing";
    if (utm === "email" || utm === "newsletter" || utm === "mail") return "email";
    if (utm === "chatgpt" || utm === "perplexity" || utm === "gemini" || utm === "copilot" || utm === "claude") return "ai_assistant";
    return "other";
  }
  const host = referrerHost.trim().toLowerCase();
  if (!host) return "direct";
  if (AI_ASSISTANT_HOSTS.has(host)) return "ai_assistant";
  if (host === "pinterest.com" || host.endsWith(".pinterest.com")) return "pinterest";
  if (host === "instagram.com" || host === "www.instagram.com" || host === "l.instagram.com") return "instagram";
  if (host === "indiamart.com" || host.endsWith(".indiamart.com")) return "indiamart";
  if (host === "bing.com" || host === "www.bing.com") return "bing";
  if (host === "google.com" || host.endsWith(".google.com") || host.startsWith("google.")) return "google";
  return "other";
}

type ConversionEvent = "jewellery_enquiry" | "consultation_request" | "trade_linesheet_request";

/** Named conversion, sent to GA4 and Umami. */
export function trackConversion(event: ConversionEvent, details: Record<string, string> = {}): void {
  const ctx = landingContext();
  const params = {
    page_path: window.location.pathname,
    landing_page: ctx.landingPage,
    referrer_host: ctx.referrer,
    source_class: classifySource(ctx.referrer, ctx.utmSource),
    ...(ctx.utmSource ? { utm_source: ctx.utmSource } : {}),
    ...(ctx.utmMedium ? { utm_medium: ctx.utmMedium } : {}),
    ...(ctx.utmCampaign ? { utm_campaign: ctx.utmCampaign } : {}),
    ...details,
  };
  send(event, params);
  try {
    (window as Window & { umami?: { track?: (name: string, data: Record<string, string>) => void } }).umami?.track?.(event, params);
  } catch {
    // Analytics must never break a form submission.
  }
}
