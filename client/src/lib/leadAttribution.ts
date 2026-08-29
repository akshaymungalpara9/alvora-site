export type LeadAttribution = {
  source: string;
  medium: string;
  campaign: string;
  landingPage: string;
  referrer: string;
};

type UmamiWindow = Window & {
  umami?: {
    track?: (event: string, data?: Record<string, unknown>) => void;
  };
};

const STORAGE_KEY = "alvora_lead_attribution";
const ATTRIBUTION_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "gclid",
  "msclkid",
];

function readStored(): Partial<LeadAttribution> {
  try {
    const value = window.sessionStorage.getItem(STORAGE_KEY);
    return value ? (JSON.parse(value) as Partial<LeadAttribution>) : {};
  } catch {
    return {};
  }
}

export function captureLeadAttribution(): LeadAttribution {
  const params = new URLSearchParams(window.location.search);
  const stored = readStored();
  const attribution: LeadAttribution = {
    source:
      params.get("utm_source") ||
      (params.get("gclid")
        ? "google"
        : params.get("msclkid")
          ? "bing"
          : stored.source || "direct"),
    medium:
      params.get("utm_medium") ||
      stored.medium ||
      (params.get("gclid") || params.get("msclkid") ? "cpc" : "none"),
    campaign: params.get("utm_campaign") || stored.campaign || "",
    landingPage:
      stored.landingPage ||
      `${window.location.pathname}${window.location.search ? "?" + window.location.search.slice(1) : ""}`,
    referrer:
      stored.referrer ||
      (document.referrer ? new URL(document.referrer).hostname : ""),
  };

  const hasNewCampaign = ATTRIBUTION_KEYS.some(key => params.has(key));
  if (hasNewCampaign) {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
    } catch {
      // Attribution is an enhancement; lead submission must still work if storage is blocked.
    }
  }
  return attribution;
}

export function trackLeadEvent(
  event: string,
  data: Record<string, unknown> = {}
) {
  const tracker = (window as UmamiWindow).umami;
  tracker?.track?.(event, { ...data, ...captureLeadAttribution() });
}
