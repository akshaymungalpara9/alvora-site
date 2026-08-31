import { availabilitySeo, publicSeo, publicSocialImage } from "../client/src/lib/publicSeo";

interface RouteMeta {
  lang: string;
  title: string;
  description: string;
  canonical: string;
  robots?: string;
  alternates?: Array<{ lang: string; href: string }>;
}

// TODO: Replace every "TODO:" value below with real production values before go-live.
const ORG_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "TODO: https://yourdomain.com/#organization",
      name: "Alvora",
      url: "TODO: https://yourdomain.com/",
      logo: "TODO: https://yourdomain.com/assets/alvora-logo.png",
      description:
        "Alvora is a Surat lab-grown diamond manufacturer making certified, calibrated diamonds, matched layouts, and custom cuts to exact specification.",
      sameAs: [
        // TODO: add LinkedIn, Instagram, and other social profile URLs
      ],
    },
    {
      "@type": "LocalBusiness",
      "@id": "TODO: https://yourdomain.com/#business",
      name: "Alvora",
      url: "TODO: https://yourdomain.com/",
      address: {
        "@type": "PostalAddress",
        streetAddress: "TODO: street address",
        addressLocality: "Surat",
        addressRegion: "Gujarat",
        postalCode: "TODO: postal code",
        addressCountry: "IN",
      },
      telephone: "TODO: +91-XXX-XXX-XXXX",
      email: "TODO: contact@yourdomain.com",
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "18:00",
      },
      priceRange: "$$$$",
      currenciesAccepted: "USD, EUR, INR",
    },
  ],
};

function publicHreflangAlternates(origin: string) {
  return [
    { lang: "en", href: `${origin}/` },
    { lang: "fr", href: `${origin}/fr` },
    { lang: "it", href: `${origin}/it` },
    { lang: "en-US", href: `${origin}/us` },
    { lang: "x-default", href: `${origin}/` },
  ];
}

function availabilityHreflangAlternates(origin: string) {
  return [
    { lang: "en", href: `${origin}/availability` },
    { lang: "fr", href: `${origin}/fr/availability` },
    { lang: "it", href: `${origin}/it/availability` },
    { lang: "x-default", href: `${origin}/availability` },
  ];
}

function resolveRouteMeta(pathname: string, origin: string): RouteMeta | null {
  const url = (p: string) => `${origin}${p}`;
  switch (pathname) {
    case "/":
      return { ...publicSeo.global, canonical: url("/"), alternates: publicHreflangAlternates(origin) };
    case "/fr":
      return { ...publicSeo.fr, canonical: url("/fr"), alternates: publicHreflangAlternates(origin) };
    case "/it":
      return { ...publicSeo.it, canonical: url("/it"), alternates: publicHreflangAlternates(origin) };
    case "/us":
      return { ...publicSeo.us, canonical: url("/us"), alternates: publicHreflangAlternates(origin) };
    case "/availability":
      return { ...availabilitySeo.global, canonical: url("/availability"), alternates: availabilityHreflangAlternates(origin) };
    case "/fr/availability":
      return { ...availabilitySeo.fr, canonical: url("/fr/availability"), alternates: availabilityHreflangAlternates(origin) };
    case "/it/availability":
      return { ...availabilitySeo.it, canonical: url("/it/availability"), alternates: availabilityHreflangAlternates(origin) };
    case "/buyer-availability":
      return {
        lang: "en",
        title: "Diamond Availability — Alvora",
        description: "Current Alvora diamond availability for registered buyers.",
        canonical: url("/buyer-availability"),
        robots: "noindex,nofollow",
      };
    case "/insights":
      return {
        lang: "en",
        title: "Diamond Industry Insights — Alvora",
        description: "Analysis, reports, and market commentary from Alvora's diamond manufacturing team in Surat.",
        canonical: url("/insights"),
      };
    case "/refer":
      return {
        lang: "en",
        title: "Refer a Buyer — Alvora",
        description: "Refer a jewellery buyer to Alvora and earn a referral reward.",
        canonical: url("/refer"),
        robots: "noindex,nofollow",
      };
    case "/privacy":
      return {
        lang: "en",
        title: "Privacy Policy — Alvora",
        description: "Alvora privacy policy covering data collected through our website and buyer onboarding process.",
        canonical: url("/privacy"),
        robots: "noindex,follow",
      };
    case "/terms":
      return {
        lang: "en",
        title: "Terms of Service — Alvora",
        description: "Alvora terms of service governing use of our website and buyer platform.",
        canonical: url("/terms"),
        robots: "noindex,follow",
      };
    default:
      if (pathname.startsWith("/insights/")) {
        return {
          lang: "en",
          title: "Diamond Industry Insights — Alvora",
          description: "Analysis and market commentary from Alvora's diamond manufacturing team.",
          canonical: url(pathname),
        };
      }
      return null;
  }
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Injects SEO tags into the index.html shell for a given pathname.
 * Returns html unchanged for unrecognised paths (admin, api, etc.).
 */
export function injectSeoIntoHtml(html: string, pathname: string, origin: string): string {
  const meta = resolveRouteMeta(pathname, origin);
  if (!meta) return html;

  const image = `${origin}${publicSocialImage}`;
  const robots = meta.robots ?? "index,follow,max-image-preview:large";

  const tags = [
    `<meta name="robots" content="${esc(robots)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:title" content="${esc(meta.title)}" />`,
    `<meta property="og:description" content="${esc(meta.description)}" />`,
    `<meta property="og:url" content="${esc(meta.canonical)}" />`,
    `<meta property="og:image" content="${esc(image)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(meta.title)}" />`,
    `<meta name="twitter:description" content="${esc(meta.description)}" />`,
    `<meta name="twitter:image" content="${esc(image)}" />`,
    `<link rel="canonical" href="${esc(meta.canonical)}" />`,
    ...(meta.alternates ?? []).map(({ lang, href }) => `<link rel="alternate" hreflang="${esc(lang)}" href="${esc(href)}" />`),
    `<script type="application/ld+json">${JSON.stringify(ORG_JSON_LD)}</script>`,
  ].join("\n  ");

  return html
    .replace('lang="en"', `lang="${meta.lang}"`)
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(meta.title)}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
      `<meta name="description" content="${esc(meta.description)}" />`
    )
    .replace("</head>", `  ${tags}\n</head>`);
}
