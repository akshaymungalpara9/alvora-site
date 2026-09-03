/* COPY: 3.4 — All placeholder strings in this file require content-team review before launch */
import { useState } from "react";
import { MessageCircle, Phone, Mail, Clock, MapPin, Building2 } from "lucide-react";
import { trackWhatsappClick } from "@/lib/ga4";
import { buildWhatsAppHrefWithMessage, WhatsAppInquiry } from "@/lib/whatsapp";
import { COMPANY } from "@shared/companyInfo";
import FastRfqForm from "@/components/FastRfqForm";
import SpecialtyPageMeta from "@/components/SpecialtyPageMeta";
import SpecialtyPageShell from "@/components/SpecialtyPageShell";

/* COPY: 3.4 — replace all COPY_* constants with final approved text */
const COPY_INTRO =
  "[/* COPY: 3.4 */ Introductory sentence: who Alvora is, where the team is based in Surat, and what kinds of enquiries to send here.]";
const COPY_ADDRESS_LINE1 =
  "[/* COPY: 3.4 */ Building name and unit / floor — Diamond World or equivalent, Surat]";
const COPY_ADDRESS_PIN = "[/* COPY: 3.4 */ PIN code]";
const COPY_MAP_ARIA =
  "Map showing the Diamond World area of Surat, Gujarat, India where Alvora operates";
const COPY_MAP_ACTIVATE = "Show map — OpenStreetMap, no cookies";
const COPY_MAP_CAPTION =
  "[/* COPY: 3.4 */ Short note confirming the exact building/unit once address is confirmed.]";
const COPY_HOURS_NOTE =
  "[/* COPY: 3.4 */ Note about same-day WhatsApp response within Surat hours (IST 09:00–19:00) and email response within one business day.]";
const COPY_GST = "[/* COPY: 3.4 */ GST number]";
const COPY_IEC = "[/* COPY: 3.4 */ IEC number]";
const COPY_GJEPC = "[/* COPY: 3.4 */ GJEPC membership status]";

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: COMPANY.legalName,
  address: {
    "@type": "PostalAddress",
    ...(COMPANY.address.street ? { streetAddress: COMPANY.address.street } : {}),
    addressLocality: COMPANY.address.city,
    addressRegion: COMPANY.address.state,
    ...(COMPANY.address.postalCode ? { postalCode: COMPANY.address.postalCode } : {}),
    addressCountry: "IN",
  },
  telephone: COMPANY.phone,
  email: COMPANY.email,
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "09:00",
    closes: "18:00",
  },
  url: `${COMPANY.canonicalOrigin}/contact`,
};

function ContactMap() {
  const [activated, setActivated] = useState(false);

  /* Surat, Gujarat: ~21.195°N 72.830°E — bounding box zoomed to Diamond World / STPL cluster */
  const osmSrc =
    "https://www.openstreetmap.org/export/embed.html?bbox=72.790%2C21.150%2C72.880%2C21.240&layer=mapnik&marker=21.195%2C72.830";

  if (activated) {
    return (
      <div className="contact-map-wrap" aria-label={COPY_MAP_ARIA}>
        <iframe
          src={osmSrc}
          title="Alvora Diamonds — Surat, Gujarat, India"
          className="contact-map-iframe"
          loading="lazy"
          sandbox="allow-scripts allow-same-origin"
          referrerPolicy="no-referrer"
        />
        <p className="contact-map-caption">
          {COPY_MAP_CAPTION}{" "}
          <a
            href="https://www.openstreetmap.org/?mlat=21.195&mlon=72.830#map=14/21.195/72.830"
            target="_blank"
            rel="noreferrer noopener"
            className="contact-map-ext-link"
          >
            Open in OpenStreetMap ↗
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="contact-map-wrap">
      <div
        className="contact-map-placeholder"
        role="img"
        aria-label={COPY_MAP_ARIA}
      >
        <div className="contact-map-placeholder-inner">
          <MapPin size={28} aria-hidden="true" />
          <p>Surat, Gujarat, India</p>
          <button
            className="button button-outline contact-map-activate"
            type="button"
            onClick={() => setActivated(true)}
          >
            {COPY_MAP_ACTIVATE}
          </button>
          <p className="contact-map-privacy-note">
            No map tiles load until you activate — OpenStreetMap, no cookies.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Contact() {
  const waHref = buildWhatsAppHrefWithMessage(COMPANY.whatsappNumber, WhatsAppInquiry);

  return (
    <SpecialtyPageShell>
      <SpecialtyPageMeta
        title="Contact Alvora Diamonds — Surat, India"
        description="Contact the Alvora Diamonds team in Surat for lab-grown diamond wholesale enquiries, pricing, and specification briefs."
        path="/contact"
        jsonLd={JSON_LD}
      />

      <section className="contact-hero" aria-labelledby="contact-title">
        <p className="eyebrow eyebrow-bright"><span />CONTACT · SURAT, INDIA</p>
        <h1 id="contact-title">{COMPANY.legalName}</h1>
        <p className="contact-intro">{COPY_INTRO}</p>
      </section>

      <div className="contact-shell">

        {/* ── Left column: company info ── */}
        <aside className="contact-info-col" aria-label="Contact information">

          <section className="contact-block" aria-labelledby="contact-address-title">
            <h2 id="contact-address-title" className="contact-block-title">
              <MapPin size={15} aria-hidden="true" /> Address
            </h2>
            <address className="contact-address">
              <span>{COPY_ADDRESS_LINE1}</span>
              <span>
                {COMPANY.address.city}, {COMPANY.address.state}
              </span>
              <span>{COPY_ADDRESS_PIN}</span>
              <span>{COMPANY.address.country}</span>
            </address>
            <ContactMap />
          </section>

          <section className="contact-block" aria-labelledby="contact-reach-title">
            <h2 id="contact-reach-title" className="contact-block-title">
              <Phone size={15} aria-hidden="true" /> Phone &amp; messaging
            </h2>
            <dl className="contact-dl">
              <dt>Phone</dt>
              <dd>
                <a href={`tel:${COMPANY.phone.replace(/\s/g, "")}`}>{COMPANY.phone}</a>
              </dd>
              <dt>WhatsApp</dt>
              <dd>
                {waHref ? (
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noreferrer"
                    data-umami-event="whatsapp_contact_page"
                    onClick={() => trackWhatsappClick("contact_page")}
                    className="contact-wa-link"
                  >
                    <MessageCircle size={14} aria-hidden="true" />
                    Message on WhatsApp
                  </a>
                ) : (
                  COMPANY.phone
                )}
              </dd>
              <dt>Email</dt>
              <dd>
                <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
              </dd>
            </dl>
          </section>

          <section className="contact-block" aria-labelledby="contact-hours-title">
            <h2 id="contact-hours-title" className="contact-block-title">
              <Clock size={15} aria-hidden="true" /> Office hours
            </h2>
            <dl className="contact-dl">
              <dt>Days</dt>
              <dd>Monday – Friday</dd>
              <dt>Hours</dt>
              <dd>
                09:00 – 18:00{" "}
                <abbr title="Indian Standard Time, UTC+5:30">IST</abbr>
                {" "}(UTC+5:30)
              </dd>
            </dl>
            <p className="contact-hours-note">{COPY_HOURS_NOTE}</p>
          </section>

          <section className="contact-block" aria-labelledby="contact-company-title">
            <h2 id="contact-company-title" className="contact-block-title">
              <Building2 size={15} aria-hidden="true" /> Company details
            </h2>
            <dl className="contact-dl contact-dl-company">
              <dt>Legal name</dt>
              <dd>{COMPANY.legalName}</dd>
              <dt>
                <abbr title="Goods and Services Tax Identification Number">GSTIN</abbr>
              </dt>
              <dd>{COMPANY.gstin ?? COPY_GST}</dd>
              <dt>
                <abbr title="Import Export Code">IEC</abbr>
              </dt>
              <dd>{COMPANY.iec ?? COPY_IEC}</dd>
              <dt>GJEPC</dt>
              <dd>{COMPANY.gjepcStatus ?? COPY_GJEPC}</dd>
              <dt>Growth methods</dt>
              <dd>{COMPANY.growthMethods.join(", ")}</dd>
              <dt>Certification</dt>
              <dd>{COMPANY.certBodies.join(", ")}</dd>
            </dl>
          </section>

        </aside>

        {/* ── Right column: Fast RFQ form ── */}
        <section className="contact-form-col" aria-labelledby="contact-rfq-title">
          <div className="contact-form-inner">
            <FastRfqForm
              headingLevel="h2"
              headingText="Send a price enquiry"
            />
          </div>
        </section>

      </div>
    </SpecialtyPageShell>
  );
}
