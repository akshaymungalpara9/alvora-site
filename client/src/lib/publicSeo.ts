export type PublicSeoLocale = "global" | "fr" | "it" | "us";

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
} satisfies Record<PublicSeoLocale, { lang: string; path: string; title: string; description: string }>;

const alternateLanguage = { global: "en", fr: "fr", it: "it", us: "en-US" } satisfies Record<PublicSeoLocale, string>;

function setMeta(name: string, content: string) {
  let element = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.name = name;
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

export function applyPublicSeo(locale: PublicSeoLocale) {
  const current = publicSeo[locale];
  const origin = window.location.origin;
  document.documentElement.lang = current.lang;
  document.title = current.title;
  setMeta("description", current.description);
  setMeta("robots", "index,follow,max-image-preview:large");
  setLink("canonical", `${origin}${current.path}`);
  (Object.keys(publicSeo) as PublicSeoLocale[]).forEach((key) => {
    setLink("alternate", `${origin}${publicSeo[key].path}`, alternateLanguage[key]);
  });
  setLink("alternate", `${origin}/`, "x-default");
}
