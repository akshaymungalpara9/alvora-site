import SpecialtyPageShell, { SpecialtyCta } from "@/components/SpecialtyPageShell";
import SpecialtyPageMeta from "@/components/SpecialtyPageMeta";

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Lab-Grown Diamonds for Jewellery Brands",
  serviceType: "Diamond Manufacturing",
  provider: {
    "@type": "Organization",
    name: "Alvora",
    address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" },
  },
  description:
    "Alvora supplies manufacturing jewellers, DTC jewellery brands, and private-label operations with certified, calibrated lab-grown diamonds. Spec-based ordering, matched parcels, direct manufacturer pricing.",
  areaServed: "Worldwide",
};

export default function ForJewelryBrands() {
  return (
    <SpecialtyPageShell>
      <SpecialtyPageMeta
        title="Lab-Grown Diamonds for Jewellery Brands — Alvora"
        description="Alvora supplies manufacturing jewellers, DTC brands, and private-label operations with certified, calibrated lab-grown diamonds. Spec-based ordering, matched parcels, direct manufacturer pricing."
        path="/for-jewelry-brands"
        jsonLd={JSON_LD}
      />

      <section className="specialty-hero" aria-labelledby="fjb-title">
        <p className="eyebrow eyebrow-bright"><span />FOR JEWELLERY BRANDS · DIRECT MANUFACTURE</p>
        <h1 id="fjb-title">Lab-Grown Diamonds<br /><em>for Jewellery Brands</em></h1>
        <p className="specialty-hero-copy">
          Built for buyers who need a manufacturer, not a marketplace. Consistent specification.
          Repeatable make. Direct pricing. If your programme needs the same stone to arrive the same
          way every time, that is a manufacturing requirement — and a manufacturer is what you need.
        </p>
        <p className="hero-maker-line" style={{ marginTop: 32 }}>
          You are buying from the bench — there is no factory behind us to go around.
        </p>
      </section>

      <section className="specialty-section specialty-section-light" aria-labelledby="fjb-who-title">
        <div className="specialty-section-lead">
          <p className="eyebrow"><span />WHO WE WORK WITH</p>
          <h2 id="fjb-who-title">Buyers who need<br />a manufacturer.</h2>
          <p>
            Alvora supplies manufacturing jewellers, DTC jewellery brands, and private-label
            operations. The common denominator is a buyer who needs the same stone — or the same
            parcel — to arrive the same way every time. That is a manufacturing requirement, not a
            retail one. A sourcer finds what exists. A manufacturer makes what you specify.
          </p>
        </div>

        <div className="specialty-feature-list on-light" style={{ marginTop: 52 }}>
          {[
            [
              "Manufacturing jewellers",
              "Bench-driven operations building jewellery to volume need upstream consistency that reduces hand-sorting and rejection at the setter. Calibrated parcels, matched colour ranges, and repeatable make cut bench time and reduce rejection rates.",
            ],
            [
              "DTC jewellery brands",
              "Direct-to-consumer brands building collections around a specific cut, colour range, or dimension need a source that holds the specification across reorders. We hold the spec on file and cut to it each time.",
            ],
            [
              "Private-label operations",
              "Brands supplying finished jewellery to retailers under contract need a manufacturer that disappears behind their brand. We act as the production source, not a visible supply chain participant.",
            ],
            [
              "Brands with non-standard requirements",
              "If your programme requires a diamond shape, dimension, or cut grade combination that standard production does not supply, custom cutting is the answer — not a broader search across existing stock.",
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

      <section className="specialty-section specialty-section-ink" aria-labelledby="fjb-consistency-title">
        <div className="specialty-section-split">
          <div>
            <p className="eyebrow"><span />WHAT CONSISTENCY MEANS IN PRACTICE</p>
            <h2 id="fjb-consistency-title">Same spec.<br />Same result.<br />Every reorder.</h2>
            <p>
              When we take on a brand's production programme, we hold the specification on file.
              Each new order is cut against the same spec, measured against the same profile, and
              certified to the same grade range. If a stone in a delivery does not meet the spec, it
              does not ship.
            </p>
            <p>
              For a DTC brand selling a solitaire in a patented setting at a fixed price point, this
              means the diamond for order 4,000 is the same diamond as order 1. The customer buying
              from a brand's catalogue at reorder is not a test of sourcing — it is a test of
              manufacturing discipline.
            </p>
            <p>
              For a manufacturing jeweller, consistency upstream means the setting programme does
              not need to absorb variation. Stones that calibrate predictably set predictably. Bench
              time is a cost. Rejection is a cost. Consistent upstream manufacturing eliminates both.
            </p>
          </div>
          <div>
            <p className="eyebrow"><span />WHAT TO SEND US</p>
            <h2 style={{ fontSize: "clamp(1.6rem, 2.4vw, 2.6rem)", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 20 }}>
              Your programme.<br />Our production.
            </h2>
            <p>
              Send us the specification for your programme — shape, dimensions, grade range,
              certification requirement, quantity, and timing. We will return a production schedule
              and quotation. The quotation itemises per-stone pricing against the specified grade,
              with calibration and layout work stated separately.{" "}
              <span className="specialty-todo">[TODO: confirm minimum order quantities for brand programmes]</span>
            </p>
            <div className="specialty-feature-list" style={{ marginTop: 28 }}>
              {[
                ["Direct pricing", "No intermediary margin. Pricing reflects the make — stone, certification, and any layout or calibration work — stated per stone and per parcel."],
                ["Spec on file", "Your production specification is held on file for reorders. We cut to the same spec each time without requiring you to re-brief each order."],
                ["Assured make", "Every stone is verified against its certificate before dispatch. Spec mismatches, chips, or make issues go back to our benches — repaired or replaced, never shipped."],
                ["Trade terms", "We work with established brands and jewellers on negotiated trade terms. First orders confirm the make; ongoing accounts move to agreed terms after credit and reference checks."],
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
