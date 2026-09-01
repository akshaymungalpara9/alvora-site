import SpecialtyPageShell, { SpecialtyCta } from "@/components/SpecialtyPageShell";
import SpecialtyPageMeta from "@/components/SpecialtyPageMeta";

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Calibrated Lab-Grown Diamond Layouts",
  serviceType: "Diamond Manufacturing",
  provider: {
    "@type": "Organization",
    name: "Alvora",
    address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" },
  },
  description:
    "Calibrated lab-grown diamond layouts cut to exact repeatable dimensions — same girdle diameter, same depth, same table — for pave, channel, and bezel setting programmes.",
  areaServed: "Worldwide",
};

export default function CalibratedDiamondLayouts() {
  return (
    <SpecialtyPageShell>
      <SpecialtyPageMeta
        title="Calibrated Lab-Grown Diamond Layouts | Alvora Diamonds, Surat"
        description="Alvora makes calibrated lab-grown diamond layouts from Surat to exact repeatable dimensions — same girdle, same depth, same seat. Built for manufacturing jewellers who need every stone to hold position."
        path="/calibrated-diamond-layouts"
        jsonLd={JSON_LD}
      />

      <section className="specialty-hero" aria-labelledby="cdl-title">
        <p className="eyebrow eyebrow-bright"><span />CALIBRATED LAYOUTS · SURAT MANUFACTURE</p>
        <h1 id="cdl-title">Calibrated Lab-Grown<br /><em>Diamond Layouts</em></h1>
        <p className="specialty-hero-copy">
          Precision, not volume. When the setting is fixed and the seat is cut, every stone in the
          layout must hold the same position. Alvora calibrates as part of the cut, not as a
          secondary sort step after the bench is done.
        </p>
        <p className="hero-maker-line" style={{ marginTop: 32 }}>
          Every stone in the parcel is measured before it ships. Those outside tolerance are
          separated — not quietly downgraded and packed.
        </p>
      </section>

      <section className="specialty-section specialty-section-light" aria-labelledby="cdl-what-title">
        <div className="specialty-section-lead">
          <p className="eyebrow"><span />WHAT CALIBRATION MEANS AT ALVORA</p>
          <h2 id="cdl-what-title">Same girdle.<br />Same depth. Same seat.</h2>
          <p>
            Calibrated layouts are parcels of lab-grown diamonds cut to identical repeatable
            dimensions — same girdle diameter within tolerance{" "}
            <span className="specialty-todo">[TODO: confirm ±0.1 mm tolerance]</span>, same table
            and depth percentages, same crown and pavilion angles across every stone in the parcel.
          </p>
          <p>
            When you set twenty rounds into a pave band, each stone must drop to gauge. A stone that
            sits high or rocks in the seat was calibrated incorrectly upstream — and that failure
            lands on the setter's bench as extra labour, or on the customer's piece as visible
            inconsistency. Calibration is not a quality tier. It is a manufacturing requirement.
          </p>
          <p>
            At Alvora we calibrate at cutting — each stone is worked against the profile
            specification and measured before it is added to the layout parcel. The parcel that
            ships is the parcel to specification.
          </p>
        </div>

        <div className="specialty-feature-list on-light" style={{ marginTop: 64 }}>
          {[
            ["01", "Girdle diameter held to specification", "Each stone is measured after cutting. Diameter is verified against the parcel specification before acceptance into the layout. TODO: confirm tolerance — target ±0.1 mm across the parcel."],
            ["02", "Table and depth matched across the parcel", "Table and total depth percentages are matched across stones so that crown height and pavilion depth are consistent — critical when your setting depth is fixed."],
            ["03", "Finish grade: Very Good or Excellent on every stone", "Cut grade is applied to each stone individually. No stone in a calibrated parcel ships below Very Good. Excellent is the default where rough allows."],
            ["04", "Colour and clarity to your specified range", "We do not mix colour or clarity grades within a layout parcel without agreement. If your setting reads better with a tighter colour range, we hold to it."],
            ["05", "IGI laser inscription and certification", "Each stone is IGI laser-inscribed. Certification options — per-stone or per-parcel master report — are confirmed with your enquiry. TODO: confirm IGI per-parcel process."],
          ].map(([mark, title, desc]) => (
            <article key={mark}>
              <span className="feat-mark">{mark}</span>
              <div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="specialty-section specialty-section-ink" aria-labelledby="cdl-spec-title">
        <div className="specialty-section-split">
          <div>
            <p className="eyebrow"><span />WHAT YOU CAN SPECIFY</p>
            <h2 id="cdl-spec-title">Your specification<br />is the instruction set.</h2>
            <p>
              Send us the shape, dimensions, finish, colour range, clarity range, and quantity you
              need. We return a production schedule and a per-stone quotation. There is no minimum
              quantity for a specification enquiry.
            </p>
            <p>
              Standard shapes available: round brilliant, princess, cushion, oval, marquise, pear,
              radiant, emerald, and asscher.{" "}
              <span className="specialty-todo">[TODO: confirm full shape list]</span>. Non-standard
              shapes and proprietary cuts assessed on request.
            </p>
            <p>
              Typical production lead time for a calibrated layout order:{" "}
              <strong>7–14 working days</strong>{" "}
              <span className="specialty-todo">[TODO: confirm — depends on parcel size]</span>.
              Rush assessment available.
            </p>
          </div>
          <div>
            <p className="eyebrow"><span />SPECIFICATION CHECKLIST</p>
            <div className="specialty-feature-list" style={{ marginTop: 16 }}>
              {[
                ["Shape", "Round brilliant, princess, cushion, oval, marquise, pear, radiant, or other."],
                ["Diameter / dimensions", "Exact mm target — or matched to your setting drawing."],
                ["Table %", "Your percentage requirement, or matched to a reference stone."],
                ["Depth %", "Verified against setting depth specification."],
                ["Finish grade", "Very Good or Excellent — stated per parcel."],
                ["Colour range", "Specified range, not mixed grades within a parcel."],
                ["Clarity range", "Specified range with agreed tolerance."],
                ["Quantity", "Stones per parcel — including any overage requirement."],
                ["Certification", "Per-stone IGI or per-parcel master report."],
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
