import SpecialtyPageShell, { SpecialtyCta } from "@/components/SpecialtyPageShell";
import SpecialtyPageMeta from "@/components/SpecialtyPageMeta";

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "IGI-Certified Lab-Grown Diamonds",
  serviceType: "Diamond Manufacturing and Certification",
  provider: {
    "@type": "Organization",
    name: "Alvora",
    address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" },
  },
  description:
    "Every Alvora lab-grown diamond is IGI laser-inscribed and verified against the IGI database before dispatch. Certification is part of the make, not an afterthought.",
  areaServed: "Worldwide",
};

export default function Certifications() {
  return (
    <SpecialtyPageShell>
      <SpecialtyPageMeta
        title="IGI-Certified Lab-Grown Diamonds — What Our Certificates Cover"
        description="Every Alvora diamond ships IGI laser-inscribed and database-verified. Understand what each certificate covers — 4Cs, cut quality, laser inscription, and how to verify any report number directly with IGI."
        path="/certifications"
        jsonLd={JSON_LD}
      />

      <section className="specialty-hero" aria-labelledby="cert-title">
        <p className="eyebrow eyebrow-bright"><span />IGI CERTIFICATION · EVERY STONE</p>
        <h1 id="cert-title">IGI Certification<br /><em>at Alvora</em></h1>
        <p className="specialty-hero-copy">
          The certificate is part of the make, not an afterthought. Every Alvora stone is IGI
          laser-inscribed and verified against the IGI database before it leaves our benches. The
          report travels with the stone and is verifiable by any buyer, in any market, in real time.
        </p>
        <p className="hero-maker-line" style={{ marginTop: 32 }}>
          Any stone from Alvora can be placed under a scope, inscription read, and verified against
          the IGI database without contacting us.
        </p>
      </section>

      <section className="specialty-section specialty-section-light" aria-labelledby="cert-what-title">
        <div className="specialty-section-lead">
          <p className="eyebrow"><span />WHAT AN IGI REPORT COVERS</p>
          <h2 id="cert-what-title">What the certificate<br />specifies — and verifies.</h2>
          <p>
            An IGI grading report for a lab-grown diamond specifies the 4Cs — colour grade, clarity
            grade, cut grade (for brilliant cuts), and carat weight — alongside the laser
            inscription number, the report number, and cut quality measurements: table percentage,
            depth percentage, crown angle, pavilion angle, girdle range, finish, and symmetry
            grades. For lab-grown stones, the report also identifies the growth type (HPHT or CVD)
            and states the origin as laboratory-grown.
          </p>
          <p>
            The certificate is the verifiable record that travels with the stone. Report numbers are
            searchable on the IGI verification platform, returning the full grade data for that
            inscription.
          </p>
        </div>

        <div className="specialty-feature-list on-light" style={{ marginTop: 52 }}>
          {[
            ["4Cs", "Colour grade, clarity grade, cut grade (brilliant cuts), and carat weight. Each grade is assigned by IGI laboratory gemologists, not by the manufacturer."],
            ["Laser inscription", "The report number is inscribed on the girdle of the stone by laser. The inscription is visible under magnification and permanently associates the stone with its certificate."],
            ["Cut quality measurements", "Table %, depth %, crown angle, pavilion angle, girdle range, polish, and symmetry grades. These are the measurements that determine how the stone performs optically and how it fits a setting."],
            ["Growth origin", "Lab-grown origin is stated on the certificate. Growth type — HPHT or CVD — is specified. TODO: confirm Alvora's growth type(s)."],
            ["Fluorescence", "Fluorescence grade (None, Faint, Medium, Strong) is stated. Alvora's standard: None on all shipped stones."],
            ["BGM screening", "Brown, grey, and milky quality issues are screened at production. No BGM stones are included in shipped parcels — this is not stated on the certificate but is an Alvora production standard."],
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

      <section className="specialty-section specialty-section-ink" aria-labelledby="cert-process-title">
        <div className="specialty-section-split">
          <div>
            <p className="eyebrow"><span />HOW ALVORA INTEGRATES CERTIFICATION</p>
            <h2 id="cert-process-title">Certification as part<br />of the make.</h2>
            <p>
              We do not submit stones for certification as a separate step after production is
              complete. Certification is integrated into our make process:
            </p>
            <div className="about-process-list" style={{ marginTop: 24, color: "var(--paper)" }}>
              {[
                ["Cut and polish", "Stone is cut and polished to our standard make — Excellent/Ideal, no fluorescence, no BGM."],
                ["IGI submission", "Stone is submitted to IGI for laser inscription and full grading."],
                ["Certificate verification", "Returned certificate is verified against the stone — laser inscription confirmed under magnification, measurements cross-checked."],
                ["Dispatch stock", "Only stones verified against their certificate are moved to dispatch stock."],
                ["Shipment", "Stone dispatches with physical or digital IGI report. Report number, inscription, and certificate are reconciled in the order documentation."],
              ].map(([title, desc]) => (
                <article key={title}>
                  <div>
                    <h3 style={{ color: "var(--paper)" }}>{title}</h3>
                    <p>{desc}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <div>
            <p className="eyebrow"><span />OUR STANDARD GRADING PARAMETERS</p>
            <div className="specialty-feature-list" style={{ marginTop: 16 }}>
              {[
                ["Cut grade", "Excellent or Ideal. TODO: confirm — do we ship Very Good on any stones?"],
                ["Fluorescence", "None. All shipped stones graded None by IGI."],
                ["Colour", "TODO: confirm colour range — e.g., D–H or D–J."],
                ["Clarity", "TODO: confirm clarity range — e.g., VVS1–VS2 or VVS1–SI1."],
                ["Growth type", "TODO: confirm — HPHT, CVD, or both depending on product type."],
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
            <p className="eyebrow" style={{ marginTop: 44 }}><span />WHAT THE CERTIFICATE DOES NOT GUARANTEE</p>
            <p style={{ fontSize: "0.84rem", lineHeight: 1.7, color: "#9fa19a", marginTop: 12 }}>
              A grading report specifies grade at the time of grading. It does not constitute a
              warranty against damage, chipping, or future grading variation. We verify every stone
              against its certificate before dispatch — but we recommend buyers verify the
              inscription-to-certificate match on receipt of any significant parcel.
            </p>
          </div>
        </div>
      </section>

      <SpecialtyCta />
    </SpecialtyPageShell>
  );
}
