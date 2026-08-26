export type PublicSeoLocale = "global" | "fr" | "it" | "us";

export type PublicDocumentMetadata = { lang: string; path: string; title: string; description: string };
export const publicSocialImage = "/manus-storage/alvora-hero-qc_9e0d540e.jpg";

export const publicSeo = {
  global: {
    lang: "en",
    path: "/",
    title: "Alvora — Lab-Grown Diamond Manufacturers, Surat",
    description: "Alvora is a Surat lab-grown diamond manufacturer making certified, calibrated diamonds, matched layouts, and custom cuts to exact specification.",
  },
  fr: {
    lang: "fr",
    path: "/fr",
    title: "Alvora — Fabricant de diamants synthétiques à Surat",
    description: "Alvora fabrique à Surat des diamants synthétiques certifiés et calibrés, des assortiments et des fabrications sur mesure pour les équipes joaillières.",
  },
  it: {
    lang: "it",
    path: "/it",
    title: "Alvora — Produttori di diamanti sintetici, Surat",
    description: "Alvora realizza a Surat diamanti sintetici certificati e calibrati, lotti abbinati e lavorazioni su specifica per la gioielleria.",
  },
  us: {
    lang: "en-US",
    path: "/us",
    title: "Alvora — Lab-Grown Diamond Manufacturing for US & Canada",
    description: "Alvora makes certified, calibrated lab-grown diamonds in Surat for North American jewellery teams, with clear US and Canada delivery guidance.",
  },
} satisfies Record<PublicSeoLocale, PublicDocumentMetadata>;

const alternateLanguage = { global: "en", fr: "fr", it: "it", us: "en-US" } satisfies Record<PublicSeoLocale, string>;

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
  setMeta("name", "robots", "index,follow,max-image-preview:large");
  setMeta("property", "og:type", "website");
  setMeta("property", "og:title", current.title);
  setMeta("property", "og:description", current.description);
  setMeta("property", "og:url", url);
  setMeta("property", "og:image", image);
  setMeta("name", "twitter:card", "summary_large_image");
  setMeta("name", "twitter:title", current.title);
  setMeta("name", "twitter:description", current.description);
  setMeta("name", "twitter:image", image);
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
}
