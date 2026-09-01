import SpecialtyPageShell, { SpecialtyCta } from "@/components/SpecialtyPageShell";
import SpecialtyPageMeta from "@/components/SpecialtyPageMeta";

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Matched Pair Lab-Grown Diamonds",
  serviceType: "Diamond Manufacturing",
  provider: {
    "@type": "Organization",
    name: "Alvora",
    address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" },
  },
  description:
    "Matched pair lab-grown diamonds from Alvora — matched for colour, dimensions, cut grade, and proportions so they read as one stone in the finished piece.",
  areaServed: "Worldwide",
};

export default function MatchedPairDiamonds() {
  return (
    <SpecialtyPageShell>
      <SpecialtyPageMeta
        title="Matched Pair Lab-Grown Diamonds, Made to Tolerance | Alvora"
        description="Alvora makes matched pairs of lab-grown diamonds — matched for colour, dimensions, and cut grade so they read as one stone in the finished piece. Direct from our benches in Surat."
        path="/matched-pair-diamonds"
        jsonLd={JSON_LD}
      />

      <section className="specialty-hero" aria-labelledby="mpd-title">
        <p className="eyebrow eyebrow-bright"><span />MATCHED PAIRS · SURAT MANUFACTURE</p>
        <h1 id="mpd-title">Matched Pair<br /><em>Lab-Grown Diamonds</em></h1>
        <p className="specialty-hero-copy">
          Two stones that read as one. Matched pairs are the hardest single line item in a
          jeweller's brief — and the one where calibration failures are most visible to the
          customer. We cut from aligned rough and select after cutting.
        </p>
        <p className="hero-maker-line" style={{ marginTop: 32 }}>
          A matched pair is not two stones of the same grade ticket. It is two stones a buyer and
          their customers cannot distinguish when set opposite each other.
        </p>
      </section>

      <section className="specialty-section specialty-section-light" aria-labelledby="mpd-what-title">
        <div className="specialty-section-lead">
          <p className="eyebrow"><span />WHAT MATCHING MEANS</p>
          <h2 id="mpd-what-title">Matched for colour,<br />dimension, and return.</h2>
          <p>
            The real work in a matched pair is not colour grade — it is matching dimensions,
            proportions, and the way light returns from each stone so that when a jeweller sets them
            into an earring or a two-stone ring, the piece reads as symmetrical and intentional.
            Colour within one grade step is the table stake. The pair must also match in crown
            height, pavilion depth, and face-up appearance.
          </p>
          <p>
            Alvora matches pairs to:
          </p>
        </div>

        <div className="specialty-feature-list on-light" style={{ marginTop: 40 }}>
          {[
            ["Colour", "Colour grade within one step. TODO: confirm — e.g., E/F or F/G range held across the pair."],
            ["Dimensions", "Girdle diameter matched within tolerance. TODO: confirm tolerance — target ±0.05 mm or ±0.1 mm."],
            ["Table and depth", "Table and total depth percentages matched so crown height and pavilion depth are consistent."],
            ["Crown angle", "Crown angles matched within tolerance. TODO: confirm angular tolerance."],
            ["Cut grade", "Excellent or Very Good on each stone — stated per pair."],
            ["Fluorescence", "None on either stone. No BGM. These are not relaxed for pairs."],
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
      </section>

      <section className="specialty-section specialty-section-ink" aria-labelledby="mpd-apps-title">
        <div className="specialty-section-split">
          <div>
            <p className="eyebrow"><span />APPLICATIONS</p>
            <h2 id="mpd-apps-title">Where matched pairs<br />make the piece.</h2>
            <p>
              Matched pairs matter most where the customer sees both stones simultaneously and can
              compare them directly. An asymmetric pair in a drop earring or a two-stone ring is not
              a subtle defect — it is the first thing the eye finds.
            </p>
            <ul className="specialty-plain-list">
              <li>Earring pairs — drop, stud, halo</li>
              <li>Two-stone engagement rings and toi-et-moi settings</li>
              <li>Anniversary bands — shoulder stones flanking a centre</li>
              <li>Three-stone rings where both flanking stones must match</li>
              <li>Matched pairs for resale, packed together with a pair reference</li>
            </ul>
          </div>
          <div>
            <p className="eyebrow"><span />OUR PROCESS</p>
            <h2 style={{ fontSize: "clamp(1.6rem, 2.4vw, 2.6rem)", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 20 }}>
              Cut together.<br />Selected together.
            </h2>
            <p>
              We assess rough for matched pairs from the outset — selecting rough that yields
              consistent proportions before we begin cutting. After cutting, pairs are placed
              together, measured, and assessed for face-up appearance under consistent lighting
              before acceptance.
            </p>
            <p>
              Pairs that drift outside tolerance at any measurement point are separated and replaced
              rather than shipped as a matched set. Lead time:{" "}
              <strong>7–14 working days</strong>{" "}
              <span className="specialty-todo">[TODO: confirm]</span> from specification sign-off.
            </p>
            <p>
              IGI certification is included. Each stone receives its own laser inscription and
              report. The pair reference is noted in your order documentation.
            </p>
          </div>
        </div>
      </section>

      <SpecialtyCta />
    </SpecialtyPageShell>
  );
}
