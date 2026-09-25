import { MessageCircle, Phone, Mail, Clock, Building2 } from "lucide-react";
import { trackWhatsappClick } from "@/lib/ga4";
import { buildWhatsAppHrefWithMessage, WhatsAppInquiry } from "@/lib/whatsapp";
import { COMPANY } from "@shared/companyInfo";
import FastRfqForm from "@/components/FastRfqForm";
import SpecialtyPageMeta from "@/components/SpecialtyPageMeta";
import SpecialtyPageShell from "@/components/SpecialtyPageShell";

const COPY_INTRO =
  "Alvora Diamonds is a lab-grown diamond manufacturer based in Surat, India. Send wholesale enquiries, specification briefs and pricing requests here.";
const COPY_HOURS_NOTE =
  "Same-day on WhatsApp during Surat hours (IST 09:00–19:00); email replies within one business day.";

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
