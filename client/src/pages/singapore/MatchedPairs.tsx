import SpecialtyPageShell from "@/components/SpecialtyPageShell";
import SpecialtyPageMeta from "@/components/SpecialtyPageMeta";
import {
  SgCertificationNote,
  SgTrustPanel,
  SgPaymentTermsBlock,
  SgFaqBlock,
  SgContactBlock,
  SgProductPanel,
  SgSiblingNav,
} from "@/components/SingaporeBlocks";

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Matched Lab-Grown Diamond Pairs Singapore",
  serviceType: "Matched Lab-Grown Diamond Pair Programme",
  provider: {
    "@type": "Organization",
    name: "Alvora",
    address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" },
  },
  description:
    "Alvora supplies matched lab-grown diamond pairs to Singapore jewellers and ateliers. Oval and round pairs matched by colour, clarity, and proportions. Hold-until-design-approval available.",
  areaServed: "SG",
};

const PAGE_FAQS = [
  {
    question: "What does 'matched' mean for a lab-grown diamond pair?",
    answer:
      "Matched means that both stones in the pair read as visually equivalent when set together. Colour grade is held within one step across the pair. Girdle diameter, crown height, pavilion depth, and table percentage are matched within production tolerance so that face-up appearance is consistent. Cut grade is Excellent or Very Good on each stone. Fluorescence is disclosed per stone.",
  },
  {
    question: "Can I hold a matched pair until a customer design is approved?",
    answer:
      "Yes. A hold-until-design-approval workflow is available. When a pair is confirmed as available and matched to your specification, we hold it against your brief for an agreed window while the design is finalised. The pair is not released to another buyer during the hold period. Confirm the hold window and terms when requesting availability.",
  },
  {
    question: "What certification do matched pairs carry?",
    answer:
      "Each stone in the pair carries its own IGI certificate, laser-inscribed with the report number searchable on the IGI verification platform in real time. GIA certification is available as an alternative. The pair reference is noted in your order documentation so both stones are traceable to the same matched selection.",
  },
  {
    question: "What is the lead time for a matched pair to specification?",
    answer:
      "Lead time is specification-specific. For pairs available from current production, we can confirm availability and dispatch within the standard Singapore supply window. For pairs cut to a specific brief — unusual proportions or a non-standard shape — send the specification and we will return a cutting schedule and lead time estimate.",
  },
];

export default function SgMatchedPairs() {
  return (
    <SpecialtyPageShell>
      <SpecialtyPageMeta
        title="Matched Lab-Grown Diamond Pairs Singapore | Alvora"
        description="Matched lab-grown diamond pairs for Singapore — oval and round, matched by colour, clarity, and proportions, with hold-until-design-approval workflow."
        path="/singapore/matched-pairs"
        jsonLd={JSON_LD}
      />

      <section className="specialty-hero" aria-labelledby="sg-mp-h1">
        <p className="eyebrow eyebrow-bright"><span />MATCHED-PAIR PROGRAMME · SINGAPORE</p>
        <h1 id="sg-mp-h1">
          Matched lab-grown diamond pairs for Singapore — oval and round, proportions-matched, with
          hold-until-approval workflow.
        </h1>
        <p className="specialty-hero-copy">
          Alvora matches lab-grown diamond pairs at our Surat benches and supplies Singapore jewellers
          and ateliers with oval and round pairs matched by colour grade, girdle diameter, crown height,
          pavilion depth, and face-up appearance. Pairs can be held under a design-approval workflow
          until the setting is confirmed. IGI certification is included per stone; GIA is available on
          request. Response within the Singapore business day. Trade accounts only.
        </p>
      </section>

      <section className="specialty-section specialty-section-light" aria-labelledby="sg-mp-matching">
        <div className="specialty-section-lead">
          <p className="eyebrow"><span />MATCHING STANDARDS</p>
          <h2 id="sg-mp-matching">
            Matched lab-grown diamond pairs for Singapore jewellers and ateliers — proportions matched,
            not just graded.
          </h2>
          <p>
            A matched pair is not two stones of the same grade ticket. It is two stones a buyer and
            their customer cannot distinguish when set opposite each other. The matching work is done
            at the bench, not at the grading table.
          </p>
        </div>
        <div className="specialty-feature-list on-light" style={{ marginTop: 40 }}>
          {([
            [
              "Colour within one grade step",
              "Colour is matched within one grade step across both stones — E/F, F/G, G/H, and so on. Grade combinations are confirmed per pair at the time of enquiry.",
            ],
            [
              "Girdle diameter matched to tolerance",
              "Girdle diameter is matched within production tolerance across both stones. The tolerance is confirmed at the specification stage and held through production and selection.",
            ],
            [
              "Crown height and pavilion depth",
              "Table percentage, crown height, and pavilion depth are matched so face-up appearance is consistent. A pair that drifts outside tolerance at any measurement point is not shipped as a matched set.",
            ],
            [
              "Cut grade — Excellent or Very Good",
              "Both stones in the pair carry an Excellent or Very Good cut grade. Grade is stated per pair and confirmed on the certificate.",
            ],
            [
              "Fluorescence disclosed per stone",
              "Fluorescence is disclosed on the certificate and the shipment invoice for each stone. A 'none' specification can be held as a standing filter for programmes that require it.",
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

      <section className="specialty-section specialty-section-ink" aria-labelledby="sg-mp-programme">
        <div className="specialty-section-lead">
          <p className="eyebrow"><span />MATCHED-PAIR PROGRAMME</p>
          <h2
            id="sg-mp-programme"
            style={{ fontSize: "clamp(1.6rem, 2.4vw, 2.6rem)", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 20 }}
          >
            Standing pairs programme or individual commission.
          </h2>
          <p>
            Matched pairs are available as a standing programme for high-volume accounts or sourced
            stone by stone for individual design briefs.
          </p>
        </div>
        <div style={{ marginTop: 40 }}>
          <SgProductPanel programme="matched-pairs" pageSlug="matched-pairs" />
        </div>
      </section>

      <section className="specialty-section specialty-section-light" aria-label="Certification and verification">
        <SgCertificationNote />
      </section>

      <section className="specialty-section specialty-section-ink" aria-label="Supply credentials">
        <SgTrustPanel />
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
            { label: "For manufacturers", href: "/singapore/for-manufacturers" },
            { label: "Calibrated parcels", href: "/singapore/calibrated-parcels" },
          ]}
        />
      </section>

      <section className="specialty-section" aria-label="Request matched-pair availability">
        <SgContactBlock submitLabel="Request Matched-Pair Availability" />
      </section>
    </SpecialtyPageShell>
  );
}
