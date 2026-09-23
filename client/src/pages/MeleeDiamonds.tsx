import SpecialtyPageShell, { SpecialtyCta } from "@/components/SpecialtyPageShell";
import SpecialtyPageMeta from "@/components/SpecialtyPageMeta";

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Wholesale Lab-Grown Melee Diamonds",
  serviceType: "Diamond Manufacturing",
  provider: {
    "@type": "Organization",
    name: "Alvora",
    address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" },
  },
  description:
    "Wholesale lab-grown melee diamonds from Alvora — Excellent cut, no fluorescence, no BGM, calibrated to consistent diameter ranges for pave, eternity, and halo programmes.",
  areaServed: "Worldwide",
};

export default function MeleeDiamonds() {
  return (
    <SpecialtyPageShell>
      <SpecialtyPageMeta
        title="Wholesale Lab-Grown Melee Diamonds | Alvora Diamonds"
        description="Alvora supplies wholesale lab-grown melee diamonds calibrated to consistent diameter ranges. Excellent cut, no fluorescence, no BGM — the same standard applied to every stone regardless of size."
        path="/melee-diamonds"
        jsonLd={JSON_LD}
      />

      <section className="specialty-hero" aria-labelledby="mel-title">
        <p className="eyebrow eyebrow-bright"><span />MELEE DIAMONDS · WHOLESALE · SURAT</p>
        <h1 id="mel-title">Wholesale Lab-Grown<br /><em>Melee Diamonds</em></h1>
        <p className="specialty-hero-copy">
          Melee from the bench — the same standard applied to every stone regardless of size.
          Calibrated to consistent diameter ranges. Excellent cut grade. No fluorescence. No BGM.
          The quality that protects the finished piece across its full surface area.
        </p>
        <p className="hero-maker-line" style={{ marginTop: 32 }}>
          A weak accent stone is visible to the customer regardless of how exceptional the centre
          stone is. We do not lower the standard for size.
        </p>
      </section>

      <section className="specialty-section specialty-section-light" aria-labelledby="mel-standard-title">
        <div className="specialty-section-lead">
          <p className="eyebrow"><span />THE CASE FOR QUALITY MELEE</p>
          <h2 id="mel-standard-title">Same standard.<br />Every size.</h2>
          <p>
            In the trade, melee refers to small brilliant-cut diamonds — typically under 0.20 carat
            — used as accent stones in pave settings, eternity bands, halo arrangements, and
            side-stone programmes. The quality standard applied to melee is often lower than what
            buyers apply to centre stones. At Alvora, it is not.
          </p>
          <p>
            The case is straightforward: a halo or a pave band is visible to the customer at the
            same moment as the centre stone. If the accent stones read milky, flat, or uneven in
            size, the finished piece fails the customer regardless of what the centre stone GIA
            report says. Consistent, high-cut-grade melee means the setting performs across its
            full surface area.
          </p>
          <p>
            We cut melee to Excellent cut grade, select for no fluorescence and no BGM, and
            calibrate each parcel to a consistent diameter range. There is no separate melee
            production standard at Alvora — only the Alvora standard applied to a smaller stone.
          </p>
        </div>

        <div className="specialty-feature-list on-light" style={{ marginTop: 60 }}>
          {[
            ["Cut grade", "Excellent on every stone. Cut grade is assessed per stone, not per parcel average."],
            ["Fluorescence", "None. Not screened-out-and-replaced — selected to None from production."],
            ["BGM", "None. No brown, grey, or milky inclusions. Consistent face-up appearance across the parcel."],
            ["Calibration", "Stones selected to consistent diameter ranges so they fit the seat without adjustment at the bench. TODO: confirm specific size ranges — e.g., 1.0 mm, 1.2 mm, 1.5 mm, 1.8 mm, 2.0 mm, 2.3 mm."],
            ["Colour and clarity", "To your specified range. We do not mix colour or clarity grades within a parcel without agreement."],
            ["Certification", "IGI per parcel with a master report. TODO: confirm IGI melee certification scope and process."],
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

      <section className="specialty-section specialty-section-ink" aria-labelledby="mel-use-title">
        <div className="specialty-section-split">
          <div>
            <p className="eyebrow"><span />PROGRAMMES AND APPLICATIONS</p>
            <h2 id="mel-use-title">Where melee quality<br />determines the outcome.</h2>
            <p>
              Pave settings, shared-prong bands, and halo arrangements are the most quality-sensitive
              melee applications — every stone in the setting is exposed. Eternity bands are worse:
              every stone is a centre stone by position. A mixed-quality melee parcel does not hide
              in these settings.
            </p>
            <ul className="specialty-plain-list">
              <li>Pave and micropave engagement rings</li>
              <li>Eternity bands — full and half bands</li>
              <li>Halo arrangements around centre stones</li>
              <li>Channel-set accent rows</li>
              <li>Side stones in three-stone settings</li>
              <li>Mixed-stone layouts where melee and larger stones read together</li>
            </ul>
          </div>
          <div>
            <p className="eyebrow"><span />ORDERING MELEE</p>
            <h2 style={{ fontSize: "clamp(1.6rem, 2.4vw, 2.6rem)", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 20 }}>
              Specify the size.<br />We hold to it.
            </h2>
            <p>
              Melee parcels are ordered by diameter range, colour range, and clarity range. Minimum
              parcel sizes and pricing are confirmed with your quotation.{" "}
              <span className="specialty-todo">[TODO: confirm minimum order quantities]</span>
            </p>
            <p>
              Mixed-size parcels for specific setting configurations — where a designer needs two
              different diameter stones in the same piece — are available on request. State the
              diameter ranges and the split by proportion in your enquiry.
            </p>
            <p>
              Lead time:{" "}
              <strong>5–10 working days</strong>{" "}
              <span className="specialty-todo">[TODO: confirm for melee parcels]</span>{" "}
              from specification sign-off, depending on parcel size and calibration requirements.
            </p>
          </div>
        </div>
      </section>

      <SpecialtyCta />
    </SpecialtyPageShell>
  );
}
