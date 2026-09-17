import { availabilitySeo, publicSeo, publicSocialImage, publicSocialImageAlt } from "../client/src/lib/publicSeo";
import { COMPANY } from "../shared/companyInfo";
import { ROUTE_META } from "../shared/routeMeta";

function langToOgLocale(lang: string): string {
  const map: Record<string, string> = { en: "en_US", "en-US": "en_US", fr: "fr_FR", it: "it_IT" };
  return map[lang] ?? "en_US";
}

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
        "@type": "WebSite",
        "@id": `${origin}/#website`,
        url: `${origin}/`,
        name: "Alvora",
        publisher: { "@id": `${origin}/#organization` },
        inLanguage: ["en", "fr", "it"],
      },
      {
        "@type": "Organization",
        "@id": `${origin}/#organization`,
        name: "Alvora",
        legalName: COMPANY.legalName,
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
          ...(COMPANY.address.street ? { streetAddress: COMPANY.address.street } : {}),
          addressLocality: COMPANY.address.city,
          addressRegion: COMPANY.address.state,
          ...(COMPANY.address.postalCode ? { postalCode: COMPANY.address.postalCode } : {}),
          addressCountry: "IN",
        },
        telephone: COMPANY.phone,
        email: COMPANY.email,
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

function mkBreadcrumbs(origin: string, trail: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: `${origin}${crumb.path}`,
    })),
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

export function resolveRouteMeta(pathname: string, origin: string): RouteMeta | null {
  const url = (p: string) => `${origin}${p}`;
  switch (pathname) {
    case "/":
      return { ...publicSeo.global, title: ROUTE_META["/"].title, description: ROUTE_META["/"].description, canonical: url("/"), alternates: publicHreflangAlternates(origin), serviceJsonLd: mkFaqPage([
        { q: "Is there a minimum order?", a: "The minimum order depends on the product, size, shape, certification, and whether the request is stock, a sample, a layout, or custom production. Category-specific minimums are confirmed in the quotation before approval. Buyers should include the expected quantity and repeat-order plan so the applicable minimum can be discussed clearly." },
        { q: "Are your stones IGI or GIA certified?", a: "Alvora can supply IGI-certified laboratory-grown diamonds where applicable, with report-linked identity and familiar 4Cs information. IGI is generally the practical wholesale baseline for comparison and inventory workflows. GIA can be requested when a retailer or destination channel requires its name; buyers should confirm the report format needed before ordering." },
        { q: "Can I request a sample or memo?", a: "A sample or memo request can be discussed before the first production order, subject to the goods and commercial terms. Availability, return conditions, shipping, insurance, and any charges should be confirmed in writing. Custom-cut or specially produced goods may require separate treatment from standard stock." },
        { q: "How fast do you respond to a quote request?", a: "Within 24 hours during business days. Same-day on WhatsApp during Surat hours (IST 09:00–19:00). A complete brief — shape, measurements, quality, quantity, certification, destination, and any CAD or reference file — helps Alvora respond with a useful quotation." },
        { q: "What are your lead times?", a: "Lead time depends on whether the requirement is available stock, a selected layout or pair, melee sorting, certification, or custom cutting. Actual days by product are stated in the quotation. The schedule distinguishes feasibility review, production, grading, buyer approval, packing, and dispatch." },
        { q: "Do you ship to the US, Canada, EU, or GCC?", a: "Alvora can discuss courier shipment to the US, Canada, EU, and GCC, with insurance and applicable IGI paperwork arranged according to the order. The buyer is responsible for destination-country duties, taxes, and import clearance. US 25% duty, Canada 0%, EU standard, GCC standard — confirm current rates with the relevant customs authority before shipment." },
        { q: "How do I place my first order?", a: "Start with WhatsApp or an RFQ containing the design and stone specification. Alvora reviews the requirement and sends a quote, then the buyer can discuss a memo or sample where available before issuing a PO. After approval: production, documentation and QC, buyer confirmation where applicable, packing, and dispatch." },
      ]) };
    case "/fr":
      return { ...publicSeo.fr, title: ROUTE_META["/fr"].title, description: ROUTE_META["/fr"].description, canonical: url("/fr"), alternates: publicHreflangAlternates(origin) };
    case "/it":
      return { ...publicSeo.it, title: ROUTE_META["/it"].title, description: ROUTE_META["/it"].description, canonical: url("/it"), alternates: publicHreflangAlternates(origin) };
    case "/us":
      return { ...publicSeo.us, title: ROUTE_META["/us"].title, description: ROUTE_META["/us"].description, canonical: url("/us"), alternates: publicHreflangAlternates(origin) };
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
        title: ROUTE_META["/insights"].title,
        description: ROUTE_META["/insights"].description,
        canonical: url("/insights"),
        serviceJsonLd: {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Diamond Industry Insights — Alvora",
          description: "Practical guides, Q&A, and sourcing notes from Alvora's team in Surat on certification, specification, pricing, and choosing the right wholesale format.",
          itemListElement: [
            { "@type": "ListItem", position: 1, url: url("/insights/12-questions-to-ask-a-manufacturer"), name: "12 Questions to Ask a Lab-Grown Diamond Manufacturer Before You Order" },
            { "@type": "ListItem", position: 2, url: url("/insights/calibrated-diamond-layouts-explained"), name: "Calibrated Diamond Layouts, Explained: Tolerances, Grading, and How to Order" },
            { "@type": "ListItem", position: 3, url: url("/insights/cvd-vs-hpht-lab-grown-diamonds"), name: "CVD vs HPHT Lab-Grown Diamonds: What Wholesale Buyers Actually Need to Know" },
            { "@type": "ListItem", position: 4, url: url("/insights/matched-pairs-vs-melee-vs-layouts"), name: "Matched Pairs vs. Melee vs. Layouts: Which Format Does Your Design Need?" },
            { "@type": "ListItem", position: 5, url: url("/insights/sourcing-lab-grown-diamonds-from-surat"), name: "Lab-Grown Diamond Manufacturers in Surat: A Buyer's Guide to Sourcing Direct" },
          ],
        },
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
        title: ROUTE_META["/privacy"].title,
        description: ROUTE_META["/privacy"].description,
        canonical: url("/privacy"),
        robots: "noindex,follow",
      };
    case "/terms":
      return {
        lang: "en",
        title: ROUTE_META["/terms"].title,
        description: ROUTE_META["/terms"].description,
        canonical: url("/terms"),
        robots: "noindex,follow",
      };
    case "/calibrated-diamond-layouts":
      return {
        lang: "en",
        title: ROUTE_META["/calibrated-diamond-layouts"].title,
        description: ROUTE_META["/calibrated-diamond-layouts"].description,
        canonical: url("/calibrated-diamond-layouts"),
        serviceJsonLd: { "@context": "https://schema.org", "@type": "Service", name: "Calibrated Lab-Grown Diamond Layouts", serviceType: "Calibrated laboratory-grown diamond layouts", provider: { "@type": "Organization", name: "Alvora Diamonds", address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" } }, areaServed: "Worldwide" },
      };
    case "/matched-lab-grown-diamond-pairs":
      return {
        lang: "en",
        title: ROUTE_META["/matched-lab-grown-diamond-pairs"].title,
        description: ROUTE_META["/matched-lab-grown-diamond-pairs"].description,
        canonical: url("/matched-lab-grown-diamond-pairs"),
        serviceJsonLd: { "@context": "https://schema.org", "@type": "Service", name: "Matched Lab-Grown Diamond Pairs", serviceType: "Matched laboratory-grown diamond pairs", provider: { "@type": "Organization", name: "Alvora Diamonds", address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" } }, areaServed: "Worldwide" },
      };
    case "/custom-cut-lab-grown-diamonds":
      return {
        lang: "en",
        title: ROUTE_META["/custom-cut-lab-grown-diamonds"].title,
        description: ROUTE_META["/custom-cut-lab-grown-diamonds"].description,
        canonical: url("/custom-cut-lab-grown-diamonds"),
        serviceJsonLd: { "@context": "https://schema.org", "@type": "Service", name: "Custom-Cut Lab-Grown Diamonds to Specification", serviceType: "Custom-cut laboratory-grown diamonds", provider: { "@type": "Organization", name: "Alvora Diamonds", address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" } }, areaServed: "Worldwide" },
      };
    case "/igi-certified-lab-grown-diamonds":
      return {
        lang: "en",
        title: ROUTE_META["/igi-certified-lab-grown-diamonds"].title,
        description: ROUTE_META["/igi-certified-lab-grown-diamonds"].description,
        canonical: url("/igi-certified-lab-grown-diamonds"),
        serviceJsonLd: { "@context": "https://schema.org", "@type": "Product", name: "IGI-Certified Lab-Grown Diamonds", description: "Laboratory-grown diamonds supplied with IGI documentation where applicable.", brand: { "@type": "Brand", name: "Alvora Diamonds" }, manufacturer: { "@type": "Organization", name: "Alvora Diamonds", address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" } } },
      };
    case "/cvd-lab-grown-diamonds":
      return {
        lang: "en",
        title: ROUTE_META["/cvd-lab-grown-diamonds"].title,
        description: ROUTE_META["/cvd-lab-grown-diamonds"].description,
        canonical: url("/cvd-lab-grown-diamonds"),
        serviceJsonLd: { "@context": "https://schema.org", "@type": "Product", name: "CVD Lab-Grown Diamonds", description: "CVD laboratory-grown diamonds supplied with transparent method and treatment information.", brand: { "@type": "Brand", name: "Alvora Diamonds" }, material: "Laboratory-grown diamond" },
      };
    case "/hpht-lab-grown-diamonds":
      return {
        lang: "en",
        title: ROUTE_META["/hpht-lab-grown-diamonds"].title,
        description: ROUTE_META["/hpht-lab-grown-diamonds"].description,
        canonical: url("/hpht-lab-grown-diamonds"),
        serviceJsonLd: { "@context": "https://schema.org", "@type": "AboutPage", name: "HPHT Lab-Grown Diamonds for Wholesale", description: "Information about HPHT laboratory-grown diamonds and specification-led sourcing.", about: { "@type": "Product", name: "HPHT laboratory-grown diamonds", material: "Laboratory-grown diamond" }, publisher: { "@type": "Organization", name: "Alvora Diamonds" } },
      };
    case "/fancy-shape-colour-lab-grown-diamonds":
      return {
        lang: "en",
        title: ROUTE_META["/fancy-shape-colour-lab-grown-diamonds"].title,
        description: ROUTE_META["/fancy-shape-colour-lab-grown-diamonds"].description,
        canonical: url("/fancy-shape-colour-lab-grown-diamonds"),
        serviceJsonLd: { "@context": "https://schema.org", "@type": "Service", name: "Fancy-Shape and Fancy-Colour Lab-Grown Diamonds", serviceType: "Fancy-shape and fancy-colour laboratory-grown diamond sourcing", provider: { "@type": "Organization", name: "Alvora Diamonds", address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" } }, areaServed: "Worldwide" },
      };
    case "/precision-lab-grown-diamond-wholesale":
      return {
        lang: "en",
        title: ROUTE_META["/precision-lab-grown-diamond-wholesale"].title,
        description: ROUTE_META["/precision-lab-grown-diamond-wholesale"].description,
        canonical: url("/precision-lab-grown-diamond-wholesale"),
        serviceJsonLd: { "@context": "https://schema.org", "@type": "ContactPage", name: "Precision Lab-Grown Diamond Wholesale Supply", description: "Contact Alvora Diamonds about specification-led laboratory-grown diamond wholesale supply.", about: { "@type": "Service", name: "Precision lab-grown diamond wholesale supply" }, publisher: { "@type": "Organization", name: "Alvora Diamonds", address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" } } },
      };
    case "/matched-pair-diamonds":
      return {
        lang: "en",
        title: ROUTE_META["/matched-pair-diamonds"].title,
        description: ROUTE_META["/matched-pair-diamonds"].description,
        canonical: url("/matched-pair-diamonds"),
        serviceJsonLd: { "@context": "https://schema.org", "@type": "Service", name: "Matched Pair Lab-Grown Diamonds", serviceType: "Diamond Manufacturing", provider: { "@type": "Organization", name: "Alvora", address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" } }, description: "Matched pair lab-grown diamonds matched for colour, dimensions, cut grade, and proportions.", areaServed: "Worldwide" },
      };
    case "/custom-cut-diamonds":
      return {
        lang: "en",
        title: ROUTE_META["/custom-cut-diamonds"].title,
        description: ROUTE_META["/custom-cut-diamonds"].description,
        canonical: url("/custom-cut-diamonds"),
        serviceJsonLd: { "@context": "https://schema.org", "@type": "Service", name: "Custom-Cut Lab-Grown Diamonds", serviceType: "Diamond Manufacturing", provider: { "@type": "Organization", name: "Alvora", address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" } }, description: "Custom-cut lab-grown diamonds made to exact buyer specification — shape, diameter, depth, table, and finish.", areaServed: "Worldwide" },
      };
    case "/melee-diamonds":
      return {
        lang: "en",
        title: ROUTE_META["/melee-diamonds"].title,
        description: ROUTE_META["/melee-diamonds"].description,
        canonical: url("/melee-diamonds"),
        serviceJsonLd: { "@context": "https://schema.org", "@type": "Service", name: "Wholesale Lab-Grown Melee Diamonds", serviceType: "Diamond Manufacturing", provider: { "@type": "Organization", name: "Alvora", address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" } }, description: "Wholesale lab-grown melee diamonds calibrated to consistent diameter ranges, Excellent cut, no fluorescence.", areaServed: "Worldwide" },
      };
    case "/certifications":
      return {
        lang: "en",
        title: ROUTE_META["/certifications"].title,
        description: ROUTE_META["/certifications"].description,
        canonical: url("/certifications"),
        serviceJsonLd: { "@context": "https://schema.org", "@type": "Service", name: "IGI-Certified Lab-Grown Diamonds", serviceType: "Diamond Manufacturing and Certification", provider: { "@type": "Organization", name: "Alvora", address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" } }, description: "Every Alvora lab-grown diamond is IGI laser-inscribed and verified against the IGI database before dispatch.", areaServed: "Worldwide" },
      };
    case "/about":
      return {
        lang: "en",
        title: ROUTE_META["/about"].title,
        description: ROUTE_META["/about"].description,
        canonical: url("/about"),
        serviceJsonLd: { "@context": "https://schema.org", "@type": "Organization", name: "Alvora", description: "Alvora is a Surat-based lab-grown diamond manufacturer specialising in precision cutting, calibration, and IGI certification.", address: { "@type": "PostalAddress", addressLocality: "Surat", addressRegion: "Gujarat", addressCountry: "IN" } },
      };
    case "/for-jewelry-brands":
      return {
        lang: "en",
        title: ROUTE_META["/for-jewelry-brands"].title,
        description: ROUTE_META["/for-jewelry-brands"].description,
        canonical: url("/for-jewelry-brands"),
        serviceJsonLd: { "@context": "https://schema.org", "@type": "Service", name: "Lab-Grown Diamonds for Jewellery Brands", serviceType: "Diamond Manufacturing", provider: { "@type": "Organization", name: "Alvora", address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" } }, description: "Certified, calibrated lab-grown diamonds for manufacturing jewellers, DTC brands, and private-label operations.", areaServed: "Worldwide" },
      };
    case "/request-a-quote":
      return {
        lang: "en",
        title: ROUTE_META["/request-a-quote"].title,
        description: ROUTE_META["/request-a-quote"].description,
        canonical: url("/request-a-quote"),
        serviceJsonLd: { "@context": "https://schema.org", "@type": "Service", name: "Request a Quote — Alvora Lab-Grown Diamonds", serviceType: "Diamond Manufacturing", provider: { "@type": "Organization", name: "Alvora", address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" } }, description: "Submit a production enquiry to Alvora for certified, calibrated lab-grown diamonds.", areaServed: "Worldwide" },
      };
    case "/contact":
      return {
        lang: "en",
        title: ROUTE_META["/contact"].title,
        description: ROUTE_META["/contact"].description,
        canonical: url("/contact"),
        serviceJsonLd: {
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: COMPANY.legalName,
          url: url("/contact"),
          address: {
            "@type": "PostalAddress",
            ...(COMPANY.address.street ? { streetAddress: COMPANY.address.street } : {}),
            addressLocality: COMPANY.address.city,
            addressRegion: COMPANY.address.state,
            ...(COMPANY.address.postalCode ? { postalCode: COMPANY.address.postalCode } : {}),
            addressCountry: "IN",
          },
          telephone: COMPANY.phone,
          email: COMPANY.email,
          openingHoursSpecification: {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            opens: "09:00",
            closes: "18:00",
          },
        },
      };
    // PAA pages — Article + FAQPage JSON-LD pair
    case "/insights/are-lab-grown-diamonds-real-diamonds":
      return {
        lang: "en",
        title: ROUTE_META["/insights/are-lab-grown-diamonds-real-diamonds"].title,
        description: ROUTE_META["/insights/are-lab-grown-diamonds-real-diamonds"].description,
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
        title: ROUTE_META["/insights/best-lab-grown-diamond-manufacturer-for-your-need"].title,
        description: ROUTE_META["/insights/best-lab-grown-diamond-manufacturer-for-your-need"].description,
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
        title: ROUTE_META["/insights/is-a-lab-grown-diamond-worth-it"].title,
        description: ROUTE_META["/insights/is-a-lab-grown-diamond-worth-it"].description,
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
        title: ROUTE_META["/insights/lab-grown-diamond-price-per-carat"].title,
        description: ROUTE_META["/insights/lab-grown-diamond-price-per-carat"].description,
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
        title: ROUTE_META["/insights/lab-grown-diamond-wholesale-how-to-buy"].title,
        description: ROUTE_META["/insights/lab-grown-diamond-wholesale-how-to-buy"].description,
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
        title: ROUTE_META["/insights/largest-lab-grown-diamond-manufacturers-india"].title,
        description: ROUTE_META["/insights/largest-lab-grown-diamond-manufacturers-india"].description,
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
        title: ROUTE_META["/insights/12-questions-to-ask-a-manufacturer"].title,
        description: ROUTE_META["/insights/12-questions-to-ask-a-manufacturer"].description,
        canonical: url("/insights/12-questions-to-ask-a-manufacturer"),
        serviceJsonLd: mkArticle(origin, "/insights/12-questions-to-ask-a-manufacturer", "12 Questions to Ask a Lab-Grown Diamond Manufacturer Before You Order", "A due-diligence checklist for evaluating a laboratory-grown diamond manufacturer before placing an order."),
      };
    case "/insights/calibrated-diamond-layouts-explained":
      return {
        lang: "en",
        title: ROUTE_META["/insights/calibrated-diamond-layouts-explained"].title,
        description: ROUTE_META["/insights/calibrated-diamond-layouts-explained"].description,
        canonical: url("/insights/calibrated-diamond-layouts-explained"),
        serviceJsonLd: mkArticle(origin, "/insights/calibrated-diamond-layouts-explained", "Calibrated Diamond Layouts, Explained: Tolerances, Grading, and How to Order", "A practical explanation of calibrated diamond layouts covering tolerance, grading, and order brief requirements."),
      };
    case "/insights/cvd-vs-hpht-lab-grown-diamonds":
      return {
        lang: "en",
        title: ROUTE_META["/insights/cvd-vs-hpht-lab-grown-diamonds"].title,
        description: ROUTE_META["/insights/cvd-vs-hpht-lab-grown-diamonds"].description,
        canonical: url("/insights/cvd-vs-hpht-lab-grown-diamonds"),
        serviceJsonLd: mkArticle(origin, "/insights/cvd-vs-hpht-lab-grown-diamonds", "CVD vs HPHT Lab-Grown Diamonds: What Wholesale Buyers Need to Know", "A comparison of CVD and HPHT laboratory-grown diamond production methods for wholesale buyers."),
      };
    case "/insights/matched-pairs-vs-melee-vs-layouts":
      return {
        lang: "en",
        title: ROUTE_META["/insights/matched-pairs-vs-melee-vs-layouts"].title,
        description: ROUTE_META["/insights/matched-pairs-vs-melee-vs-layouts"].description,
        canonical: url("/insights/matched-pairs-vs-melee-vs-layouts"),
        serviceJsonLd: mkArticle(origin, "/insights/matched-pairs-vs-melee-vs-layouts", "Matched Pairs vs. Melee vs. Layouts: Which Format Does Your Design Need?", "A practical guide to choosing between matched pairs, melee lots, and calibrated layouts for wholesale diamond procurement."),
      };
    case "/insights/sourcing-lab-grown-diamonds-from-surat":
      return {
        lang: "en",
        title: ROUTE_META["/insights/sourcing-lab-grown-diamonds-from-surat"].title,
        description: ROUTE_META["/insights/sourcing-lab-grown-diamonds-from-surat"].description,
        canonical: url("/insights/sourcing-lab-grown-diamonds-from-surat"),
        serviceJsonLd: mkArticle(origin, "/insights/sourcing-lab-grown-diamonds-from-surat", "Lab-Grown Diamond Manufacturers in Surat: A Buyer's Guide to Sourcing Direct", "A practical guide to sourcing laboratory-grown diamonds direct from Surat manufacturers."),
      };
    case "/insights/12-questions-to-ask-before-your-first-lab-grown-order":
      return {
        lang: "en",
        title: ROUTE_META["/insights/12-questions-to-ask-before-your-first-lab-grown-order"].title,
        description: ROUTE_META["/insights/12-questions-to-ask-before-your-first-lab-grown-order"].description,
        canonical: url("/insights/12-questions-to-ask-before-your-first-lab-grown-order"),
        serviceJsonLd: mkArticle(origin, "/insights/12-questions-to-ask-before-your-first-lab-grown-order", "12 Questions to Ask Before Your First Lab-Grown Diamond Order", "A pre-order checklist for first-time B2B lab-grown diamond buyers covering payment terms, sample approval, shipping, dispute process and returns."),
      };
    case "/insights/how-to-spec-a-calibrated-parcel":
      return {
        lang: "en",
        title: ROUTE_META["/insights/how-to-spec-a-calibrated-parcel"].title,
        description: ROUTE_META["/insights/how-to-spec-a-calibrated-parcel"].description,
        canonical: url("/insights/how-to-spec-a-calibrated-parcel"),
        serviceJsonLd: mkArticle(origin, "/insights/how-to-spec-a-calibrated-parcel", "How to Spec a Calibrated Parcel: A Buyer's Checklist", "A seven-field specification checklist for ordering calibrated lab-grown diamond parcels from a manufacturer."),
      };
    case "/insights/igi-vs-gia-vs-sgl-lab-grown-diamonds":
      return {
        lang: "en",
        title: ROUTE_META["/insights/igi-vs-gia-vs-sgl-lab-grown-diamonds"].title,
        description: ROUTE_META["/insights/igi-vs-gia-vs-sgl-lab-grown-diamonds"].description,
        canonical: url("/insights/igi-vs-gia-vs-sgl-lab-grown-diamonds"),
        serviceJsonLd: mkArticle(origin, "/insights/igi-vs-gia-vs-sgl-lab-grown-diamonds", "IGI vs GIA vs SGL for Lab-Grown Diamonds: An Honest Comparison", "A factual comparison of IGI, GIA and SGL grading laboratories for lab-grown diamonds by scale, recognition and typical use case."),
      };
    case "/insights/import-duty-lc-terms-lab-grown-diamonds":
      return {
        lang: "en",
        title: ROUTE_META["/insights/import-duty-lc-terms-lab-grown-diamonds"].title,
        description: ROUTE_META["/insights/import-duty-lc-terms-lab-grown-diamonds"].description,
        canonical: url("/insights/import-duty-lc-terms-lab-grown-diamonds"),
        serviceJsonLd: mkArticle(origin, "/insights/import-duty-lc-terms-lab-grown-diamonds", "Import Duties and Payment Terms for Lab-Grown Diamonds, Explained", "A guide for first-time importers of loose lab-grown diamonds covering tariff treatment, Incoterms and payment structure by market."),
      };
    case "/insights/lab-grown-diamond-wholesale-price-trends-2026":
      return {
        lang: "en",
        title: ROUTE_META["/insights/lab-grown-diamond-wholesale-price-trends-2026"].title,
        description: ROUTE_META["/insights/lab-grown-diamond-wholesale-price-trends-2026"].description,
        canonical: url("/insights/lab-grown-diamond-wholesale-price-trends-2026"),
        serviceJsonLd: mkArticle(origin, "/insights/lab-grown-diamond-wholesale-price-trends-2026", "Lab-Grown Diamond Wholesale Price Trends Through 2026", "A dated factual overview of publicly reported lab-grown diamond wholesale price trends through 2026 by segment."),
      };
    case "/insights/melee-vs-solitaire-moq-realities":
      return {
        lang: "en",
        title: ROUTE_META["/insights/melee-vs-solitaire-moq-realities"].title,
        description: ROUTE_META["/insights/melee-vs-solitaire-moq-realities"].description,
        canonical: url("/insights/melee-vs-solitaire-moq-realities"),
        serviceJsonLd: mkArticle(origin, "/insights/melee-vs-solitaire-moq-realities", "Melee vs Solitaire MOQs: Why Bulk and Singles Behave Differently", "Why melee, solitaires and bespoke custom-cut lab-grown diamonds carry different minimum order quantities, and how to plan accordingly."),
      };
    case "/insights/reading-a-matched-layout-tolerance-sheet":
      return {
        lang: "en",
        title: ROUTE_META["/insights/reading-a-matched-layout-tolerance-sheet"].title,
        description: ROUTE_META["/insights/reading-a-matched-layout-tolerance-sheet"].description,
        canonical: url("/insights/reading-a-matched-layout-tolerance-sheet"),
        serviceJsonLd: mkArticle(origin, "/insights/reading-a-matched-layout-tolerance-sheet", "Reading a Matched-Layout Tolerance Sheet: What the Numbers Mean", "How to read a matched-layout tolerance sheet for lab-grown diamond layouts, including what each tolerance line controls and how approval images close the loop."),
      };
    case "/insights/sourcing-lab-grown-diamonds-us-retailer":
      return {
        lang: "en",
        title: ROUTE_META["/insights/sourcing-lab-grown-diamonds-us-retailer"].title,
        description: ROUTE_META["/insights/sourcing-lab-grown-diamonds-us-retailer"].description,
        canonical: url("/insights/sourcing-lab-grown-diamonds-us-retailer"),
        serviceJsonLd: mkArticle(origin, "/insights/sourcing-lab-grown-diamonds-us-retailer", "Sourcing Lab-Grown Diamonds from India: A US Retailer's Guide", "A first-import guide for US retailers sourcing lab-grown diamonds from India covering duty treatment, documentation, vetting and red flags."),
      };
    case "/singapore":
      return {
        lang: "en",
        title: ROUTE_META["/singapore"].title,
        description: ROUTE_META["/singapore"].description,
        canonical: url("/singapore"),
        serviceJsonLd: { "@context": "https://schema.org", "@type": "Service", name: "Lab-Grown Diamond Supply for Singapore", serviceType: "Lab-grown diamond wholesale supply", provider: { "@type": "Organization", name: "Alvora Diamonds", address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" } }, areaServed: "Singapore" },
      };
    case "/singapore/wholesale-lab-grown-diamonds":
      return {
        lang: "en",
        title: ROUTE_META["/singapore/wholesale-lab-grown-diamonds"].title,
        description: ROUTE_META["/singapore/wholesale-lab-grown-diamonds"].description,
        canonical: url("/singapore/wholesale-lab-grown-diamonds"),
        serviceJsonLd: { "@context": "https://schema.org", "@type": "Service", name: "Wholesale Lab-Grown Diamonds Singapore", serviceType: "Lab-grown diamond wholesale supply", provider: { "@type": "Organization", name: "Alvora Diamonds", address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" } }, areaServed: "Singapore" },
      };
    case "/singapore/lab-grown-diamond-wholesaler":
      return {
        lang: "en",
        title: ROUTE_META["/singapore/lab-grown-diamond-wholesaler"].title,
        description: ROUTE_META["/singapore/lab-grown-diamond-wholesaler"].description,
        canonical: url("/singapore/lab-grown-diamond-wholesaler"),
        serviceJsonLd: { "@context": "https://schema.org", "@type": "Service", name: "Lab-Grown Diamond Wholesaler for Singapore", serviceType: "Lab-grown diamond wholesale", provider: { "@type": "Organization", name: "Alvora Diamonds", address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" } }, areaServed: "Singapore" },
      };
    case "/singapore/for-jewellers":
      return {
        lang: "en",
        title: ROUTE_META["/singapore/for-jewellers"].title,
        description: ROUTE_META["/singapore/for-jewellers"].description,
        canonical: url("/singapore/for-jewellers"),
        serviceJsonLd: { "@context": "https://schema.org", "@type": "Service", name: "Lab-Grown Diamonds for Singapore Jewellers", serviceType: "Lab-grown diamond supply for jewellers", provider: { "@type": "Organization", name: "Alvora Diamonds", address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" } }, areaServed: "Singapore" },
      };
    case "/singapore/lab-grown-diamond-supplier":
      return {
        lang: "en",
        title: ROUTE_META["/singapore/lab-grown-diamond-supplier"].title,
        description: ROUTE_META["/singapore/lab-grown-diamond-supplier"].description,
        canonical: url("/singapore/lab-grown-diamond-supplier"),
        serviceJsonLd: { "@context": "https://schema.org", "@type": "Service", name: "Lab-Grown Diamond Supplier Singapore", serviceType: "Lab-grown diamond supply", provider: { "@type": "Organization", name: "Alvora Diamonds", address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" } }, areaServed: "Singapore" },
      };
    case "/singapore/calibrated-parcels":
      return {
        lang: "en",
        title: ROUTE_META["/singapore/calibrated-parcels"].title,
        description: ROUTE_META["/singapore/calibrated-parcels"].description,
        canonical: url("/singapore/calibrated-parcels"),
        serviceJsonLd: { "@context": "https://schema.org", "@type": "Service", name: "Calibrated Lab-Grown Diamond Parcels for Singapore", serviceType: "Calibrated diamond parcel supply", provider: { "@type": "Organization", name: "Alvora Diamonds", address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" } }, areaServed: "Singapore" },
      };
    case "/singapore/matched-pairs":
      return {
        lang: "en",
        title: ROUTE_META["/singapore/matched-pairs"].title,
        description: ROUTE_META["/singapore/matched-pairs"].description,
        canonical: url("/singapore/matched-pairs"),
        serviceJsonLd: { "@context": "https://schema.org", "@type": "Service", name: "Matched Lab-Grown Diamond Pairs for Singapore", serviceType: "Matched diamond pair supply", provider: { "@type": "Organization", name: "Alvora Diamonds", address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" } }, areaServed: "Singapore" },
      };
    case "/singapore/melee":
      return {
        lang: "en",
        title: ROUTE_META["/singapore/melee"].title,
        description: ROUTE_META["/singapore/melee"].description,
        canonical: url("/singapore/melee"),
        serviceJsonLd: { "@context": "https://schema.org", "@type": "Service", name: "Wholesale Melee Lab-Grown Diamonds for Singapore", serviceType: "Melee diamond wholesale supply", provider: { "@type": "Organization", name: "Alvora Diamonds", address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" } }, areaServed: "Singapore" },
      };
    case "/singapore/for-manufacturers":
      return {
        lang: "en",
        title: ROUTE_META["/singapore/for-manufacturers"].title,
        description: ROUTE_META["/singapore/for-manufacturers"].description,
        canonical: url("/singapore/for-manufacturers"),
        serviceJsonLd: { "@context": "https://schema.org", "@type": "Service", name: "Lab-Grown Diamonds for Singapore Jewellery Manufacturers", serviceType: "Production diamond supply", provider: { "@type": "Organization", name: "Alvora Diamonds", address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" } }, areaServed: "Singapore" },
      };
    case "/singapore/surat-to-singapore":
      return {
        lang: "en",
        title: ROUTE_META["/singapore/surat-to-singapore"].title,
        description: ROUTE_META["/singapore/surat-to-singapore"].description,
        canonical: url("/singapore/surat-to-singapore"),
        serviceJsonLd: { "@context": "https://schema.org", "@type": "Service", name: "Surat to Singapore Lab-Grown Diamond Supply", serviceType: "Direct international diamond supply", provider: { "@type": "Organization", name: "Alvora Diamonds", address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" } }, areaServed: "Singapore" },
      };
    case "/singapore/wholesale-parcels":
      return {
        lang: "en",
        title: ROUTE_META["/singapore/wholesale-parcels"].title,
        description: ROUTE_META["/singapore/wholesale-parcels"].description,
        canonical: url("/singapore/wholesale-parcels"),
        serviceJsonLd: { "@context": "https://schema.org", "@type": "Service", name: "Wholesale Lab-Grown Diamond Parcels for Singapore", serviceType: "Wholesale diamond parcel supply", provider: { "@type": "Organization", name: "Alvora Diamonds", address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" } }, areaServed: "Singapore" },
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
 * Auto-derives BreadcrumbList JSON-LD for hierarchical routes.
 * Returns null for the homepage or paths that have no crawlable parent.
 */
function autoBreadcrumbs(pathname: string, origin: string, pageTitle: string): object | null {
  if (pathname === "/" || !pathname.startsWith("/")) return null;

  const home = { name: "Alvora", path: "/" };
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return null;

  const titleCase = (slug: string) => slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  // Insights hierarchy: Home → Insights → Article
  if (segments[0] === "insights" && segments.length === 2) {
    return mkBreadcrumbs(origin, [
      home,
      { name: "Insights", path: "/insights" },
      { name: pageTitle.split(" | ")[0] || titleCase(segments[1]), path: pathname },
    ]);
  }
  if (segments[0] === "insights" && segments.length === 1) {
    return mkBreadcrumbs(origin, [home, { name: "Insights", path: "/insights" }]);
  }

  // Singapore hierarchy: Home → Singapore → Sub-page
  if (segments[0] === "singapore" && segments.length === 2) {
    return mkBreadcrumbs(origin, [
      home,
      { name: "Singapore", path: "/singapore" },
      { name: pageTitle.split(" | ")[0] || titleCase(segments[1]), path: pathname },
    ]);
  }
  if (segments[0] === "singapore" && segments.length === 1) {
    return mkBreadcrumbs(origin, [home, { name: "Singapore", path: "/singapore" }]);
  }

  // Locale landings and top-level pages: Home → Page
  if (segments.length === 1) {
    return mkBreadcrumbs(origin, [
      home,
      { name: pageTitle.split(" | ")[0] || titleCase(segments[0]), path: pathname },
    ]);
  }

  return null;
}

/**
 * Routes that support URL-driven pagination via ?page=N. When N > 1 the
 * canonical link and the title get a self-referencing suffix so page 2..N are
 * NOT canonicalised back to page 1.
 */
const PAGINATED_ROUTES = new Set(["/availability", "/fr/availability", "/it/availability"]);

/**
 * Extract a positive integer page number from a search string. Returns 1 for
 * missing/invalid values so callers can treat "page 1" and "no page param" the
 * same (both canonicalise to the un-paginated URL).
 */
function paginationFromSearch(search: string | null | undefined): number {
  if (!search) return 1;
  const raw = new URLSearchParams(search).get("page");
  if (!raw) return 1;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

/**
 * Injects SEO tags into the index.html shell for a given pathname.
 * Returns html unchanged for unrecognised paths (admin, api, etc.).
 *
 * `search` is the raw URL query string (with or without a leading `?`).
 * For paginated routes, `?page=N` (N > 1) shifts the canonical and the title
 * to reference that specific page.
 */
export function injectSeoIntoHtml(html: string, pathname: string, origin: string, search?: string | null): string {
  const meta = resolveRouteMeta(pathname, origin);
  if (!meta) return html;

  const page = PAGINATED_ROUTES.has(pathname) ? paginationFromSearch(search) : 1;
  const pageSuffix = page > 1 ? ` — Page ${page}` : "";
  const canonicalWithPage = page > 1 ? `${meta.canonical}?page=${page}` : meta.canonical;
  const titleWithPage = `${meta.title}${pageSuffix}`;

  const image = `${origin}${publicSocialImage}`;
  const robots = meta.robots ?? "index,follow,max-image-preview:large";
  const ogLocale = langToOgLocale(meta.lang);
  const ogLocaleAlternates = (meta.alternates ?? [])
    .map((a) => a.lang)
    .filter((l) => l !== "x-default")
    .map(langToOgLocale)
    .filter((v, i, arr) => arr.indexOf(v) === i && v !== ogLocale);

  const serviceJsonLdTags = meta.serviceJsonLd
    ? Array.isArray(meta.serviceJsonLd)
      ? meta.serviceJsonLd.map((ld) => `<script type="application/ld+json">${JSON.stringify(ld)}</script>`)
      : [`<script type="application/ld+json">${JSON.stringify(meta.serviceJsonLd)}</script>`]
    : [];

  const breadcrumbs = autoBreadcrumbs(pathname, origin, meta.title);
  const breadcrumbTag = breadcrumbs
    ? `<script type="application/ld+json">${JSON.stringify(breadcrumbs)}</script>`
    : null;

  const tags = [
    `<meta name="robots" content="${esc(robots)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:title" content="${esc(titleWithPage)}" />`,
    `<meta property="og:description" content="${esc(meta.description)}" />`,
    `<meta property="og:url" content="${esc(canonicalWithPage)}" />`,
    `<meta property="og:image" content="${esc(image)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:type" content="image/jpeg" />`,
    `<meta property="og:image:alt" content="${esc(publicSocialImageAlt)}" />`,
    `<meta property="og:site_name" content="Alvora" />`,
    `<meta property="og:locale" content="${ogLocale}" />`,
    ...ogLocaleAlternates.map((loc) => `<meta property="og:locale:alternate" content="${loc}" />`),
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(titleWithPage)}" />`,
    `<meta name="twitter:description" content="${esc(meta.description)}" />`,
    `<meta name="twitter:image" content="${esc(image)}" />`,
    `<meta name="twitter:image:alt" content="${esc(publicSocialImageAlt)}" />`,
    `<link rel="canonical" href="${esc(canonicalWithPage)}" />`,
    ...(meta.alternates ?? []).map(({ lang, href }) => `<link rel="alternate" hreflang="${esc(lang)}" href="${esc(href)}" />`),
    `<script type="application/ld+json">${JSON.stringify(buildOrgJsonLd(origin))}</script>`,
    ...(breadcrumbTag ? [breadcrumbTag] : []),
    ...serviceJsonLdTags,
  ].join("\n  ");

  return html
    .replace('lang="en"', `lang="${meta.lang}"`)
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(titleWithPage)}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
      `<meta name="description" content="${esc(meta.description)}" />`
    )
    .replace("</head>", `  ${tags}\n</head>`);
}
