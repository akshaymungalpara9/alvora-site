import { ArrowUpRight } from "lucide-react";
import { useEffect } from "react";
import { applyDocumentMetadata } from "@/lib/publicSeo";

type LegalPageKind = "privacy" | "terms";

const legalCopy = {
  privacy: {
    eyebrow: "LEGAL / PUBLIC INFORMATION",
    title: "Privacy, in plain trade language.",
    description:
      "Alvora’s privacy notice explains the information collected through production briefs, internal email delivery, privacy-first analytics, and available contact routes.",
    label: "Privacy policy",
    sections: [
      [
        "The information this covers",
        "This policy applies to Alvora’s public website, including production-brief forms. It does not replace account-specific arrangements that may apply if an approved buyer relationship is later established.",
      ],
      [
        "What we collect",
        "When you send a production brief, we collect your name, work email, optional company or workshop, optional trade-contact introduction name, years trading, whether trade references are available, preferred first-order approach, the make you describe, and the market or country context of the form. We also retain the time of the enquiry, follow-up information created by authorised staff, and the result of email-delivery attempts. A signed-in approved account that uses the private introduction link may submit a jeweller name, optional company, work email, market, and note.",
      ],
      [
        "Why we use it",
        "We use this information to understand and respond to a requested make, assess whether an account conversation is appropriate, prepare a quote or production discussion, maintain an internal enquiry record, and protect the security and operation of the service. A saved production brief may receive an immediate acknowledgement and, if no administrator has marked a shortlist as sent, one concise follow-up after at least 24 hours asking for any missing target market, timeline, quantity, or certification detail. Depending on the context, this may involve taking steps you request before a trade relationship and our legitimate interest in operating a secure business-to-business enquiry process.",
      ],
      [
        "Who receives it",
        "Authorised Alvora staff can access production briefs and private account introductions. We use Resend to deliver internal alerts and customer acknowledgement or qualifier emails; it acts as an email-delivery service provider. We also use hosting, database, storage, and authentication providers to operate the site. We do not sell production-brief information or use it for advertising audiences.",
      ],
      [
        "Analytics and cookies",
        "The current public site uses Umami for privacy-first, cookie-free analytics. The configured tracker records standard page-view and in-app navigation measurement, the anonymous whatsapp_click contact event, and non-PII funnel events for production-brief opens, submissions, recorded outcomes, and Insight-page engagement. Those funnel events may include the request type, article slug, CTA placement, source, medium, campaign, landing page, and referring hostname. We do not attach a visitor name, email, company, trade details, CAD, brief text, budget, or phone number to analytics events. We do not load advertising pixels, session replay, or cross-site tracking on the public site, so there is no consent banner in the current release. If non-essential cookies or similar tracking are added, this page and the consent experience will be updated before that technology loads.",
      ],
      [
        "Retention and protection",
        "We keep production-brief information only for as long as needed to respond, manage the trade discussion, protect legal rights, and meet applicable record-keeping obligations. Access is restricted to authorised operational use, and the service uses protected server-side handling for form data and internal alerts. We review retention when the operating process changes.",
      ],
      [
        "Your choices and contact",
        "You may ask to access, correct, erase, restrict, or object to the handling of your personal information where applicable. To make a request, reply through an Alvora trade correspondence or use the production-brief form and state that your message is a privacy request. We will route it to the appropriate operational contact.",
      ],
      [
        "Updates",
        "We will update this page when our data practices, processors, public tracking, or contact routes change. The effective date shown below identifies the current public notice.",
      ],
    ],
  },
  terms: {
    eyebrow: "LEGAL / TRADE ENGAGEMENT",
    title: "Clear terms for a confirmed make.",
    description:
      "Alvora’s trade information explains quote validity, account-confirmed payment terms, dispatch, and the repair-or-replace scope for stones made by Alvora.",
    label: "Terms of trade",
    sections: [
      [
        "Scope",
        "These short terms describe the usual basis on which Alvora discusses and confirms business-to-business production. They apply alongside a confirmed quote, order confirmation, account arrangement, or other written agreement. A written agreement that states otherwise takes priority.",
      ],
      [
        "Quotes",
        "A quote is valid only until the expiry stated in that quote. If no expiry is stated, availability, price, delivery timing, and specification remain subject to Alvora’s written confirmation before an order is accepted.",
      ],
      [
        "Accounts and payment",
        "Payment terms are confirmed per account and per confirmed order. The public site does not publish credit-term numbers. A first order may be used to confirm the make and account process; ongoing trade terms depend on the agreed account arrangement, credit review, and references where applicable.",
      ],
      [
        "Orders and dispatch",
        "A production commitment and dispatch arrangement take effect only after Alvora confirms the relevant order, specification, commercial terms, and delivery details in writing. Dispatch is made on confirmed orders, using the agreed insured delivery method and shipment documentation.",
      ],
      [
        "Specification and certificates",
        "The buyer is responsible for checking that the confirmed specification, certificate reference, delivery location, and quotation detail meet its requirements before order confirmation. Availability, certificate references, and commercial details are confirmed for the relevant order rather than assumed from general website information.",
      ],
      [
        "Assured make: repair or replace",
        "For a stone made by Alvora, the assurance covers the rare case of a verified specification mismatch, chip, or make issue. Alvora will assess the piece and, where the issue falls within this scope, repair or replace it and arrange its return. This is a correction process for Alvora-made stones; applicable commercial remedies are confirmed in the relevant written terms.",
      ],
      [
        "Changes and exclusions",
        "Any timing, logistics, insurance, customs, tax, regulatory-documentation, or account-specific condition that materially affects an order is confirmed in the relevant written quote or order confirmation. Nothing on this public page overrides mandatory law or a written agreement signed by the parties.",
      ],
      [
        "Governing law and jurisdiction",
        "Governing law and jurisdiction, where relevant, are stated in the written agreement, confirmed quote, or order confirmation governing the trade relationship.",
      ],
    ],
  },
} satisfies Record<
  LegalPageKind,
  {
    eyebrow: string;
    title: string;
    description: string;
    label: string;
    sections: [string, string][];
  }
>;

export default function LegalPage({ page }: { page: LegalPageKind }) {
  const content = legalCopy[page];
  const path = page === "privacy" ? "/privacy" : "/terms";

  useEffect(() => {
    applyDocumentMetadata({
      lang: "en",
      path,
      title: `Alvora — ${content.label}`,
      description: content.description,
    });
  }, [content.description, content.label, path]);

  return (
    <div className="legal-shell">
      <header className="legal-header">
        <a className="brand" href="/" aria-label="Alvora home">
          <span className="brand-name">ALVORA</span>
        </a>
        <a className="legal-back" href="/">
          <span>Back to Alvora</span>
          <ArrowUpRight size={15} />
        </a>
      </header>
      <main id="main-content" className="legal-main" tabIndex={-1}>
        <p className="eyebrow eyebrow-bright">
          <span />
          {content.eyebrow}
        </p>
        <h1>{content.title}</h1>
        <p className="legal-intro">
          Effective: 27 August 2026. This page sets out Alvora’s current public
          privacy and trade information. Confirmed orders remain governed by
          their written terms.
        </p>
        <div className="legal-rule" />
        <div className="legal-content">
          {content.sections.map(([heading, body]) => (
            <section key={heading}>
              <h2>{heading}</h2>
              <p>{body}</p>
            </section>
          ))}
        </div>
      </main>
      <footer className="site-footer legal-footer">
        <div className="footer-brand">
          <span className="brand-name">ALVORA</span>
        </div>
        <p>
          Lab-grown diamond manufacturing
          <br />
          Surat, India
        </p>
        <nav className="footer-legal" aria-label="Legal information">
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms of trade</a>
        </nav>
        <a href="#top">
          Top <ArrowUpRight size={15} />
        </a>
      </footer>
    </div>
  );
}
