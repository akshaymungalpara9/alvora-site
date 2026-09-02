import { availabilitySeo, publicSeo, publicSocialImage } from "../client/src/lib/publicSeo";

interface RouteMeta {
  lang: string;
  title: string;
  description: string;
  canonical: string;
  robots?: string;
  alternates?: Array<{ lang: string; href: string }>;
  serviceJsonLd?: object | object[];
}

function buildOrgJsonLd(origin: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${origin}/#organization`,
        name: "Alvora",
        url: `${origin}/`,
        logo: `${origin}/assets/alvora-faceted-a.webp`,
        description:
          "Alvora is a Surat lab-grown diamond manufacturer making certified, calibrated diamonds, matched layouts, and custom cuts to exact specification.",
        sameAs: [],
      },
      {
        "@type": "LocalBusiness",
        "@id": `${origin}/#business`,
        name: "Alvora",
        url: `${origin}/`,
        address: {
          "@type": "PostalAddress",
          streetAddress: "TODO(alvora): street address",
          addressLocality: "Surat",
          addressRegion: "Gujarat",
          postalCode: "TODO(alvora): postal code",
          addressCountry: "IN",
        },
        telephone: "TODO(alvora): +91-XXX-XXX-XXXX",
        email: "TODO(alvora): contact@alvoradiamonds.com",
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
}

function mkArticle(origin: string, path: string, headline: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    datePublished: "2026-09-01",
    author: { "@type": "Organization", name: "Alvora Diamonds" },
    publisher: { "@type": "Organization", name: "Alvora Diamonds" },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${origin}${path}` },
  };
}

function mkFaqPage(questions: Array<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}

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
    // PAA pages — Article + FAQPage JSON-LD pair
    case "/insights/are-lab-grown-diamonds-real-diamonds":
      return {
        lang: "en",
        title: "Are Lab-Grown Diamonds Real Diamonds? | Alvora",
        description: "Lab-grown diamonds are chemically, physically, and optically identical to mined diamonds, recognised by the FTC in 2018. This page explains IGI and GIA documentation and how to verify a stone matches its certificate.",
        canonical: url("/insights/are-lab-grown-diamonds-real-diamonds"),
        serviceJsonLd: [
          mkArticle(origin, "/insights/are-lab-grown-diamonds-real-diamonds", "Are Lab-Grown Diamonds Real Diamonds?", "Lab-grown diamonds share the chemical, physical, and optical properties of mined diamonds and are recognised by the FTC as diamonds with required origin disclosure."),
          mkFaqPage([
            { q: "Are lab-grown diamonds real diamonds?", a: "Yes. Lab-grown diamonds are diamonds with the same fundamental chemical, physical, and optical properties as mined diamonds; the distinction is their origin. The US FTC recognized this in its 2018 Jewelry Guides while retaining a requirement to disclose laboratory-grown origin clearly. IGI and GIA provide laboratory-grown reports or assessments, and buyers can verify report numbers and laser inscriptions online." },
          ]),
        ],
      };
    case "/insights/best-lab-grown-diamond-manufacturer-for-your-need":
      return {
        lang: "en",
        title: "Which Lab-Grown Diamond Manufacturer Is Best? | Alvora",
        description: "There is no single best lab-grown diamond manufacturer — the right choice depends on volume, format, certification, and delivery region. A buyer-focused rubric for evaluating suppliers.",
        canonical: url("/insights/best-lab-grown-diamond-manufacturer-for-your-need"),
        serviceJsonLd: [
          mkArticle(origin, "/insights/best-lab-grown-diamond-manufacturer-for-your-need", "Which Lab-Grown Diamond Manufacturer Is Best? (It Depends What You're Buying)", "A buyer-focused rubric for choosing a laboratory-grown diamond manufacturer by need."),
          mkFaqPage([
            { q: "Which company is the best for lab-grown diamonds?", a: "There is no single best company for every lab-grown diamond purchase. KIRA has the clearest public scale evidence, Guru Diam emphasizes US-facing trade convenience, and specialist suppliers may be more suitable for calibrated layouts, matched pairs, custom cuts, fancy colour, or large stones. Compare each supplier against the exact design, volume, certification, and delivery requirement." },
          ]),
        ],
      };
    case "/insights/is-a-lab-grown-diamond-worth-it":
      return {
        lang: "en",
        title: "Is a Lab-Grown Diamond Worth Buying? | Alvora",
        description: "Whether a lab-grown diamond is worth buying depends on who is buying. For B2B retailers and designers the case is strong; end consumers should factor in the low secondary-market resale value.",
        canonical: url("/insights/is-a-lab-grown-diamond-worth-it"),
        serviceJsonLd: [
          mkArticle(origin, "/insights/is-a-lab-grown-diamond-worth-it", "Is a Lab-Grown Diamond Worth Buying? (For Retailers, Designers, and End Buyers)", "A balanced B2B and consumer analysis of laboratory-grown diamond value, cost, and resale considerations."),
          mkFaqPage([
            { q: "Is it worth buying a lab-grown diamond?", a: "It can be worth buying if you value the jewellery, size, design, laboratory-grown origin, and current price more than future resale. Retailers and designers should assess landed cost, certification, inventory risk, and repeatability. End consumers should assume secondary-market value may be low and should not buy a lab-grown diamond as a short-term investment." },
          ]),
        ],
      };
    case "/insights/lab-grown-diamond-price-per-carat":
      return {
        lang: "en",
        title: "Lab-Grown Diamond Price Per Carat (Wholesale, 2026) | Alvora",
        description: "A sourced explanation of public wholesale lab-grown diamond price data for 2026 and its limitations. A real quote requires the exact stone specification, report, method, and delivery terms.",
        canonical: url("/insights/lab-grown-diamond-price-per-carat"),
        serviceJsonLd: [
          mkArticle(origin, "/insights/lab-grown-diamond-price-per-carat", "Lab-Grown Diamond Price Per Carat (Wholesale, 2026)", "An evidence-led explanation of public wholesale lab-grown diamond price data and its limitations."),
          mkFaqPage([
            { q: "How much is 1 carat lab grown diamond in India?", a: "There is no reliable single public 2026 India wholesale price for a 1ct lab-grown diamond. The price depends on shape, colour, clarity, cut, CVD or HPHT method, treatment, certification, quantity, and delivery terms. A Q2 2025 US retailer acquisition average of USD $191/ct for 1ct IGI-certified rounds is a stale benchmark, not an India factory quote." },
            { q: "How much should I pay for a 1 carat lab grown diamond?", a: "Pay only after comparing like-for-like current quotes. Ask for the exact report, method, treatment, measurements, cut, return terms, certification, freight, insurance, duties, and taxes. Public data show continuing wholesale price declines but do not support a complete current 1ct price range by colour, clarity, and certificate." },
          ]),
        ],
      };
    case "/insights/lab-grown-diamond-wholesale-how-to-buy":
      return {
        lang: "en",
        title: "Where to Buy Lab-Grown Diamonds Wholesale | Alvora",
        description: "Lab-grown diamonds are sold wholesale through four channels: direct from manufacturers, online marketplaces, local wholesalers, and trade shows. A practical guide to choosing the right channel.",
        canonical: url("/insights/lab-grown-diamond-wholesale-how-to-buy"),
        serviceJsonLd: [
          mkArticle(origin, "/insights/lab-grown-diamond-wholesale-how-to-buy", "Where to Buy Lab-Grown Diamonds Wholesale (A Buyer's Guide)", "A comparison of four wholesale channels for laboratory-grown diamonds."),
          mkFaqPage([
            { q: "Where can I buy lab-grown diamonds wholesale?", a: "Wholesale lab-grown diamonds are available direct from manufacturers, through online marketplaces such as Nivoda and VDB, from local wholesalers, and at trade shows such as IIJS, JCK, and Jewellery & Gem WORLD Hong Kong. Choose the channel according to your need for breadth, technical specification, physical inspection, urgency, and repeat supply." },
          ]),
        ],
      };
    case "/insights/largest-lab-grown-diamond-manufacturers-india":
      return {
        lang: "en",
        title: "The Largest Lab-Grown Diamond Manufacturers in India (2026) | Alvora",
        description: "A sourced comparison of Indian lab-grown diamond manufacturers by public capacity evidence. Based on 2026 public figures, KIRA has the strongest scale evidence, with over 250,000 polished carats per month.",
        canonical: url("/insights/largest-lab-grown-diamond-manufacturers-india"),
        serviceJsonLd: [
          mkArticle(origin, "/insights/largest-lab-grown-diamond-manufacturers-india", "The Largest Lab-Grown Diamond Manufacturers in India (2026)", "A sourced comparison of Indian lab-grown diamond manufacturers by publicly stated production evidence."),
          mkFaqPage([
            { q: "Who is the largest producer of lab-grown diamonds in India?", a: "Based on publicly stated production figures in 2026, KIRA / Kira Jewels is India's largest lab-grown diamond producer on the evidence reviewed, with more than 250,000 polished carats per month reported by GJEPC. Current reported output and planned capacity should be kept separate." },
            { q: "Who is the biggest producer of lab-grown diamonds?", a: "For India, KIRA / Kira Jewels has the strongest public scale evidence in the reviewed 2026 source set, with more than 250,000 polished carats per month reported by GJEPC. Public figures from other producers use different units and are not directly comparable." },
            { q: "Who is the leading lab-grown diamond supplier in India?", a: "There is no single objective definition of leading. KIRA has the clearest public scale evidence, while other suppliers may fit better for specialty stones, service, calibrated layouts, matched pairs, or custom cuts. Buyers should compare the supplier against the exact requirement." },
          ]),
        ],
      };
    // Insight articles — Article JSON-LD only
    case "/insights/12-questions-to-ask-a-manufacturer":
      return {
        lang: "en",
        title: "12 Questions to Ask a Lab-Grown Diamond Manufacturer | Alvora",
        description: "A practical due-diligence checklist covering specification control, growth method, treatment, certification, QC rules, dimensional tolerances, MOQ, sample terms, lead times, landed cost, and repeat-order capability.",
        canonical: url("/insights/12-questions-to-ask-a-manufacturer"),
        serviceJsonLd: mkArticle(origin, "/insights/12-questions-to-ask-a-manufacturer", "12 Questions to Ask a Lab-Grown Diamond Manufacturer Before You Order", "A due-diligence checklist for evaluating a laboratory-grown diamond manufacturer before placing an order."),
      };
    case "/insights/calibrated-diamond-layouts-explained":
      return {
        lang: "en",
        title: "Calibrated Diamond Layouts, Explained: Tolerances, Grading, and How to Order | Alvora",
        description: "A practical explanation of what calibrated really means, how tolerance and grading work, what belongs in the order brief, and how to avoid ambiguity when ordering a design-specific diamond layout.",
        canonical: url("/insights/calibrated-diamond-layouts-explained"),
        serviceJsonLd: mkArticle(origin, "/insights/calibrated-diamond-layouts-explained", "Calibrated Diamond Layouts, Explained: Tolerances, Grading, and How to Order", "A practical explanation of calibrated diamond layouts covering tolerance, grading, and order brief requirements."),
      };
    case "/insights/cvd-vs-hpht-lab-grown-diamonds":
      return {
        lang: "en",
        title: "CVD vs HPHT Lab-Grown Diamonds: What Wholesale Buyers Need to Know | Alvora",
        description: "CVD and HPHT are different laboratory-grown diamond production methods. Wholesale buyers should choose by the finished specification, treatment disclosure, and supply requirement — not by method alone.",
        canonical: url("/insights/cvd-vs-hpht-lab-grown-diamonds"),
        serviceJsonLd: mkArticle(origin, "/insights/cvd-vs-hpht-lab-grown-diamonds", "CVD vs HPHT Lab-Grown Diamonds: What Wholesale Buyers Need to Know", "A comparison of CVD and HPHT laboratory-grown diamond production methods for wholesale buyers."),
      };
    case "/insights/matched-pairs-vs-melee-vs-layouts":
      return {
        lang: "en",
        title: "Matched Pairs vs. Melee vs. Layouts: Which Format Does Your Design Need? | Alvora",
        description: "Matched pairs coordinate two stones, melee supplies small stones by lot, and layouts coordinate a larger design-specific group. A practical guide to choosing the right wholesale format for your design.",
        canonical: url("/insights/matched-pairs-vs-melee-vs-layouts"),
        serviceJsonLd: mkArticle(origin, "/insights/matched-pairs-vs-melee-vs-layouts", "Matched Pairs vs. Melee vs. Layouts: Which Format Does Your Design Need?", "A practical guide to choosing between matched pairs, melee lots, and calibrated layouts for wholesale diamond procurement."),
      };
    case "/insights/sourcing-lab-grown-diamonds-from-surat":
      return {
        lang: "en",
        title: "Lab-Grown Diamond Manufacturers in Surat: A Buyer's Guide to Sourcing Direct | Alvora",
        description: "A practical guide to sourcing laboratory-grown diamonds direct from Surat manufacturers, covering what direct means, CVD and HPHT disclosure, certification layers, and due diligence before payment.",
        canonical: url("/insights/sourcing-lab-grown-diamonds-from-surat"),
        serviceJsonLd: mkArticle(origin, "/insights/sourcing-lab-grown-diamonds-from-surat", "Lab-Grown Diamond Manufacturers in Surat: A Buyer's Guide to Sourcing Direct", "A practical guide to sourcing laboratory-grown diamonds direct from Surat manufacturers."),
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

  const serviceJsonLdTags = meta.serviceJsonLd
    ? Array.isArray(meta.serviceJsonLd)
      ? meta.serviceJsonLd.map((ld) => `<script type="application/ld+json">${JSON.stringify(ld)}</script>`)
      : [`<script type="application/ld+json">${JSON.stringify(meta.serviceJsonLd)}</script>`]
    : [];

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
    `<script type="application/ld+json">${JSON.stringify(buildOrgJsonLd(origin))}</script>`,
    ...serviceJsonLdTags,
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
