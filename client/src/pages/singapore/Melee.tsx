import SpecialtyPageShell from "@/components/SpecialtyPageShell";
import SpecialtyPageMeta from "@/components/SpecialtyPageMeta";
import {
  SgTrustPanel,
  SgReplenishmentWorkflow,
  SgPaymentTermsBlock,
  SgFaqBlock,
  SgContactBlock,
  SgSiblingNav,
} from "@/components/SingaporeBlocks";

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Lab-Grown Melee Diamonds Singapore",
  serviceType: "Lab-Grown Melee Diamond Parcel Supply",
  provider: {
    "@type": "Organization",
    name: "Alvora",
    address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" },
  },
  description:
    "Alvora supplies lab-grown melee diamonds to Singapore manufacturers in calibrated size bands, colour and clarity bands, with replenishment cadence and a sample parcel option.",
  areaServed: "SG",
};

const PAGE_FAQS = [
  {
    question: "Can melee be supplied in calibrated size bands?",
    answer:
      "Yes. Standard calibrated melee size bands are available from 1.0 mm, 1.2 mm, 1.3 mm, 1.5 mm, 1.7 mm, 1.8 mm, 2.0 mm, 2.5 mm, and 3.0 mm, each held within a defined girdle-diameter tolerance. Custom sizes are available on enquiry; send the required diameter and application and we will advise on production feasibility.",
  },
  {
    question: "Is replenishment available for a running melee programme?",
    answer:
      "Yes. Once a melee specification has been approved (size band, colour, clarity, cut grade, and fluorescence disclosure) it is held on file. Repeat parcels are dispatched on your agreed cadence without requiring a fresh brief. The replenishment workflow is the same used across all Alvora manufacturing programmes.",
  },
  {
    question: "Can I qualify the specification before committing to a standing order?",
    answer:
      "Yes. A small sample parcel (typically a trial quantity under 15 ct) is available to verify colour consistency, clarity, size tolerance, and cut quality against your specification before a standing order is confirmed. Send your size and grade requirement and we will advise on sample parcel construction and payment terms.",
  },
  {
    question: "Does Singapore levy import duty on melee diamonds?",
    answer:
      "No. Loose diamonds (including melee) are not a dutiable category under Singapore Customs. The applicable rate is 0% customs duty plus 9% import GST calculated on CIF value. A GST-registered Singapore buyer can typically claim the import GST back as input tax. Confirm your GST registration and HS classification with a Singapore customs broker before the first shipment.",
  },
];

export default function SgMelee() {
  return (
    <SpecialtyPageShell>
      <SpecialtyPageMeta
        title="Lab-Grown Melee Diamonds Singapore: Parcel Supply | Alvora"
        description="Lab-grown melee diamonds for Singapore. Parcel supply by colour and clarity band, replenishment cadence, and sample parcel to qualify the specification."
        path="/singapore/melee"
        jsonLd={JSON_LD}
      />

      <section className="specialty-hero" aria-labelledby="sg-melee-h1">
        <p className="eyebrow eyebrow-bright"><span />MELEE DIAMOND SUPPLY · SINGAPORE</p>
        <h1 id="sg-melee-h1">
          Lab-grown melee diamonds for Singapore: parcel supply, colour and clarity bands, and
          replenishment cadence.
        </h1>
        <p className="specialty-hero-copy">
          Alvora manufactures calibrated lab-grown melee diamonds at its Surat benches and supplies
          Singapore manufacturers and setting houses with parcel stock built to colour and clarity
          specification. Standard size bands from 1.0 mm through 3.0 mm, with colour bands D–F,
          G–H, and I–J, and clarity IF–VS and SI. Once a specification is approved, it can be held
          on file and dispatched on a regular replenishment cadence. A sample parcel is available to
          qualify the specification before committing to a standing programme.
        </p>
      </section>

      <section className="specialty-section specialty-section-light" aria-labelledby="sg-melee-construction">
        <div className="specialty-section-lead">
          <p className="eyebrow"><span />PARCEL CONSTRUCTION</p>
          <h2 id="sg-melee-construction">
            Lab-grown melee diamonds for Singapore: parcel construction by colour, clarity, and size band.
          </h2>
          <p>
            Melee parcels are built to a combination of size band, colour band, clarity band, and cut
            grade. Colour and clarity are not mixed within a parcel unless specified; each lot is
            confirmed against its stated grade before dispatch.
          </p>
        </div>
        <div className="specialty-feature-list on-light" style={{ marginTop: 40 }}>
          {([
            [
              "Colour bands: D–F, G–H, I–J",
              "Three standard colour bands are available. D–F for premium halo and pavé work. G–H for mid-market setting programmes. I–J for volume tennis and fashion jewellery production. Tighter colour ranges within a band are available on request.",
            ],
            [
              "Clarity bands: IF to VS and SI",
              "Two standard clarity bands: IF through VS for certificate-quality visible settings, and SI1 through SI2 with no eye-visible inclusions confirmed per lot. The clarity band is held consistently across the parcel.",
            ],
            [
              "Size from 1.0 mm, held to tolerance",
              "Standard sizes from 1.0 mm through 3.0 mm in the common melee increments. Girdle diameter is held within a defined tolerance per size band. Consistent calibration reduces hand-sorting time at the bench.",
            ],
            [
              "Sample parcel to qualify",
              "New accounts receive a small sample parcel to verify colour, size, clarity, and cut consistency against their specification before a standing order is confirmed. The sample is invoiced at the applicable per-carat rate.",
            ],
          ] as [string, string][]).map(([k, v]) => (
            <article key={k}>
              <span className="feat-mark">-</span>
              <div>
                <h3>{k}</h3>
                <p>{v}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="specialty-section specialty-section-ink" aria-label="Replenishment workflow">
        <SgReplenishmentWorkflow />
      </section>

      <section className="specialty-section specialty-section-light" aria-label="Supply credentials">
        <SgTrustPanel />
      </section>

      <section className="specialty-section specialty-section-ink" aria-label="Payment terms">
        <SgPaymentTermsBlock />
      </section>

      <section className="specialty-section specialty-section-light" aria-label="Frequently asked questions">
        <SgFaqBlock items={PAGE_FAQS} />
      </section>

      <section className="specialty-section specialty-section-ink" aria-label="Related pages">
        <SgSiblingNav
          siblings={[
            { label: "Calibrated parcels", href: "/singapore/calibrated-parcels" },
            { label: "For manufacturers", href: "/singapore/for-manufacturers" },
          ]}
        />
      </section>

      <section className="specialty-section" aria-label="Request parcel quote">
        <SgContactBlock submitLabel="Request Parcel Quote" />
      </section>
    </SpecialtyPageShell>
  );
}
