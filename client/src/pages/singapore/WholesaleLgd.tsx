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
  name: "Wholesale Lab-Grown Diamonds Singapore",
  serviceType: "Wholesale Lab-Grown Diamond Parcel Supply",
  provider: {
    "@type": "Organization",
    name: "Alvora",
    address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" },
  },
  description:
    "Alvora supplies wholesale lab-grown diamonds to Singapore buyers in trial, mid, and bulk parcel bands. IGI or GIA certified, direct from Surat, quoted in USD/ct and SGD/ct.",
  areaServed: "SG",
};

const PAGE_FAQS = [
  {
    question: "What do the trial, mid, and bulk parcel bands mean?",
    answer:
      "Trial parcels are under 15 ct and are designed for account qualification — a buyer inspects the stones, verifies the certificates, and confirms the specification before committing to a regular programme. Mid parcels of 15–50 ct suit established replenishment accounts. Bulk parcels above 50 ct are for manufacturing programmes and distribution accounts. Send your specification and we will quote the applicable band.",
  },
  {
    question: "Are parcels quoted in Singapore dollars?",
    answer:
      "Alvora quotes each parcel in both USD/ct and SGD/ct. USD is the trade-standard denomination for Surat-origin loose diamonds; we provide an SGD equivalent at the mid-market rate on quote day so Singapore buyers can budget in local currency. The final transaction currency is agreed when the order is confirmed.",
  },
  {
    question: "What certification is included with wholesale parcels?",
    answer:
      "IGI certification is standard. Every stone ships laser-inscribed with the report number searchable on the IGI verification platform by any buyer in any market in real time. GIA certification is available as an alternative — request it when sending your specifications.",
  },
  {
    question: "Does Singapore charge import duty on lab-grown diamonds?",
    answer:
      "Loose diamonds are not a dutiable category under Singapore Customs, so the applicable rate is 0% customs duty plus 9% import GST calculated on CIF value. A GST-registered Singapore buyer can typically claim the import GST as input tax, reducing the effective landed cost to the stone price plus logistics and clearance fees in most circumstances. Confirm your GST registration and HS classification with a Singapore customs broker before the first shipment.",
  },
];

export default function SgWholesaleLgd() {
  return (
    <SpecialtyPageShell>
      <SpecialtyPageMeta
        title="Wholesale Lab-Grown Diamonds Singapore | Alvora"
        description="Wholesale lab-grown diamonds for Singapore in trial, mid, and bulk parcel bands. Surat manufacture, IGI or GIA certified, quoted in USD/ct and SGD/ct."
        path="/singapore/wholesale-lab-grown-diamonds"
        jsonLd={JSON_LD}
      />

      <section className="specialty-hero" aria-labelledby="sg-wlgd-h1">
        <p className="eyebrow eyebrow-bright"><span />WHOLESALE SUPPLY · SURAT, INDIA</p>
        <h1 id="sg-wlgd-h1">
          Wholesale lab-grown diamonds for Singapore — trial, mid, and bulk parcels from direct Surat
          manufacture.
        </h1>
        <p className="specialty-hero-copy">
          Alvora manufactures lab-grown diamonds at its own benches in Surat and supplies Singapore's
          wholesale trade in three parcel bands: trial orders under 15 ct for account opening and
          qualification, mid parcels of 15–50 ct for established replenishment programmes, and bulk
          parcels above 50 ct for manufacturing programmes and distribution accounts. Every parcel is
          quoted in USD/ct and SGD/ct. IGI or GIA certification is included per stone. First orders
          are supported by CAD or letter-of-credit terms.
        </p>
      </section>

      <section className="specialty-section specialty-section-light" aria-labelledby="sg-wlgd-bands">
        <div className="specialty-section-lead">
          <p className="eyebrow"><span />PARCEL BANDS</p>
          <h2 id="sg-wlgd-bands">Wholesale lab-grown diamond supply for Singapore — three parcel bands.</h2>
          <p>
            Each band is priced on a per-carat basis in USD and SGD. Pricing is parcel-specific and
            communicated on a per-enquiry basis — send your specification and we return a firm quote
            with the applicable per-carat rate and total parcel cost.
          </p>
        </div>
        <div className="specialty-feature-list on-light" style={{ marginTop: 40 }}>
          {([
            [
              "Trial — under 15 ct",
              "Designed for account opening and specification verification. A trial parcel lets you inspect stones against the certificate before committing to a standing programme. CAD and LC at sight are available. Quoted per carat in USD/ct and SGD/ct.",
            ],
            [
              "Mid — 15 to 50 ct",
              "For established accounts running a regular replenishment cycle. Parcels are built to specification — shape, colour, clarity, and cut grade — and dispatched on an agreed cadence. Per-carat pricing reflects the mid-band volume.",
            ],
            [
              "Bulk — 50 ct and above",
              "For manufacturing programmes, distribution accounts, and buyers with predictable weekly or monthly volume. Bulk parcels are priced on a per-carat basis specific to the parcel composition. Contact us with the specification to receive a bulk-band quote.",
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

      <section className="specialty-section specialty-section-ink" aria-labelledby="sg-wlgd-programmes">
        <div className="specialty-section-lead">
          <p className="eyebrow"><span />SUPPLY PROGRAMMES</p>
          <h2
            id="sg-wlgd-programmes"
            style={{ fontSize: "clamp(1.6rem, 2.4vw, 2.6rem)", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 20 }}
          >
            Programmes for the Singapore wholesale trade.
          </h2>
          <p>
            All programmes ship from Surat with IGI or GIA certification, insured, and with a
            declared per-stone invoice ready for Singapore Customs permit and GST declaration.
          </p>
        </div>
        <div style={{ marginTop: 40 }}>
          <SgProductPanel programme="all" pageSlug="wholesale-lab-grown-diamonds" />
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
            { label: "Lab-grown diamond wholesaler", href: "/singapore/lab-grown-diamond-wholesaler" },
            { label: "Wholesale parcels", href: "/singapore/wholesale-parcels" },
          ]}
        />
      </section>

      <section className="specialty-section" aria-label="Send specifications">
        <SgContactBlock submitLabel="Send Specifications" />
      </section>
    </SpecialtyPageShell>
  );
}
