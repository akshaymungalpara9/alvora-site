import SpecialtyPageShell from "@/components/SpecialtyPageShell";
import SpecialtyPageMeta from "@/components/SpecialtyPageMeta";
import {
  SgTrustPanel,
  SgLandedCostBlock,
  SgPaymentTermsBlock,
  SgFaqBlock,
  SgContactBlock,
  SgProductPanel,
  SgSiblingNav,
} from "@/components/SingaporeBlocks";

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Wholesale Diamond Parcels Singapore",
  serviceType: "Wholesale Lab-Grown Diamond Parcel Supply",
  provider: {
    "@type": "Organization",
    name: "Alvora",
    address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" },
  },
  description:
    "Alvora supplies wholesale diamond parcels to Singapore buyers across shapes, sizes, and colour and clarity bands. Matched-parcel option. Per-carat pricing on enquiry.",
  areaServed: "SG",
};

const PAGE_FAQS = [
  {
    question: "What shapes are available in wholesale parcels?",
    answer:
      "Wholesale parcels are available in all major shapes: round brilliant, oval, princess, cushion, emerald cut, pear, radiant, marquise, and heart. Mixed-shape parcels are available for buyers who need breadth across a single delivery. Send required shapes and sizes and we will advise on parcel construction and per-carat pricing.",
  },
  {
    question: "Can colour and clarity be held within a band across a parcel?",
    answer:
      "Yes. Colour bands (D–F, G–H, I–J) and clarity bands (IF through VS and SI1 through SI2 with no eye-visible inclusions confirmed per stone) can be held consistently across a parcel. Mixed bands are available if required; describe your requirement and we will advise on construction.",
  },
  {
    question: "Is there a fixed minimum quantity?",
    answer:
      "Alvora works with three indicative parcel bands: trial under 15 ct for account qualification, mid 15–50 ct for established accounts, and bulk above 50 ct for distribution and manufacturing programmes. We do not publish a fixed minimum quantity. Send your required shapes, sizes, and approximate weight and we will advise on the practicable parcel size and per-carat pricing.",
  },
  {
    question: "Is a matched-parcel option available?",
    answer:
      "Yes. Within a wholesale parcel, colour and clarity can be matched within a defined band so that all stones in the lot are consistent. This is the standing filter applied to calibrated melee and matched-pair programmes. For wholesale parcels where matching matters (for example, a tennis bracelet lot or a mixed-shape display set), specify the matching requirement when sending your brief.",
  },
];

export default function SgWholesaleParcels() {
  return (
    <SpecialtyPageShell>
      <SpecialtyPageMeta
        title="Wholesale Diamond Parcels Singapore | Alvora"
        description="Wholesale diamond parcels for Singapore: shape and size breadth, colour and clarity bands, matched option, and per-carat pricing on enquiry."
        path="/singapore/wholesale-parcels"
        jsonLd={JSON_LD}
      />

      <section className="specialty-hero" aria-labelledby="sg-wp-h1">
        <p className="eyebrow eyebrow-bright"><span />WHOLESALE PARCEL SUPPLY · SINGAPORE</p>
        <h1 id="sg-wp-h1">
          Wholesale diamond parcels for Singapore: shape and size breadth, colour and clarity bands,
          and matched-parcel option.
        </h1>
        <p className="specialty-hero-copy">
          Alvora manufactures lab-grown diamonds at its Surat benches and supplies Singapore wholesale
          accounts with parcels built to specification across all major shapes, from 0.10 ct melee
          through to 5 ct and above, in standard colour and clarity bands. Parcels can be supplied
          as a single shape or as a mixed-shape lot. A matched-parcel option holds colour and clarity
          within a defined band across the whole parcel. Per-carat pricing is quoted on a per-enquiry
          basis. No fixed published price list.
        </p>
      </section>

      <section className="specialty-section specialty-section-light" aria-labelledby="sg-wp-construction">
        <div className="specialty-section-lead">
          <p className="eyebrow"><span />PARCEL CONSTRUCTION</p>
          <h2 id="sg-wp-construction">
            Wholesale diamond parcels for Singapore: built to shape, colour, and clarity specification.
          </h2>
          <p>
            Send the required shapes, sizes, colour band, clarity band, and approximate weight.
            We return a per-carat price and parcel composition. No published price list; every
            parcel is priced to specification.
          </p>
        </div>
        <div className="specialty-feature-list on-light" style={{ marginTop: 40 }}>
          {([
            [
              "Shape breadth: round to fancy",
              "Round brilliant, oval, princess, cushion, emerald cut, pear, radiant, marquise, and heart. Single-shape parcels and mixed-shape lots are both available. Specify required shapes and proportions when sending your brief.",
            ],
            [
              "Size range: 0.10 ct to 5 ct and above",
              "Melee from 0.10 ct through to larger stones above 5 ct. Size can be specified as a carat weight range or as a girdle diameter for calibrated production. Weight-matched lots are available for consistency within a parcel.",
            ],
            [
              "Colour and clarity bands",
              "Standard colour bands D–F, G–H, and I–J. Standard clarity bands IF–VS and SI1–SI2 with no eye-visible inclusions confirmed per stone. Tighter bands within the standard range are available on specification.",
            ],
            [
              "Matched-parcel option",
              "For parcels where consistency matters (a tennis bracelet lot, a display set, or a bulk programme requiring grade uniformity), the matched-parcel option holds colour and clarity within the stated band across all stones in the lot.",
            ],
          ] as [string, string][]).map(([k, v]) => (
            <article key={k}>
              <span className="feat-mark">—</span>
              <div>
                <h3>{k}</h3>
                <p>{v}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="specialty-section specialty-section-ink" aria-labelledby="sg-wp-programmes">
        <div className="specialty-section-lead">
          <p className="eyebrow"><span />SUPPLY PROGRAMMES</p>
          <h2
            id="sg-wp-programmes"
            style={{ fontSize: "clamp(1.6rem, 2.4vw, 2.6rem)", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 20 }}
          >
            Programmes for Singapore wholesale parcel buyers.
          </h2>
          <p>
            All programmes ship insured from Surat with IGI or GIA certification and a declared
            per-stone invoice ready for Singapore Customs permit and GST declaration.
          </p>
        </div>
        <div style={{ marginTop: 40 }}>
          <SgProductPanel programme="all" pageSlug="wholesale-parcels" />
        </div>
      </section>

      <section className="specialty-section specialty-section-light" aria-label="Supply credentials">
        <SgTrustPanel />
      </section>

      <section className="specialty-section specialty-section-ink" aria-label="Singapore landed cost">
        <SgLandedCostBlock />
      </section>

      <section className="specialty-section specialty-section-light" aria-label="Payment terms">
        <SgPaymentTermsBlock />
      </section>

      <section className="specialty-section specialty-section-ink" aria-label="Frequently asked questions">
        <SgFaqBlock items={PAGE_FAQS} />
      </section>

      <section className="specialty-section specialty-section-light" aria-label="Related pages">
        <SgSiblingNav
          siblings={[
            { label: "Wholesale lab-grown diamonds", href: "/singapore/wholesale-lab-grown-diamonds" },
            { label: "Lab-grown diamond wholesaler", href: "/singapore/lab-grown-diamond-wholesaler" },
          ]}
        />
      </section>

      <section className="specialty-section" aria-label="Send shapes and sizes">
        <SgContactBlock submitLabel="Send Required Shapes and Sizes" />
      </section>
    </SpecialtyPageShell>
  );
}
