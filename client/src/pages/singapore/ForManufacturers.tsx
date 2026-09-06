import SpecialtyPageShell from "@/components/SpecialtyPageShell";
import SpecialtyPageMeta from "@/components/SpecialtyPageMeta";
import {
  SgTrustPanel,
  SgReplenishmentWorkflow,
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
  name: "Lab-Grown Diamonds for Jewellery Manufacturers Singapore",
  serviceType: "Production Lab-Grown Diamond Supply",
  provider: {
    "@type": "Organization",
    name: "Alvora",
    address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" },
  },
  description:
    "Alvora supplies Singapore jewellery manufacturers with lab-grown diamonds via a weekly make-list to price matrix workflow. Calibrated parcels, matched sets, replenishment, CAD and LC terms.",
  areaServed: "SG",
};

const PAGE_FAQS = [
  {
    question: "How does the weekly make-list workflow operate in practice?",
    answer:
      "Send a list of the shapes, sizes, and weights you need for the week's production; a plain-text list or spreadsheet is sufficient. We return a cut, size, and price matrix with matched parcels built against each line. You confirm the parcel, we verify each stone against its certificate before packing, and dispatch follows with a declared per-stone invoice ready for Singapore Customs permit and GST accounting.",
  },
  {
    question: "What payment terms apply to a production programme?",
    answer:
      "Cash against documents (CAD) and letter of credit at sight (LC at sight) are the recommended structures for a first cross-border order. After the first order has been verified, 50% pre-dispatch with the balance due before dispatch is available. For standing replenishment programmes with an established relationship, telegraphic transfer in advance is the simplest structure for parcels under a defined value threshold.",
  },
  {
    question: "Can a repeat production specification be held on file?",
    answer:
      "Yes. Once a production specification has been approved (shape, size, colour, clarity, cut grade, and tolerance) it is held on file and the parcel can be dispatched on an agreed weekly, fortnightly, or monthly cadence without requiring a fresh brief. The replenishment workflow runs on that standing specification until you notify us of a change.",
  },
  {
    question: "How is each stone accountable through the production process?",
    answer:
      "Every stone in a production parcel is laser-inscribed with its IGI or GIA report number and the per-stone invoice reconciles each stone to its certificate. One stone, one report number, one invoice line. This means your goods-in process and your Singapore Customs documentation are both traceable at the stone level.",
  },
];

export default function SgForManufacturers() {
  return (
    <SpecialtyPageShell>
      <SpecialtyPageMeta
        title="Lab-Grown Diamonds for Jewellery Manufacturers Singapore | Alvora"
        description="Lab-grown diamonds for Singapore jewellery manufacturers. Weekly make-list to cut and price matrix, matched parcels, replenishment, and CAD or LC terms."
        path="/singapore/for-manufacturers"
        jsonLd={JSON_LD}
      />

      <section className="specialty-hero" aria-labelledby="sg-mfr-h1">
        <p className="eyebrow eyebrow-bright"><span />FOR MANUFACTURERS · SINGAPORE</p>
        <h1 id="sg-mfr-h1">
          Lab-grown diamonds for Singapore jewellery manufacturers: weekly make-list to price matrix,
          matched parcels, and replenishment.
        </h1>
        <p className="specialty-hero-copy">
          Alvora manufactures lab-grown diamonds at its own benches in Surat and operates a
          production-programme supply model for Singapore jewellery manufacturers and setting houses.
          Send a weekly make list; we return a cut, size, and price matrix with matched parcels
          against each line. Approved specifications are held on file and dispatched on a standing
          cadence without re-briefing. IGI or GIA certification is included per stone. CAD and
          letter-of-credit terms are available for first orders.
        </p>
      </section>

      <section className="specialty-section specialty-section-light" aria-labelledby="sg-mfr-workflow">
        <div className="specialty-section-lead">
          <p className="eyebrow"><span />PRODUCTION PROGRAMME</p>
          <h2 id="sg-mfr-workflow">
            Lab-grown diamonds for Singapore jewellery manufacturers: make-list to parcel, week on week.
          </h2>
          <p>
            The production programme is designed for manufacturers who need upstream consistency:
            the same stone quality, the same size tolerance, the same documentation, delivered
            reliably on a cadence that matches your bench schedule.
          </p>
        </div>
        <div className="specialty-feature-list on-light" style={{ marginTop: 40 }}>
          {([
            [
              "Make-list to price matrix",
              "Submit your week's shape, size, and weight requirements in any format. We return a price and availability matrix with matched parcels against each line: not a quote sheet, a working production input.",
            ],
            [
              "Matched parcels, not random lots",
              "Each parcel line is built to match colour, clarity, and cut grade within the stated tolerance. You do not need to sort or grade at the bench before setting.",
            ],
            [
              "One-stone accountability",
              "Every stone is laser-inscribed with its IGI or GIA report number. The per-stone invoice reconciles each stone to its certificate. One stone, one report number, one invoice line. Auditable through your production process.",
            ],
            [
              "Replenishment on a standing cadence",
              "Approved specifications are held on file. Repeat parcels dispatch on your agreed cadence (weekly, fortnightly, or monthly) without requiring a fresh brief each time.",
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

      <section className="specialty-section specialty-section-ink" aria-label="Replenishment workflow">
        <SgReplenishmentWorkflow />
      </section>

      <section className="specialty-section specialty-section-light" aria-labelledby="sg-mfr-programmes">
        <div className="specialty-section-lead">
          <p className="eyebrow"><span />SUPPLY PROGRAMMES</p>
          <h2
            id="sg-mfr-programmes"
            style={{ fontSize: "clamp(1.6rem, 2.4vw, 2.6rem)", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 20 }}
          >
            Calibrated and matched-pair supply for Singapore manufacturers.
          </h2>
          <p>
            The calibrated parcel programme is the primary production-input supply. The matched-pair
            programme handles earring and two-stone ring requirements. The custom specification desk
            covers non-standard briefs.
          </p>
        </div>
        <div style={{ marginTop: 40 }}>
          <SgProductPanel programme="calibrated" pageSlug="for-manufacturers" />
        </div>
      </section>

      <section className="specialty-section specialty-section-ink" aria-label="Supply credentials">
        <SgTrustPanel />
      </section>

      <section className="specialty-section specialty-section-light" aria-label="Payment terms">
        <SgPaymentTermsBlock />
      </section>

      <section className="specialty-section specialty-section-ink" aria-label="Singapore landed cost">
        <SgLandedCostBlock />
      </section>

      <section className="specialty-section specialty-section-light" aria-label="Frequently asked questions">
        <SgFaqBlock items={PAGE_FAQS} />
      </section>

      <section className="specialty-section specialty-section-ink" aria-label="Related pages">
        <SgSiblingNav
          siblings={[
            { label: "Calibrated parcels", href: "/singapore/calibrated-parcels" },
            { label: "Melee diamonds", href: "/singapore/melee" },
          ]}
        />
      </section>

      <section className="specialty-section" aria-label="Discuss production programme">
        <SgContactBlock submitLabel="Discuss Production Programme" />
      </section>
    </SpecialtyPageShell>
  );
}
