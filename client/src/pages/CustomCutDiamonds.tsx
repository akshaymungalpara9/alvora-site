import SpecialtyPageShell, { SpecialtyCta } from "@/components/SpecialtyPageShell";
import SpecialtyPageMeta from "@/components/SpecialtyPageMeta";

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Custom-Cut Lab-Grown Diamonds",
  serviceType: "Diamond Manufacturing",
  provider: {
    "@type": "Organization",
    name: "Alvora",
    address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" },
  },
  description:
    "Custom-cut lab-grown diamonds made to exact buyer specification — shape, exact diameter, depth ratio, table percentage, crown and pavilion angles. 5–10 working day lead time from Surat.",
  areaServed: "Worldwide",
};

export default function CustomCutDiamonds() {
  return (
    <SpecialtyPageShell>
      <SpecialtyPageMeta
        title="Custom-Cut Lab-Grown Diamonds to Exact Specification"
        description="Send your specification sheet — shape, exact diameter, depth ratio, table, finish — and Alvora cuts the diamond to meet it. Precision manufacturing from Surat, 5–10 working day lead time."
        path="/custom-cut-diamonds"
        jsonLd={JSON_LD}
      />

      <section className="specialty-hero" aria-labelledby="ccd-title">
        <p className="eyebrow eyebrow-bright"><span />CUSTOM CUT · 5–10 WORKING DAYS</p>
        <h1 id="ccd-title">Custom-Cut Lab-Grown<br /><em>Diamonds to Specification</em></h1>
        <p className="specialty-hero-copy">
          A broker can match a requirement. A manufacturer can cut to it. Send the specification
          your jewellery programme needs — shape, exact diameter, depth ratio, table, crown and
          pavilion angles, finish — and we make the diamond to meet it. That is not sourcing. That
          is manufacturing.
        </p>
        <p className="hero-maker-line" style={{ marginTop: 32 }}>
          Typical lead time for a spec make: 5–10 working days.{" "}
          <span className="specialty-todo">[TODO: confirm]</span>
        </p>
      </section>

      <section className="specialty-section specialty-section-light" aria-labelledby="ccd-when-title">
        <div className="specialty-section-lead">
          <p className="eyebrow"><span />WHEN CUSTOM CUTTING IS NECESSARY</p>
          <h2 id="ccd-when-title">When the spec exists<br />and the stock does not.</h2>
          <p>
            Most diamond suppliers work from existing stock — they source and grade what is already
            cut. Custom cutting means starting from rough and making the diamond to the buyer's
            instruction set. The specification is not a preference. It is the output requirement.
          </p>
        </div>

        <div className="specialty-feature-list on-light" style={{ marginTop: 52 }}>
          {[
            [
              "Proprietary setting dimensions",
              "Your setting drawing specifies a stone diameter not covered by standard commercial sizes. A 6.35 mm round for a sizing-specific solitaire. A 7.2 × 5.1 mm oval for a bezel that was cut to a tolerance. Standard production does not hit these. Custom cutting does.",
            ],
            [
              "Length-to-width ratio requirements",
              "Fancy shapes — ovals, cushions, pears, marquise — vary enormously in LW ratio across standard production. If your programme specifies a 1.40–1.45 oval and standard production gives you 1.30 and 1.55 mixed in a parcel, the result is visible inconsistency. We cut to ratio.",
            ],
            [
              "Depth-profile requirements",
              "If a setting has a fixed depth, the stone must fit it. A stone with a standard 62% depth that is 0.8 mm too deep does not set. We cut to the depth the setting requires.",
            ],
            [
              "Non-standard or proprietary cuts",
              "Vintage cuts, modified brilliants, branded cuts, or cuts developed for a specific optical effect. If it can be described in a specification, we can evaluate whether it can be made.",
            ],
          ].map(([title, desc]) => (
            <article key={title}>
              <span className="feat-mark">—</span>
              <div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="specialty-section specialty-section-ink" aria-labelledby="ccd-spec-title">
        <div className="specialty-section-split">
          <div>
            <p className="eyebrow"><span />WHAT TO INCLUDE IN A SPECIFICATION</p>
            <h2 id="ccd-spec-title">A specification is<br />a cutting instruction.</h2>
            <p>
              The more complete your specification, the faster we can confirm production and the
              more precisely we can hold to it. The minimum we need to begin: shape, target
              dimensions, and finish grade. The more you add, the tighter the output.
            </p>
            <p>
              If you have a reference stone — an existing diamond you want replicated — we can
              measure it and derive the specification from that stone. Send dimensions and photos, or
              ship the reference stone for bench assessment.
            </p>
            <p>
              First-article verification is available on request: we cut a single stone to
              specification and send photos and measurements before cutting the full parcel.
            </p>
          </div>
          <div>
            <p className="eyebrow"><span />SPECIFICATION ELEMENTS</p>
            <div className="specialty-feature-list" style={{ marginTop: 16 }}>
              {[
                ["Shape", "Round brilliant, oval, cushion, pear, marquise, radiant, princess, emerald, asscher, or non-standard."],
                ["Diameter / dimensions", "Exact mm — diameter for rounds; length × width for fancies. TODO: confirm achievable size range."],
                ["Depth %", "Total depth as a percentage of diameter or average width."],
                ["Table %", "Table facet diameter as a percentage."],
                ["Crown and pavilion angles", "Where setting depth or optical outcome requires specific angles."],
                ["Girdle", "Thin / medium / thick; faceted or polished."],
                ["Finish grade", "Good, Very Good, or Excellent — stated per specification."],
                ["Colour and clarity range", "Your minimum and maximum grade tolerance."],
                ["Quantity", "Number of stones, with any first-article requirement noted."],
                ["Certification", "IGI on each stone. Report scope confirmed per enquiry."],
              ].map(([k, v]) => (
                <article key={k}>
                  <span className="feat-mark">—</span>
                  <div>
                    <h3>{k}</h3>
                    <p>{v}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SpecialtyCta />
    </SpecialtyPageShell>
  );
}
