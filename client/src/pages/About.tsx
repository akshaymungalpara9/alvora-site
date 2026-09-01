import SpecialtyPageShell, { SpecialtyCta } from "@/components/SpecialtyPageShell";
import SpecialtyPageMeta from "@/components/SpecialtyPageMeta";

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Alvora",
  description:
    "Alvora is a Surat-based lab-grown diamond manufacturer specialising in precision cutting, calibration, and IGI certification.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Surat",
    addressRegion: "Gujarat",
    addressCountry: "IN",
  },
  foundingDate: "TODO",
  numberOfEmployees: { "@type": "QuantitativeValue", value: "TODO" },
  knowsAbout: ["Lab-grown diamonds", "Diamond cutting", "IGI certification", "Calibrated diamond layouts"],
};

export default function About() {
  return (
    <SpecialtyPageShell>
      <SpecialtyPageMeta
        title="About Alvora — Surat Lab-Grown Diamond Manufacturer"
        description="Alvora is a Surat-based lab-grown diamond manufacturer specialising in precision cutting, calibration, and IGI certification. Learn about our factory, process, and the bench-to-buyer approach."
        path="/about"
        jsonLd={JSON_LD}
      />

      <section className="specialty-hero" aria-labelledby="about-title">
        <p className="eyebrow eyebrow-bright"><span />ABOUT ALVORA · SURAT, INDIA</p>
        <h1 id="about-title">The Precision House.</h1>
        <p className="specialty-hero-copy">
          We are a Surat lab-grown diamond manufacturer. We cut, calibrate, certify, and ship
          direct to jewellery teams and manufacturing operations worldwide. There is no factory
          behind us — the bench you are buying from is the bench that made the stone.
        </p>
        <p className="hero-maker-line" style={{ marginTop: 32 }}>
          Cut, calibrated and IGI-certified by our own team.
        </p>
      </section>

      <section className="specialty-section specialty-section-light" aria-labelledby="about-where-title">
        <div className="specialty-section-lead">
          <p className="eyebrow"><span />WHERE WE ARE</p>
          <h2 id="about-where-title">Inside Surat's<br />cutting cluster.</h2>
          <p>
            Alvora operates inside Surat's lab-grown diamond cutting-and-polishing cluster — the
            same city that has been producing the world's faceted diamonds for decades. Being in
            Surat means proximity to the tooling, the skilled bench workers, and the infrastructure
            that makes precision cutting at volume feasible.
          </p>
          <p>
            It also means no intermediary between the buyer and the manufacturer. When you send a
            specification to Alvora, the response comes from the people who will make the stone.
            When a stone needs rework, it goes back to the same bench that cut it. That continuity
            of production knowledge is what makes specification-based ordering reliable.
          </p>
        </div>

        <div className="about-numbers">
          {[
            ["25+", "years of industry experience", "TODO: confirm"],
            ["10,000+", "stones dispatched", "TODO: confirm cumulative"],
            ["100%", "IGI standard on every stone", "No exceptions by stone size or order value"],
            ["DIRECT", "from-bench pricing", "No margin layer between manufacturer and buyer"],
          ].map(([value, label, note]) => (
            <article key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
              {note && <p style={{ margin: "6px 0 0", fontSize: "0.6rem", color: "#6f736b", fontFamily: "var(--mono)", lineHeight: 1.5 }}>{note}</p>}
            </article>
          ))}
        </div>
      </section>

      <section className="specialty-section specialty-section-ink" aria-labelledby="about-what-title">
        <div className="specialty-section-lead">
          <p className="eyebrow"><span />WHAT WE MAKE</p>
          <h2 id="about-what-title">Certified, calibrated,<br />made to specification.</h2>
          <p>
            Alvora manufactures certified, calibrated lab-grown diamonds for jewellery programmes
            and manufacturing operations that need control in every dimension. Every stone we ship
            is calibrated to our standard make: Excellent/Ideal cut, no fluorescence, no BGM. It is
            IGI laser-inscribed and validated against the IGI database before dispatch.
          </p>
          <p>We make to a specification, and we can rework what we have made.</p>
        </div>

        <div className="specialty-feature-list" style={{ marginTop: 52 }}>
          {[
            ["Standard production", "Certified lab-grown diamonds cut to our house standard — Excellent/Ideal, no fluorescence, no BGM — in current production shapes and sizes."],
            ["Calibrated layouts", "Layout parcels cut to exact repeatable dimensions for setting programmes with fixed seat requirements. Every stone held to the same girdle, depth, and table."],
            ["Matched pairs", "Two stones cut and selected together to match in colour, dimension, crown angle, and face-up appearance. For earrings, two-stone rings, and shoulder stones."],
            ["Custom cuts", "Made to buyer specification — shape, exact dimensions, depth ratio, table, finish. 5–10 working day lead time from specification sign-off."],
            ["Melee", "Wholesale melee parcels calibrated to consistent diameter ranges. Excellent cut, no fluorescence, no BGM — same standard as larger stones."],
            ["Rework", "Recut, repolish, and rework of stones made by Alvora. Original production information is retained, so rework can be assessed against the initial specification."],
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

      <section className="specialty-section specialty-section-light" aria-labelledby="about-process-title">
        <div className="specialty-section-lead">
          <p className="eyebrow"><span />OUR PROCESS</p>
          <h2 id="about-process-title">From rough to<br />report — at our benches.</h2>
          <p>
            Every stone that leaves Alvora has been cut, calibrated, submitted for IGI certification,
            and verified against its returned certificate before dispatch. The process is linear and
            accountable — no stone moves to the next stage until the current stage is confirmed.
          </p>
          <p>
            <span className="specialty-todo">[TODO: confirm and expand each stage with production specifics — rough sourcing, growth type, cutting tooling, capacity]</span>
          </p>
        </div>

        <div className="about-process-list" style={{ marginTop: 48 }}>
          {[
            ["Rough assessment", "Rough is evaluated against the intended cut specification before being assigned to production. For custom cuts and matched pairs, rough selection is the first production decision."],
            ["Cutting and faceting", "Each stone is cut against the specification — shape, dimensions, angles — at our benches. TODO: confirm tooling and cutting approach."],
            ["Calibration check", "Dimensions are verified at bench against the specification. Stones outside tolerance are evaluated for rework or separated from the parcel."],
            ["IGI submission", "Stones are submitted to IGI for laser inscription and full grading. We do not ship ungraded or self-certified stones."],
            ["Certificate verification", "Returned certificates are matched to each stone. Laser inscription is confirmed under magnification. Grades are cross-checked against specification."],
            ["Dispatch", "Stones verified against their certificates are packed for dispatch with the physical or digital IGI report. Order documentation reconciles report number, inscription, and specification."],
          ].map(([title, desc]) => (
            <article key={title}>
              <div>
                <h3>{title}</h3>
                <p style={{ color: "var(--paper-dim)" }}>{desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <SpecialtyCta />
    </SpecialtyPageShell>
  );
}
