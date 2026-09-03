import { FormEvent, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { trackRfqSubmit } from "@/lib/ga4";
import { trpc } from "@/lib/trpc";

type SubmissionState = "idle" | "sending" | "sent" | "saved" | "error";

const COUNTRY_TO_MARKET: Record<string, "GLOBAL" | "FR" | "IT" | "US" | "CA"> = {
  US: "US", CA: "CA", FR: "FR", IT: "IT",
};

function mapCountryToMarket(country: string): "GLOBAL" | "FR" | "IT" | "US" | "CA" {
  return COUNTRY_TO_MARKET[country] ?? "GLOBAL";
}

function ConfirmationMessage({ state, onReset }: { state: SubmissionState; onReset: () => void }) {
  if (state === "idle") return null;
  return (
    <p
      className={`form-confirmation form-confirmation-${state}`}
      role={state === "error" ? "alert" : "status"}
      aria-live="polite"
    >
      {state === "sending"
        ? "Recording your enquiry…"
        : state === "sent"
        ? "Thank you. Your enquiry has been recorded and sent to the Alvora team. We will respond with production detail and pricing."
        : state === "saved"
        ? "Thank you. Your enquiry has been safely recorded for the Alvora team. We will respond shortly."
        : <>Your enquiry could not be recorded. Please try again, or{" "}
            <button className="inline-link" onClick={onReset} type="button">reset the form</button>.</>}
    </p>
  );
}

interface FastRfqFormProps {
  headingLevel?: "h2" | "h3";
  headingText?: string;
  onSwitchToQualified?: () => void;
}

export default function FastRfqForm({
  headingLevel: Heading = "h2",
  headingText = "Get price & availability",
  onSwitchToQualified,
}: FastRfqFormProps) {
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const formRef = useRef<HTMLFormElement>(null);

  const submitFastRfq = trpc.productionBrief.submitFastRfq.useMutation({
    onMutate: () => setSubmissionState("sending"),
    onSuccess: (result) => {
      setSubmissionState(result.alertStatus === "sent" ? "sent" : "saved");
      formRef.current?.reset();
    },
    onError: () => setSubmissionState("error"),
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const country = String(values.get("country") || "");
    setSubmissionState("idle");
    submitFastRfq.mutate({
      market: mapCountryToMarket(country),
      website: String(values.get("_website") || ""),
      contactName: String(values.get("name") || "").trim(),
      email: String(values.get("email") || "").trim(),
      company: String(values.get("company") || "").trim() || undefined,
      phone: String(values.get("phone") || "").trim(),
      requirement: String(values.get("requirement") || "").trim(),
    });
    trackRfqSubmit("Fast RFQ", country, "fast_rfq");
  };

  return (
    <>
      <Heading className="rfq-form-heading">{headingText}</Heading>

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
            <span>Company / workshop</span>
            <input
              name="company"
              type="text"
              autoComplete="organization"
              maxLength={180}
              placeholder="Company name"
            />
          </label>
        </div>

        <div className="rfq-row">
          <label>
            <span>WhatsApp / phone *</span>
            <input
              name="phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              minLength={2}
              maxLength={80}
              required
              placeholder="+1 212 555 0100"
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

        <label>
          <span>What do you need? *</span>
          <textarea
            name="requirement"
            minLength={2}
            maxLength={5000}
            rows={5}
            required
            placeholder="Shape, carat weight, colour, clarity, quantity, certification, timeline — or paste your spec sheet."
          />
        </label>

        <div className="form-submit-row">
          <button
            className="button button-signal"
            type="submit"
            disabled={submitFastRfq.isPending}
          >
            {submitFastRfq.isPending
              ? "Sending…"
              : <>Get Price &amp; Availability <ArrowUpRight size={18} /></>}
          </button>
          <p>We respond with per-stone pricing, lead time, and certification options.</p>
        </div>

        <ConfirmationMessage state={submissionState} onReset={() => setSubmissionState("idle")} />
      </form>

      {onSwitchToQualified && (
        <div className="rfq-secondary-link">
          <button className="inline-link" type="button" onClick={onSwitchToQualified}>
            Commission a Specification Make →
          </button>
          <p className="form-qualification-note">
            Calibrated layouts, matched pairs, custom cuts, or a repeat programme tied to a
            documented specification.
          </p>
        </div>
      )}
    </>
  );
}
