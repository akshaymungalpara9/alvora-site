import { availabilitySeo, publicSeo, publicSocialImage } from "../client/src/lib/publicSeo";
import { COMPANY } from "../shared/companyInfo";

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
      return { ...publicSeo.global, title: "Lab-Grown Diamond Manufacturer & Wholesale Supplier | Alvora", description: "Alvora is a Surat-based lab-grown diamond manufacturer supplying wholesale CVD and HPHT diamonds, layouts and matched pairs to jewellers worldwide.", canonical: url("/"), alternates: publicHreflangAlternates(origin), serviceJsonLd: mkFaqPage([
        { q: "Is there a minimum order?", a: "The minimum order depends on the product, size, shape, certification, and whether the request is stock, a sample, a layout, or custom production. Category-specific minimums are confirmed in the quotation before approval. Buyers should include the expected quantity and repeat-order plan so the applicable minimum can be discussed clearly." },
        { q: "Are your stones IGI or GIA certified?", a: "Alvora can supply IGI-certified laboratory-grown diamonds where applicable, with report-linked identity and familiar 4Cs information. IGI is generally the practical wholesale baseline for comparison and inventory workflows. GIA can be requested when a retailer or destination channel requires its name; buyers should confirm the report format needed before ordering." },
        { q: "Can I request a sample or memo?", a: "A sample or memo request can be discussed before the first production order, subject to the goods and commercial terms. Availability, return conditions, shipping, insurance, and any charges should be confirmed in writing. Custom-cut or specially produced goods may require separate treatment from standard stock." },
        { q: "How fast do you respond to a quote request?", a: "Within 24 hours during business days. Same-day on WhatsApp during Surat hours (IST 09:00–19:00). A complete brief — shape, measurements, quality, quantity, certification, destination, and any CAD or reference file — helps Alvora respond with a useful quotation." },
        { q: "What are your lead times?", a: "Lead time depends on whether the requirement is available stock, a selected layout or pair, melee sorting, certification, or custom cutting. Actual days by product are stated in the quotation. The schedule distinguishes feasibility review, production, grading, buyer approval, packing, and dispatch." },
        { q: "Do you ship to the US, Canada, EU, or GCC?", a: "Alvora can discuss courier shipment to the US, Canada, EU, and GCC, with insurance and applicable IGI paperwork arranged according to the order. The buyer is responsible for destination-country duties, taxes, and import clearance. US 25% duty, Canada 0%, EU standard, GCC standard — confirm current rates with the relevant customs authority before shipment." },
        { q: "How do I place my first order?", a: "Start with WhatsApp or an RFQ containing the design and stone specification. Alvora reviews the requirement and sends a quote, then the buyer can discuss a memo or sample where available before issuing a PO. After approval: production, documentation and QC, buyer confirmation where applicable, packing, and dispatch." },
      ]) };
    case "/fr":
      return { ...publicSeo.fr, title: "Lab-Grown Diamond Manufacturer for France | Alvora Diamonds", description: "French jewellery brands and wholesalers: source lab-grown diamonds direct from Alvora, a Surat manufacturer shipping calibrated stones to France.", canonical: url("/fr"), alternates: publicHreflangAlternates(origin) };
    case "/it":
      return { ...publicSeo.it, title: "Lab-Grown Diamond Manufacturer for Italy | Alvora Diamonds", description: "Italian jewellery manufacturers: source lab-grown diamonds wholesale from Alvora, a Surat manufacturer supplying layouts, matched pairs and melee.", canonical: url("/it"), alternates: publicHreflangAlternates(origin) };
    case "/us":
      return { ...publicSeo.us, title: "Lab-Grown Diamond Manufacturer for the US | Alvora", description: "US jewelry brands and wholesalers: source lab-grown diamonds direct from Alvora, a Surat manufacturer shipping CVD and HPHT stones to America.", canonical: url("/us"), alternates: publicHreflangAlternates(origin) };
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
        title: "Lab-Grown Diamond Insights & Sourcing Guides | Alvora",
        description: "Guides for wholesale buyers: growth methods, price per carat, certification, sourcing from Surat and how to evaluate a diamond manufacturer.",
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
        title: "Privacy Policy — Alvora Lab-Grown Diamonds in Surat",
        description: "How Alvora collects, uses and protects personal information submitted through this website, and the choices available to visitors and wholesale customers.",
        canonical: url("/privacy"),
        robots: "noindex,follow",
      };
    case "/terms":
      return {
        lang: "en",
        title: "Terms & Conditions — Alvora Lab-Grown Diamonds, Surat",
        description: "The terms governing use of Alvora's website and wholesale enquiries, including intellectual property, liability and governing law information.",
        canonical: url("/terms"),
        robots: "noindex,follow",
      };
    case "/calibrated-diamond-layouts":
      return {
        lang: "en",
        title: "Calibrated Lab-Grown Diamond Layouts Wholesale | Alvora",
        description: "Calibrated diamond layouts in consistent millimetre sizes for eternity rings and bands. Wholesale lab-grown layouts manufactured in Surat by Alvora.",
        canonical: url("/calibrated-diamond-layouts"),
        serviceJsonLd: { "@context": "https://schema.org", "@type": "Service", name: "Calibrated Lab-Grown Diamond Layouts", serviceType: "Calibrated laboratory-grown diamond layouts", provider: { "@type": "Organization", name: "Alvora Diamonds", address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" } }, areaServed: "Worldwide" },
      };
    case "/matched-lab-grown-diamond-pairs":
      return {
        lang: "en",
        title: "Matched Lab-Grown Diamond Pairs Wholesale | Alvora",
        description: "Wholesale matched pairs of lab-grown diamonds for earrings and two-stone jewellery. Symmetrical cuts, consistent grading, manufactured in Surat by Alvora.",
        canonical: url("/matched-lab-grown-diamond-pairs"),
        serviceJsonLd: { "@context": "https://schema.org", "@type": "Service", name: "Matched Lab-Grown Diamond Pairs", serviceType: "Matched laboratory-grown diamond pairs", provider: { "@type": "Organization", name: "Alvora Diamonds", address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" } }, areaServed: "Worldwide" },
      };
    case "/custom-cut-lab-grown-diamonds":
      return {
        lang: "en",
        title: "Custom Cut Lab-Grown Diamonds to Specification | Alvora",
        description: "Send your drawings or reference stones: Alvora cuts lab-grown diamonds to exact specifications in Surat for ateliers, brands and private-label programmes.",
        canonical: url("/custom-cut-lab-grown-diamonds"),
        serviceJsonLd: { "@context": "https://schema.org", "@type": "Service", name: "Custom-Cut Lab-Grown Diamonds to Specification", serviceType: "Custom-cut laboratory-grown diamonds", provider: { "@type": "Organization", name: "Alvora Diamonds", address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" } }, areaServed: "Worldwide" },
      };
    case "/igi-certified-lab-grown-diamonds":
      return {
        lang: "en",
        title: "IGI Certified Lab-Grown Diamonds Wholesale | Alvora",
        description: "IGI-certified lab-grown diamonds in every shape and size, available wholesale direct from Alvora's Surat facility with full grading reports.",
        canonical: url("/igi-certified-lab-grown-diamonds"),
        serviceJsonLd: { "@context": "https://schema.org", "@type": "Product", name: "IGI-Certified Lab-Grown Diamonds", description: "Laboratory-grown diamonds supplied with IGI documentation where applicable.", brand: { "@type": "Brand", name: "Alvora Diamonds" }, manufacturer: { "@type": "Organization", name: "Alvora Diamonds", address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" } } },
      };
    case "/cvd-lab-grown-diamonds":
      return {
        lang: "en",
        title: "Wholesale CVD Lab-Grown Diamonds Manufacturer | Alvora",
        description: "CVD-grown lab diamonds cut and polished in Surat. Wholesale CVD diamonds in calibrated sizes, matched pairs and layouts from manufacturer Alvora.",
        canonical: url("/cvd-lab-grown-diamonds"),
        serviceJsonLd: { "@context": "https://schema.org", "@type": "Product", name: "CVD Lab-Grown Diamonds", description: "CVD laboratory-grown diamonds supplied with transparent method and treatment information.", brand: { "@type": "Brand", name: "Alvora Diamonds" }, material: "Laboratory-grown diamond" },
      };
    case "/hpht-lab-grown-diamonds":
      return {
        lang: "en",
        title: "Wholesale HPHT Lab-Grown Diamonds Manufacturer | Alvora",
        description: "HPHT-grown lab diamonds with consistent colour and clarity. Wholesale HPHT diamonds from Alvora, a Surat manufacturer supplying jewellers worldwide.",
        canonical: url("/hpht-lab-grown-diamonds"),
        serviceJsonLd: { "@context": "https://schema.org", "@type": "AboutPage", name: "HPHT Lab-Grown Diamonds for Wholesale", description: "Information about HPHT laboratory-grown diamonds and specification-led sourcing.", about: { "@type": "Product", name: "HPHT laboratory-grown diamonds", material: "Laboratory-grown diamond" }, publisher: { "@type": "Organization", name: "Alvora Diamonds" } },
      };
    case "/fancy-shape-colour-lab-grown-diamonds":
      return {
        lang: "en",
        title: "Fancy Shape & Colour Lab-Grown Diamonds Wholesale | Alvora",
        description: "Wholesale fancy shapes — oval, pear, emerald, marquise — and fancy colour lab diamonds for distinctive jewellery lines, made by Alvora in Surat.",
        canonical: url("/fancy-shape-colour-lab-grown-diamonds"),
        serviceJsonLd: { "@context": "https://schema.org", "@type": "Service", name: "Fancy-Shape and Fancy-Colour Lab-Grown Diamonds", serviceType: "Fancy-shape and fancy-colour laboratory-grown diamond sourcing", provider: { "@type": "Organization", name: "Alvora Diamonds", address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" } }, areaServed: "Worldwide" },
      };
    case "/precision-lab-grown-diamond-wholesale":
      return {
        lang: "en",
        title: "Precision Cut Lab-Grown Diamonds Wholesale | Alvora",
        description: "Precision-cut lab-grown diamonds with tight tolerances for fine jewellery. Wholesale supply from Alvora's Surat facility for brands and wholesalers.",
        canonical: url("/precision-lab-grown-diamond-wholesale"),
        serviceJsonLd: { "@context": "https://schema.org", "@type": "ContactPage", name: "Precision Lab-Grown Diamond Wholesale Supply", description: "Contact Alvora Diamonds about specification-led laboratory-grown diamond wholesale supply.", about: { "@type": "Service", name: "Precision lab-grown diamond wholesale supply" }, publisher: { "@type": "Organization", name: "Alvora Diamonds", address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" } } },
      };
    case "/matched-pair-diamonds":
      return {
        lang: "en",
        title: "Matched Pair Lab-Grown Diamonds Wholesale | Alvora",
        description: "Precision-matched lab-grown diamond pairs for earrings and two-stone settings. Wholesale matched pairs cut and calibrated by Alvora in Surat.",
        canonical: url("/matched-pair-diamonds"),
        serviceJsonLd: { "@context": "https://schema.org", "@type": "Service", name: "Matched Pair Lab-Grown Diamonds", serviceType: "Diamond Manufacturing", provider: { "@type": "Organization", name: "Alvora", address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" } }, description: "Matched pair lab-grown diamonds matched for colour, dimensions, cut grade, and proportions.", areaServed: "Worldwide" },
      };
    case "/custom-cut-diamonds":
      return {
        lang: "en",
        title: "Custom-Cut Lab-Grown Diamonds for Jewellers | Alvora",
        description: "Bespoke diamond cutting to your drawings and specs. Alvora manufactures custom-cut lab-grown diamonds in Surat for private-label jewellery lines.",
        canonical: url("/custom-cut-diamonds"),
        serviceJsonLd: { "@context": "https://schema.org", "@type": "Service", name: "Custom-Cut Lab-Grown Diamonds", serviceType: "Diamond Manufacturing", provider: { "@type": "Organization", name: "Alvora", address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" } }, description: "Custom-cut lab-grown diamonds made to exact buyer specification — shape, diameter, depth, table, and finish.", areaServed: "Worldwide" },
      };
    case "/melee-diamonds":
      return {
        lang: "en",
        title: "Wholesale Melee Lab-Grown Diamonds Manufacturer | Alvora",
        description: "1mm–4mm melee lab-grown diamonds in calibrated sizes for pavé and halo settings. Consistent colour and clarity, wholesale from Alvora in Surat.",
        canonical: url("/melee-diamonds"),
        serviceJsonLd: { "@context": "https://schema.org", "@type": "Service", name: "Wholesale Lab-Grown Melee Diamonds", serviceType: "Diamond Manufacturing", provider: { "@type": "Organization", name: "Alvora", address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" } }, description: "Wholesale lab-grown melee diamonds calibrated to consistent diameter ranges, Excellent cut, no fluorescence.", areaServed: "Worldwide" },
      };
    case "/certifications":
      return {
        lang: "en",
        title: "Lab-Grown Diamond Certifications Explained | Alvora",
        description: "How IGI and other laboratory certifications work for lab-grown diamonds, what each report covers and what wholesale buyers should verify before ordering.",
        canonical: url("/certifications"),
        serviceJsonLd: { "@context": "https://schema.org", "@type": "Service", name: "IGI-Certified Lab-Grown Diamonds", serviceType: "Diamond Manufacturing and Certification", provider: { "@type": "Organization", name: "Alvora", address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" } }, description: "Every Alvora lab-grown diamond is IGI laser-inscribed and verified against the IGI database before dispatch.", areaServed: "Worldwide" },
      };
    case "/about":
      return {
        lang: "en",
        title: "About Alvora — Surat Lab-Grown Diamond Manufacturer",
        description: "Alvora grows, cuts and polishes lab-grown diamonds in Surat, India, supplying wholesale melee, matched pairs, layouts and custom cuts worldwide.",
        canonical: url("/about"),
        serviceJsonLd: { "@context": "https://schema.org", "@type": "Organization", name: "Alvora", description: "Alvora is a Surat-based lab-grown diamond manufacturer specialising in precision cutting, calibration, and IGI certification.", address: { "@type": "PostalAddress", addressLocality: "Surat", addressRegion: "Gujarat", addressCountry: "IN" } },
      };
    case "/for-jewelry-brands":
      return {
        lang: "en",
        title: "Lab-Grown Diamond Partner for Jewelry Brands | Alvora",
        description: "Private-label lab-grown diamond supply for jewellery brands: consistent grading, reliable lead times and wholesale pricing from Alvora in Surat.",
        canonical: url("/for-jewelry-brands"),
        serviceJsonLd: { "@context": "https://schema.org", "@type": "Service", name: "Lab-Grown Diamonds for Jewellery Brands", serviceType: "Diamond Manufacturing", provider: { "@type": "Organization", name: "Alvora", address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" } }, description: "Certified, calibrated lab-grown diamonds for manufacturing jewellers, DTC brands, and private-label operations.", areaServed: "Worldwide" },
      };
    case "/request-a-quote":
      return {
        lang: "en",
        title: "Request a Wholesale Lab-Grown Diamond Quote | Alvora",
        description: "Tell Alvora your shapes, sizes, carat weights and quantities. Get a wholesale quote from a Surat lab-grown diamond manufacturer within one business day.",
        canonical: url("/request-a-quote"),
        serviceJsonLd: { "@context": "https://schema.org", "@type": "Service", name: "Request a Quote — Alvora Lab-Grown Diamonds", serviceType: "Diamond Manufacturing", provider: { "@type": "Organization", name: "Alvora", address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" } }, description: "Submit a production enquiry to Alvora for certified, calibrated lab-grown diamonds.", areaServed: "Worldwide" },
      };
    case "/contact":
      return {
        lang: "en",
        title: "Contact Alvora Diamonds — Surat, India",
        description: "Contact the Alvora Diamonds team in Surat for lab-grown diamond wholesale enquiries, pricing, and specification briefs.",
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
        title: "Are Lab-Grown Diamonds Real Diamonds? | Alvora Insights",
        description: "Yes — lab-grown diamonds are chemically, physically and optically identical to mined diamonds. Learn how they grow and why it matters for buyers.",
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
        title: "How to Choose a Lab-Grown Diamond Manufacturer | Alvora",
        description: "What jewellery brands and wholesalers should check — growth method, cut quality, certification, capacity and communication — before committing.",
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
        title: "Is a Lab-Grown Diamond Worth It? | Alvora Insights",
        description: "An honest look at lab-grown diamond value for jewellery businesses: price per carat, resale considerations and what wholesale buyers should weigh.",
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
        title: "Lab-Grown Diamond Price Per Carat: A Guide | Alvora",
        description: "What drives lab-grown diamond prices per carat — size, colour, clarity, cut and growth method — plus how wholesale buyers should compare supplier quotes.",
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
        title: "Buying Lab-Grown Diamonds Wholesale: A Guide | Alvora",
        description: "A practical guide to buying lab-grown diamonds wholesale: minimum orders, grading consistency, paperwork and vetting manufacturers before you buy.",
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
        title: "India's Lab-Grown Diamond Manufacturing Hub | Alvora",
        description: "Surat and India's lab-grown diamond manufacturing landscape: who the major producers are, how they differ and how to choose a wholesale supplier.",
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
        title: "12 Questions to Ask a Diamond Manufacturer | Alvora",
        description: "Twelve due-diligence questions for brands sourcing wholesale lab-grown diamonds — covering certification, consistency, capacity and terms.",
        canonical: url("/insights/12-questions-to-ask-a-manufacturer"),
        serviceJsonLd: mkArticle(origin, "/insights/12-questions-to-ask-a-manufacturer", "12 Questions to Ask a Lab-Grown Diamond Manufacturer Before You Order", "A due-diligence checklist for evaluating a laboratory-grown diamond manufacturer before placing an order."),
      };
    case "/insights/calibrated-diamond-layouts-explained":
      return {
        lang: "en",
        title: "Calibrated Diamond Layouts Explained | Alvora Insights",
        description: "What calibrated diamond layouts are, how millimetre tolerances work and why jewellers use them for eternity bands — a wholesale buyer's guide.",
        canonical: url("/insights/calibrated-diamond-layouts-explained"),
        serviceJsonLd: mkArticle(origin, "/insights/calibrated-diamond-layouts-explained", "Calibrated Diamond Layouts, Explained: Tolerances, Grading, and How to Order", "A practical explanation of calibrated diamond layouts covering tolerance, grading, and order brief requirements."),
      };
    case "/insights/cvd-vs-hpht-lab-grown-diamonds":
      return {
        lang: "en",
        title: "CVD vs HPHT Lab-Grown Diamonds: Key Differences | Alvora",
        description: "CVD and HPHT are the two methods for growing diamonds. Compare growth process, grading traits and cost to decide which suits your wholesale programme.",
        canonical: url("/insights/cvd-vs-hpht-lab-grown-diamonds"),
        serviceJsonLd: mkArticle(origin, "/insights/cvd-vs-hpht-lab-grown-diamonds", "CVD vs HPHT Lab-Grown Diamonds: What Wholesale Buyers Need to Know", "A comparison of CVD and HPHT laboratory-grown diamond production methods for wholesale buyers."),
      };
    case "/insights/matched-pairs-vs-melee-vs-layouts":
      return {
        lang: "en",
        title: "Matched Pairs vs Melee vs Layouts | Alvora Insights",
        description: "Three wholesale diamond categories compared: matched pairs for earrings, melee for pavé and calibrated layouts for bands — which format fits your designs.",
        canonical: url("/insights/matched-pairs-vs-melee-vs-layouts"),
        serviceJsonLd: mkArticle(origin, "/insights/matched-pairs-vs-melee-vs-layouts", "Matched Pairs vs. Melee vs. Layouts: Which Format Does Your Design Need?", "A practical guide to choosing between matched pairs, melee lots, and calibrated layouts for wholesale diamond procurement."),
      };
    case "/insights/sourcing-lab-grown-diamonds-from-surat":
      return {
        lang: "en",
        title: "Sourcing Lab-Grown Diamonds From Surat | Alvora Insights",
        description: "Why Surat, India is a global centre for lab-grown diamond cutting and how international wholesalers can vet manufacturers and import with confidence.",
        canonical: url("/insights/sourcing-lab-grown-diamonds-from-surat"),
        serviceJsonLd: mkArticle(origin, "/insights/sourcing-lab-grown-diamonds-from-surat", "Lab-Grown Diamond Manufacturers in Surat: A Buyer's Guide to Sourcing Direct", "A practical guide to sourcing laboratory-grown diamonds direct from Surat manufacturers."),
      };
    case "/insights/12-questions-to-ask-before-your-first-lab-grown-order":
      return {
        lang: "en",
        title: "12 Questions to Ask Before Your First Lab-Grown Diamond Order | Alvora",
        description: "A pre-order checklist for first-time B2B buyers of lab-grown diamonds: payment terms, sample approval, shipping insurance, dispute process and the questions most often skipped.",
        canonical: url("/insights/12-questions-to-ask-before-your-first-lab-grown-order"),
        serviceJsonLd: mkArticle(origin, "/insights/12-questions-to-ask-before-your-first-lab-grown-order", "12 Questions to Ask Before Your First Lab-Grown Diamond Order", "A pre-order checklist for first-time B2B lab-grown diamond buyers covering payment terms, sample approval, shipping, dispute process and returns."),
      };
    case "/insights/how-to-spec-a-calibrated-parcel":
      return {
        lang: "en",
        title: "How to Spec a Calibrated Parcel: A Buyer's Checklist | Alvora",
        description: "What jewellery manufacturers must specify before requesting a calibrated lab-grown diamond quote — shape, size range, tolerance, colour band, clarity band, quantity and delivery format.",
        canonical: url("/insights/how-to-spec-a-calibrated-parcel"),
        serviceJsonLd: mkArticle(origin, "/insights/how-to-spec-a-calibrated-parcel", "How to Spec a Calibrated Parcel: A Buyer's Checklist", "A seven-field specification checklist for ordering calibrated lab-grown diamond parcels from a manufacturer."),
      };
    case "/insights/igi-vs-gia-vs-sgl-lab-grown-diamonds":
      return {
        lang: "en",
        title: "IGI vs GIA vs SGL for Lab-Grown Diamonds: An Honest Comparison | Alvora",
        description: "An honest, factual comparison of IGI, GIA and SGL certification for lab-grown diamonds — what each grades, where buyers encounter each, and how to choose.",
        canonical: url("/insights/igi-vs-gia-vs-sgl-lab-grown-diamonds"),
        serviceJsonLd: mkArticle(origin, "/insights/igi-vs-gia-vs-sgl-lab-grown-diamonds", "IGI vs GIA vs SGL for Lab-Grown Diamonds: An Honest Comparison", "A factual comparison of IGI, GIA and SGL grading laboratories for lab-grown diamonds by scale, recognition and typical use case."),
      };
    case "/insights/import-duty-lc-terms-lab-grown-diamonds":
      return {
        lang: "en",
        title: "Import Duties and Payment Terms for Lab-Grown Diamonds, Explained | Alvora",
        description: "What first-time importers of loose lab-grown diamonds should ask about duties, tariffs, letters of credit, advance payment and memo terms — by market, in plain language.",
        canonical: url("/insights/import-duty-lc-terms-lab-grown-diamonds"),
        serviceJsonLd: mkArticle(origin, "/insights/import-duty-lc-terms-lab-grown-diamonds", "Import Duties and Payment Terms for Lab-Grown Diamonds, Explained", "A guide for first-time importers of loose lab-grown diamonds covering tariff treatment, Incoterms and payment structure by market."),
      };
    case "/insights/lab-grown-diamond-wholesale-price-trends-2026":
      return {
        lang: "en",
        title: "Lab-Grown Diamond Wholesale Price Trends Through 2026 | Alvora",
        description: "A dated, factual overview of publicly reported lab-grown diamond wholesale price trends through 2026 — what fell, what stabilised, and what buyers should take from it.",
        canonical: url("/insights/lab-grown-diamond-wholesale-price-trends-2026"),
        serviceJsonLd: mkArticle(origin, "/insights/lab-grown-diamond-wholesale-price-trends-2026", "Lab-Grown Diamond Wholesale Price Trends Through 2026", "A dated factual overview of publicly reported lab-grown diamond wholesale price trends through 2026 by segment."),
      };
    case "/insights/melee-vs-solitaire-moq-realities":
      return {
        lang: "en",
        title: "Melee vs Solitaire MOQs: Why Bulk and Singles Behave Differently | Alvora",
        description: "Why melee parcels, single solitaires and bespoke custom-cut lab-grown diamonds carry different minimum order quantities — and how to plan your first order accordingly.",
        canonical: url("/insights/melee-vs-solitaire-moq-realities"),
        serviceJsonLd: mkArticle(origin, "/insights/melee-vs-solitaire-moq-realities", "Melee vs Solitaire MOQs: Why Bulk and Singles Behave Differently", "Why melee, solitaires and bespoke custom-cut lab-grown diamonds carry different minimum order quantities, and how to plan accordingly."),
      };
    case "/insights/reading-a-matched-layout-tolerance-sheet":
      return {
        lang: "en",
        title: "Reading a Matched-Layout Tolerance Sheet: What the Numbers Mean | Alvora",
        description: "How to read and specify a matched-layout tolerance sheet for lab-grown diamond layouts: what 'matched within X' constrains, common ordering mistakes, and approval images.",
        canonical: url("/insights/reading-a-matched-layout-tolerance-sheet"),
        serviceJsonLd: mkArticle(origin, "/insights/reading-a-matched-layout-tolerance-sheet", "Reading a Matched-Layout Tolerance Sheet: What the Numbers Mean", "How to read a matched-layout tolerance sheet for lab-grown diamond layouts, including what each tolerance line controls and how approval images close the loop."),
      };
    case "/insights/sourcing-lab-grown-diamonds-us-retailer":
      return {
        lang: "en",
        title: "Sourcing Lab-Grown Diamonds from India: A US Retailer's Guide | Alvora",
        description: "A first-time guide for US retailers importing lab-grown diamonds from India: import basics, documentation, communication expectations, supplier vetting and red flags.",
        canonical: url("/insights/sourcing-lab-grown-diamonds-us-retailer"),
        serviceJsonLd: mkArticle(origin, "/insights/sourcing-lab-grown-diamonds-us-retailer", "Sourcing Lab-Grown Diamonds from India: A US Retailer's Guide", "A first-import guide for US retailers sourcing lab-grown diamonds from India covering duty treatment, documentation, vetting and red flags."),
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
