import { availabilitySeo, publicSeo, publicSocialImage } from "../client/src/lib/publicSeo";

interface RouteMeta {
  lang: string;
  title: string;
  description: string;
  canonical: string;
  robots?: string;
  alternates?: Array<{ lang: string; href: string }>;
  serviceJsonLd?: object;
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
    case "/calibrated-diamond-layouts":
      return {
        lang: "en",
        title: "Calibrated Lab-Grown Diamond Layouts | Alvora Diamonds, Surat",
        description: "Alvora makes calibrated lab-grown diamond layouts from Surat to exact repeatable dimensions — same girdle, same depth, same seat. Built for manufacturing jewellers who need every stone to hold position.",
        canonical: url("/calibrated-diamond-layouts"),
        serviceJsonLd: { "@context": "https://schema.org", "@type": "Service", name: "Calibrated Lab-Grown Diamond Layouts", serviceType: "Diamond Manufacturing", provider: { "@type": "Organization", name: "Alvora", address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" } }, description: "Calibrated lab-grown diamond layouts cut to exact repeatable dimensions for pave, channel, and bezel setting programmes.", areaServed: "Worldwide" },
      };
    case "/matched-pair-diamonds":
      return {
        lang: "en",
        title: "Matched Pair Lab-Grown Diamonds, Made to Tolerance | Alvora",
        description: "Alvora makes matched pairs of lab-grown diamonds — matched for colour, dimensions, and cut grade so they read as one stone in the finished piece. Direct from our benches in Surat.",
        canonical: url("/matched-pair-diamonds"),
        serviceJsonLd: { "@context": "https://schema.org", "@type": "Service", name: "Matched Pair Lab-Grown Diamonds", serviceType: "Diamond Manufacturing", provider: { "@type": "Organization", name: "Alvora", address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" } }, description: "Matched pair lab-grown diamonds matched for colour, dimensions, cut grade, and proportions.", areaServed: "Worldwide" },
      };
    case "/custom-cut-diamonds":
      return {
        lang: "en",
        title: "Custom-Cut Lab-Grown Diamonds to Exact Specification",
        description: "Send your specification sheet — shape, exact diameter, depth ratio, table, finish — and Alvora cuts the diamond to meet it. Precision manufacturing from Surat, 5–10 working day lead time.",
        canonical: url("/custom-cut-diamonds"),
        serviceJsonLd: { "@context": "https://schema.org", "@type": "Service", name: "Custom-Cut Lab-Grown Diamonds", serviceType: "Diamond Manufacturing", provider: { "@type": "Organization", name: "Alvora", address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" } }, description: "Custom-cut lab-grown diamonds made to exact buyer specification — shape, diameter, depth, table, and finish.", areaServed: "Worldwide" },
      };
    case "/melee-diamonds":
      return {
        lang: "en",
        title: "Wholesale Lab-Grown Melee Diamonds | Alvora Diamonds",
        description: "Alvora supplies wholesale lab-grown melee diamonds calibrated to consistent diameter ranges. Excellent cut, no fluorescence, no BGM — the same standard applied to every stone regardless of size.",
        canonical: url("/melee-diamonds"),
        serviceJsonLd: { "@context": "https://schema.org", "@type": "Service", name: "Wholesale Lab-Grown Melee Diamonds", serviceType: "Diamond Manufacturing", provider: { "@type": "Organization", name: "Alvora", address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" } }, description: "Wholesale lab-grown melee diamonds calibrated to consistent diameter ranges, Excellent cut, no fluorescence.", areaServed: "Worldwide" },
      };
    case "/certifications":
      return {
        lang: "en",
        title: "IGI-Certified Lab-Grown Diamonds — What Our Certificates Cover",
        description: "Every Alvora diamond ships IGI laser-inscribed and database-verified. Understand what each certificate covers — 4Cs, cut quality, laser inscription, and how to verify any report number directly with IGI.",
        canonical: url("/certifications"),
        serviceJsonLd: { "@context": "https://schema.org", "@type": "Service", name: "IGI-Certified Lab-Grown Diamonds", serviceType: "Diamond Manufacturing and Certification", provider: { "@type": "Organization", name: "Alvora", address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" } }, description: "Every Alvora lab-grown diamond is IGI laser-inscribed and verified against the IGI database before dispatch.", areaServed: "Worldwide" },
      };
    case "/about":
      return {
        lang: "en",
        title: "About Alvora — Surat Lab-Grown Diamond Manufacturer",
        description: "Alvora is a Surat-based lab-grown diamond manufacturer specialising in precision cutting, calibration, and IGI certification. Learn about our factory, process, and the bench-to-buyer approach.",
        canonical: url("/about"),
        serviceJsonLd: { "@context": "https://schema.org", "@type": "Organization", name: "Alvora", description: "Alvora is a Surat-based lab-grown diamond manufacturer specialising in precision cutting, calibration, and IGI certification.", address: { "@type": "PostalAddress", addressLocality: "Surat", addressRegion: "Gujarat", addressCountry: "IN" } },
      };
    case "/for-jewelry-brands":
      return {
        lang: "en",
        title: "Lab-Grown Diamonds for Jewellery Brands — Alvora",
        description: "Alvora supplies manufacturing jewellers, DTC brands, and private-label operations with certified, calibrated lab-grown diamonds. Spec-based ordering, matched parcels, direct manufacturer pricing.",
        canonical: url("/for-jewelry-brands"),
        serviceJsonLd: { "@context": "https://schema.org", "@type": "Service", name: "Lab-Grown Diamonds for Jewellery Brands", serviceType: "Diamond Manufacturing", provider: { "@type": "Organization", name: "Alvora", address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" } }, description: "Certified, calibrated lab-grown diamonds for manufacturing jewellers, DTC brands, and private-label operations.", areaServed: "Worldwide" },
      };
    case "/request-a-quote":
      return {
        lang: "en",
        title: "Request a Quote — Alvora Lab-Grown Diamonds",
        description: "Submit a production enquiry to Alvora — describe the specification, quantity, certification requirement, and timeline. We respond with practical production detail and pricing.",
        canonical: url("/request-a-quote"),
        serviceJsonLd: { "@context": "https://schema.org", "@type": "Service", name: "Request a Quote — Alvora Lab-Grown Diamonds", serviceType: "Diamond Manufacturing", provider: { "@type": "Organization", name: "Alvora", address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" } }, description: "Submit a production enquiry to Alvora for certified, calibrated lab-grown diamonds.", areaServed: "Worldwide" },
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

/**
 * Replaces the empty React root placeholder with prerendered body content so
 * crawlers see real H1/copy without waiting for JavaScript.
 * Must be called AFTER injectSeoIntoHtml (order doesn't matter functionally,
 * but keeping SEO first makes diffs easier to read).
 */
export function injectPrerenderedBody(html: string, rootContent: string): string {
  return html.replace('<div id="root"></div>', `<div id="root">${rootContent}</div>`);
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
    ...(meta.serviceJsonLd ? [`<script type="application/ld+json">${JSON.stringify(meta.serviceJsonLd)}</script>`] : []),
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
