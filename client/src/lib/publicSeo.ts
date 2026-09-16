import { ROUTE_META } from "@shared/routeMeta";

export type PublicSeoLocale = "global" | "fr" | "it" | "us";

export type PublicDocumentMetadata = { lang: string; path: string; title: string; description: string; robots?: string };
export const publicSocialImage = "/assets/alvora-og.jpg";
export const publicSocialImageAlt = "Alvora, lab-grown diamond manufacturer, Surat";

export const publicSeo = {
  global: {
    lang: "en",
    path: "/",
    title: ROUTE_META["/"].title,
    description: ROUTE_META["/"].description,
  },
  fr: {
    lang: "fr",
    path: "/fr",
    title: ROUTE_META["/fr"].title,
    description: ROUTE_META["/fr"].description,
  },
  it: {
    lang: "it",
    path: "/it",
    title: ROUTE_META["/it"].title,
    description: ROUTE_META["/it"].description,
  },
  us: {
    lang: "en-US",
    path: "/us",
    title: ROUTE_META["/us"].title,
    description: ROUTE_META["/us"].description,
  },
} satisfies Record<PublicSeoLocale, PublicDocumentMetadata>;

export const availabilitySeo = {
  global: { lang: "en", path: "/availability", title: "Current Production Availability — Alvora", description: "Browse Alvora's current Fancy Colour and White diamond production. View IGI-certified make details and request price or a hold directly from the stone." },
  fr: { lang: "fr", path: "/fr/availability", title: "Disponibilités de production — Alvora", description: "Découvrez la production actuelle de diamants synthétiques Alvora, en couleurs fantaisie et blancs, avec détails de fabrication et vérification IGI." },
  it: { lang: "it", path: "/it/availability", title: "Disponibilità di produzione — Alvora", description: "Consulta la produzione attuale di diamanti sintetici Alvora, colori Fancy e bianchi, con dettagli di lavorazione e verifica IGI." },
  us: { lang: "en-US", path: "/availability", title: "Current Production Availability — Alvora", description: "Browse Alvora's current Fancy Colour and White diamond production with IGI-certified make details." },
} satisfies Record<PublicSeoLocale, PublicDocumentMetadata>;

const alternateLanguage = { global: "en", fr: "fr", it: "it", us: "en-US" } satisfies Record<PublicSeoLocale, string>;

function langToOgLocale(lang: string): string {
  const map: Record<string, string> = { en: "en_US", "en-US": "en_US", fr: "fr_FR", it: "it_IT" };
  return map[lang] ?? "en_US";
}

function setMeta(attribute: "name" | "property", key: string, content: string) {
  let element = document.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
}

function setLink(rel: string, href: string, hrefLang?: string) {
  const selector = hrefLang ? `link[rel="${rel}"][hreflang="${hrefLang}"]` : `link[rel="${rel}"]:not([hreflang])`;
  let element = document.head.querySelector<HTMLLinkElement>(selector);
  if (!element) {
    element = document.createElement("link");
    element.rel = rel;
    if (hrefLang) element.hreflang = hrefLang;
    document.head.appendChild(element);
  }
  element.href = href;
}

export function applyDocumentMetadata(current: PublicDocumentMetadata) {
  const origin = window.location.origin;
  const url = `${origin}${current.path}`;
  const image = `${origin}${publicSocialImage}`;
  document.documentElement.lang = current.lang;
  document.title = current.title;
  setMeta("name", "description", current.description);
  setMeta("name", "robots", current.robots ?? "index,follow,max-image-preview:large");
  setMeta("property", "og:type", "website");
  setMeta("property", "og:title", current.title);
  setMeta("property", "og:description", current.description);
  setMeta("property", "og:url", url);
  setMeta("property", "og:image", image);
  setMeta("property", "og:image:width", "1200");
  setMeta("property", "og:image:height", "630");
  setMeta("property", "og:image:type", "image/jpeg");
  setMeta("property", "og:image:alt", publicSocialImageAlt);
  setMeta("property", "og:site_name", "Alvora");
  setMeta("property", "og:locale", langToOgLocale(current.lang));
  setMeta("name", "twitter:card", "summary_large_image");
  setMeta("name", "twitter:title", current.title);
  setMeta("name", "twitter:description", current.description);
  setMeta("name", "twitter:image", image);
  setMeta("name", "twitter:image:alt", publicSocialImageAlt);
  setLink("canonical", url);
}

export function applyPublicSeo(locale: PublicSeoLocale) {
  const current = publicSeo[locale];
  const origin = window.location.origin;
  applyDocumentMetadata(current);
  (Object.keys(publicSeo) as PublicSeoLocale[]).forEach((key) => {
    setLink("alternate", `${origin}${publicSeo[key].path}`, alternateLanguage[key]);
  });
  setLink("alternate", `${origin}/`, "x-default");
  // og:locale:alternate for sibling language versions
  const currentOgLocale = langToOgLocale(current.lang);
  (Object.keys(publicSeo) as PublicSeoLocale[])
    .map((key) => langToOgLocale(alternateLanguage[key]))
    .filter((loc, i, arr) => loc !== currentOgLocale && arr.indexOf(loc) === i)
    .forEach((loc) => setMeta("property", "og:locale:alternate", loc));
}

export function applyAvailabilitySeo(locale: PublicSeoLocale) {
  const current = availabilitySeo[locale];
  const origin = window.location.origin;
  applyDocumentMetadata(current);
  (Object.keys(availabilitySeo) as PublicSeoLocale[]).forEach((key) => {
    setLink("alternate", `${origin}${availabilitySeo[key].path}`, alternateLanguage[key]);
  });
  setLink("alternate", `${origin}/availability`, "x-default");
  // og:locale:alternate for sibling language versions
  const currentOgLocale = langToOgLocale(current.lang);
  (Object.keys(availabilitySeo) as PublicSeoLocale[])
    .map((key) => langToOgLocale(alternateLanguage[key]))
    .filter((loc, i, arr) => loc !== currentOgLocale && arr.indexOf(loc) === i)
    .forEach((loc) => setMeta("property", "og:locale:alternate", loc));
}
