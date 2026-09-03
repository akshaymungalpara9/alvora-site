import { FormEvent, useRef, useState } from "react";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import { trackRfqSubmit, trackWhatsappClick } from "@/lib/ga4";
import { trpc } from "@/lib/trpc";
import { buildWhatsAppHref } from "@/lib/whatsapp";
import SpecialtyPageMeta from "@/components/SpecialtyPageMeta";
import SpecialtyPageShell from "@/components/SpecialtyPageShell";

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Request a Quote — Alvora Lab-Grown Diamonds",
  serviceType: "Diamond Manufacturing",
  provider: {
    "@type": "Organization",
    name: "Alvora",
    address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" },
  },
  description:
    "Submit a production enquiry to Alvora — describe the specification, quantity, certification requirement, and timeline. We respond with practical production detail and pricing.",
  areaServed: "Worldwide",
};

const COUNTRY_TO_MARKET: Record<string, "GLOBAL" | "FR" | "IT" | "US" | "CA"> = {
  US: "US",
  CA: "CA",
  FR: "FR",
  IT: "IT",
};

function mapCountryToMarket(country: string): "GLOBAL" | "FR" | "IT" | "US" | "CA" {
  return COUNTRY_TO_MARKET[country] ?? "GLOBAL";
}

const PRODUCT_TO_REQUEST_TYPE: Record<string, string> = {
  "Loose diamonds (standard)": "Production run",
  "Calibrated diamond layouts": "Matched layout / calibrated parcel",
  "Matched pairs": "Matched layout / calibrated parcel",
  "Custom-cut (to exact specification)": "Custom / made-to-spec.",
  "Melee diamonds": "Production run",
  "Other / not sure": "Production run",
};

export default function RequestAQuote() {
  const [submissionState, setSubmissionState] = useState<"idle" | "sending" | "sent" | "saved" | "error">("idle");
  const formRef = useRef<HTMLFormElement>(null);
  const pendingTracking = useRef<{ productInterest: string; country: string } | null>(null);
  const waHref = buildWhatsAppHref(import.meta.env.VITE_ALVORA_WHATSAPP_NUMBER);

  const submitProductionBrief = trpc.productionBrief.submit.useMutation({
    onMutate: () => setSubmissionState("sending"),
    onSuccess: (result) => {
      setSubmissionState(result.alertStatus === "sent" ? "sent" : "saved");
      if (pendingTracking.current) {
        trackRfqSubmit(pendingTracking.current.productInterest, pendingTracking.current.country);
        pendingTracking.current = null;
      }
      formRef.current?.reset();
    },
    onError: () => setSubmissionState("error"),
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);

    const productInterest = String(values.get("product_interest") || "");
    const caratQuantity = String(values.get("carat_quantity") || "").trim();
    const certificationReq = String(values.get("certification_req") || "");
    const timeline = String(values.get("timeline") || "");
    const message = String(values.get("message") || "").trim();

    const briefParts = [
      `Product interest: ${productInterest}`,
      caratQuantity ? `Quantity / carat weight: ${caratQuantity}` : null,
      `Certification requirement: ${certificationReq}`,
      `Timeline: ${timeline}`,
      message ? `\nAdditional details:\n${message}` : null,
    ].filter(Boolean);
    const brief = briefParts.join("\n");

    const country = String(values.get("country") || "");
    const yearsTrading = String(values.get("years_trading") || "2–5") as "Under 2" | "2–5" | "5–10" | "10+";
    const tradeRef = String(values.get("trade_references") || "Yes") as "Yes" | "No";
    const payment = String(values.get("preferred_payment_approach") || "Open to discussion") as "Prepaid on proforma" | "Agreed trade terms subject to credit check" | "Open to discussion";

    pendingTracking.current = { productInterest, country };
    setSubmissionState("idle");
    submitProductionBrief.mutate({
      requestType: PRODUCT_TO_REQUEST_TYPE[productInterest] ?? "Production run",
      market: mapCountryToMarket(country),
      website: String(values.get("_website") || ""),
      contactName: String(values.get("name") || "").trim(),
      email: String(values.get("email") || "").trim(),
      company: String(values.get("company") || "").trim() || undefined,
      yearsTrading,
      tradeReferencesAvailable: tradeRef,
      preferredPaymentApproach: payment,
      referrerName: String(values.get("referrer_name") || "").trim() || undefined,
      brief,
    });
  };

  return (
    <SpecialtyPageShell>
      <SpecialtyPageMeta
        title="Request a Quote — Alvora Lab-Grown Diamonds"
        description="Submit a production enquiry to Alvora — describe the specification, quantity, certification requirement, and timeline. We respond with practical production detail and pricing."
        path="/request-a-quote"
        jsonLd={JSON_LD}
      />

      <div className="rfq-shell">
        <aside className="rfq-sidebar">
          <p className="eyebrow eyebrow-bright"><span />PRODUCTION ENQUIRY</p>
          <h1>Request<br />a Quote.</h1>
          <p>
            Tell us the programme, profile, or specification you need. We will return with the
            practical production detail — lead time, per-stone pricing, certification scope, and
            dispatch arrangement.
          </p>
          <div className="rfq-sidebar-meta">
            <article>
              <strong>Lead time</strong>
              <p>
                Standard production: typically available from bench stock or within 5–10 working
                days. Custom cuts and matched pairs: 5–14 working days from specification sign-off.{" "}
                <span className="specialty-todo">[TODO: confirm]</span>
              </p>
            </article>
            <article>
              <strong>Certification</strong>
              <p>
                All Alvora stones are IGI laser-inscribed. Per-stone certificates and per-parcel
                master reports are available — confirm your requirement in the form.
              </p>
            </article>
            <article>
              <strong>Payment terms</strong>
              <p>
                We work with established jewellers and ateliers on flexible trade terms. First orders
                confirm the make; ongoing accounts move to agreed terms after credit and reference
                checks.
              </p>
            </article>
            {waHref && (
              <article>
                <strong>Prefer to message?</strong>
                <p style={{ marginBottom: 12 }}>
                  Reach us directly on WhatsApp for urgent enquiries or quick availability
                  questions.
                </p>
                <a
                  className="button button-outline"
                  href={waHref}
                  target="_blank"
                  rel="noreferrer"
                  data-umami-event="whatsapp_rfq_sidebar"
                  style={{ fontSize: "0.63rem", minHeight: 40 }}
                  onClick={() => trackWhatsappClick('rfq_sidebar')}
                >
                  WhatsApp Us <MessageCircle size={15} strokeWidth={1.6} />
                </a>
              </article>
            )}
          </div>
        </aside>

        <div className="rfq-form-area">
          <h2>Production enquiry</h2>

          <form ref={formRef} className="brief-form" onSubmit={handleSubmit}>
            <div className="honeypot-field" aria-hidden="true">
              <label>
                Website
                <input name="_website" type="text" tabIndex={-1} autoComplete="off" />
              </label>
            </div>

            <div className="rfq-row">
              <label>
                <span>Your name *</span>
                <input
                  name="name"
                  type="text"
                  autoComplete="name"
                  minLength={2}
                  maxLength={180}
                  required
                  placeholder="Name"
                />
              </label>
              <label>
                <span>Work email *</span>
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  maxLength={320}
                  required
                  placeholder="name@company.com"
                />
              </label>
            </div>

            <div className="rfq-row">
              <label>
                <span>Company / workshop</span>
                <input
                  name="company"
                  type="text"
                  autoComplete="organization"
                  maxLength={180}
                  placeholder="Company name"
                />
              </label>
              <label>
                <span>Country *</span>
                <select name="country" autoComplete="country" required defaultValue="">
                  <option value="" disabled>Select country…</option>
                  <optgroup label="Key markets">
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="FR">France</option>
                    <option value="IT">Italy</option>
                    <option value="GB">United Kingdom</option>
                    <option value="AU">Australia</option>
                    <option value="DE">Germany</option>
                    <option value="AE">United Arab Emirates</option>
                    <option value="IN">India</option>
                  </optgroup>
                  <optgroup label="Other">
                    <option value="OTHER">Other</option>
                  </optgroup>
                </select>
              </label>
            </div>

            <label>
              <span>Product interest *</span>
              <select name="product_interest" required defaultValue="">
                <option value="" disabled>Select product type…</option>
                <option>Loose diamonds (standard)</option>
                <option>Calibrated diamond layouts</option>
                <option>Matched pairs</option>
                <option>Custom-cut (to exact specification)</option>
                <option>Melee diamonds</option>
                <option>Other / not sure</option>
              </select>
            </label>

            <label>
              <span>Carat weight / quantity</span>
              <input
                name="carat_quantity"
                type="text"
                maxLength={300}
                placeholder="e.g. 1.00 ct round, ×20 pieces — or describe the parcel"
              />
            </label>

            <div className="rfq-row">
              <label>
                <span>Certification requirement</span>
                <select name="certification_req" defaultValue="IGI required">
                  <option>IGI required</option>
                  <option>IGI preferred</option>
                  <option>No preference</option>
                </select>
              </label>
              <label>
                <span>Timeline</span>
                <select name="timeline" defaultValue="1–2 weeks">
                  <option>Immediate (in stock / urgent)</option>
                  <option>1–2 weeks</option>
                  <option>1 month</option>
                  <option>Flexible</option>
                </select>
              </label>
            </div>

            <div className="rfq-row">
              <label>
                <span>Years trading</span>
                <select name="years_trading" defaultValue="2–5">
                  <option>Under 2</option>
                  <option>2–5</option>
                  <option>5–10</option>
                  <option>10+</option>
                </select>
              </label>
              <label>
                <span>Trade references available on request</span>
                <select name="trade_references" defaultValue="Yes">
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </label>
            </div>

            <label>
              <span>Preferred payment approach for a first order</span>
              <select name="preferred_payment_approach" defaultValue="Open to discussion">
                <option>Prepaid on proforma</option>
                <option>Agreed trade terms subject to credit check</option>
                <option>Open to discussion</option>
              </select>
            </label>

            <label>
              <span>Introduced by a trade contact? <em>(optional)</em></span>
              <input
                name="referrer_name"
                type="text"
                maxLength={180}
                placeholder="Name of the introducing contact"
              />
            </label>

            <p className="form-qualification-note">
              These details are used only to assess the right account approach for your enquiry.
            </p>

            <label>
              <span>Message — specification, shape, dimensions, or any context useful to the make</span>
              <textarea
                name="message"
                maxLength={4500}
                rows={5}
                placeholder="Shape, dimensions, ratios, finish, colour range, clarity range, or anything already decided at your bench."
              />
            </label>

            <div className="form-submit-row">
              <button
                className="button button-signal"
                type="submit"
                disabled={submitProductionBrief.isPending}
              >
                {submitProductionBrief.isPending
                  ? "Sending enquiry…"
                  : <>Send enquiry <ArrowUpRight size={18} /></>}
              </button>
              <p>We use this information only to understand the make you require.</p>
            </div>

            {submissionState !== "idle" && (
              <p
                className={`form-confirmation form-confirmation-${submissionState}`}
                role={submissionState === "error" ? "alert" : "status"}
                aria-live="polite"
              >
                {submissionState === "sending"
                  ? "Recording your enquiry…"
                  : submissionState === "sent"
                  ? "Thank you. Your enquiry has been recorded and sent to the Alvora team. We will respond with production detail and pricing."
                  : submissionState === "saved"
                  ? "Thank you. Your enquiry has been safely recorded for the Alvora team. We will respond shortly."
                  : "Your enquiry could not be recorded. Please try again, or contact Alvora directly on WhatsApp."}
              </p>
            )}
          </form>
        </div>
      </div>
    </SpecialtyPageShell>
  );
}
