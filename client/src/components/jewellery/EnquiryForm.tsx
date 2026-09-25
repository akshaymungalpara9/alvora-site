import { useState, type FormEvent } from "react";
import { ArrowRight, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { landingContext, trackConversion } from "@/lib/ga4";
import type { JewelleryPiece } from "@shared/jewellery/catalog";

export type PieceSelection = {
  metal?: "Yellow gold" | "White gold" | "Rose gold" | "Silver" | "Platinum";
  karat?: "10K" | "14K" | "18K";
  caratWeight?: string;
  ringSize?: string;
};

type Props = {
  kind: "piece" | "consultation";
  piece?: Pick<JewelleryPiece, "code" | "name">;
  selection?: PieceSelection;
  /** Id prefix so two forms on one page keep unique label associations. */
  idPrefix?: string;
};

const CONTACT_OPTIONS = [
  { value: "email", label: "Email" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "phone", label: "Phone" },
] as const;

type ContactPreference = (typeof CONTACT_OPTIONS)[number]["value"];

export default function EnquiryForm({ kind, piece, selection = {}, idPrefix = "jw" }: Props) {
  const [preferredContact, setPreferredContact] = useState<ContactPreference>(kind === "consultation" ? "whatsapp" : "email");
  const submit = trpc.jewellery.submit.useMutation({
    onSuccess: () => trackConversion(kind === "consultation" ? "consultation_request" : "jewellery_enquiry", piece ? { piece_code: piece.code } : {}),
  });
  const id = (name: string) => `${idPrefix}-${name}`;

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const text = (name: string) => String(values.get(name) ?? "").trim() || undefined;
    submit.mutate({
      kind,
      website: String(values.get("_website") ?? ""),
      pieceCode: piece?.code,
      ...selection,
      contactName: text("name") ?? "",
      email: text("email") ?? "",
      phone: text("phone"),
      country: text("country"),
      preferredContact,
      preferredTime: text("preferred_time"),
      budget: text("budget"),
      message: text("message"),
      ...landingContext(),
    });
  };

  if (submit.isSuccess) {
    return (
      <div className="jw-form-done" role="status">
        <Check size={22} strokeWidth={1.5} aria-hidden="true" />
        <h3>Thank you, we have your {kind === "consultation" ? "request" : "enquiry"}.</h3>
        <p>
          We reply within one working day{kind === "piece" ? " with a written price for your selection" : " to arrange a time"}. A confirmation is on its way to your inbox.
        </p>
      </div>
    );
  }

  return (
    <form className="jw-form" onSubmit={onSubmit} noValidate={false}>
      {piece ? (
        <p className="jw-form-piece">
          <span>{piece.name}</span>
          <span>{[selection.karat, selection.metal?.toLowerCase(), selection.caratWeight ? `${selection.caratWeight} ct` : null, selection.ringSize ? `size ${selection.ringSize}` : null].filter(Boolean).join(" · ") || piece.code}</span>
        </p>
      ) : null}
      <div className="jw-form-row">
        <label htmlFor={id("name")}>
          <span>Name</span>
          <input id={id("name")} name="name" required minLength={2} maxLength={180} autoComplete="name" />
        </label>
        <label htmlFor={id("email")}>
          <span>Email</span>
          <input id={id("email")} name="email" type="email" required maxLength={320} autoComplete="email" inputMode="email" />
        </label>
      </div>
      <div className="jw-form-row">
        <label htmlFor={id("phone")}>
          <span>Phone or WhatsApp <small>optional</small></span>
          <input id={id("phone")} name="phone" type="tel" maxLength={80} autoComplete="tel" inputMode="tel" />
        </label>
        <label htmlFor={id("country")}>
          <span>Country <small>optional</small></span>
          <input id={id("country")} name="country" maxLength={80} autoComplete="country-name" />
        </label>
      </div>
      <fieldset className="jw-form-choice">
        <legend>How should we reach you?</legend>
        <div>
          {CONTACT_OPTIONS.map((option) => (
            <label key={option.value} className={preferredContact === option.value ? "is-selected" : undefined}>
              <input type="radio" name="preferred_contact" value={option.value} checked={preferredContact === option.value} onChange={() => setPreferredContact(option.value)} />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>
      {kind === "consultation" ? (
        <div className="jw-form-row">
          <label htmlFor={id("preferred_time")}>
            <span>Best days and times <small>optional</small></span>
            <input id={id("preferred_time")} name="preferred_time" maxLength={160} placeholder="e.g. weekday evenings, UK time" />
          </label>
          <label htmlFor={id("budget")}>
            <span>Budget <small>optional</small></span>
            <input id={id("budget")} name="budget" maxLength={60} placeholder="e.g. around $2,000" />
          </label>
        </div>
      ) : null}
      <label htmlFor={id("message")}>
        <span>{kind === "consultation" ? "What are you looking for?" : "Anything we should know?"} <small>optional</small></span>
        <textarea id={id("message")} name="message" rows={4} maxLength={3000} placeholder={kind === "consultation" ? "The style, shape or occasion you have in mind" : "Engraving, a date you need it by, questions about the stone"} />
      </label>
      <div className="jw-form-honeypot" aria-hidden="true">
        <label htmlFor={id("website")}>Website</label>
        <input id={id("website")} name="_website" tabIndex={-1} autoComplete="off" />
      </div>
      <button type="submit" className="jw-button jw-form-submit" disabled={submit.isPending}>
        {submit.isPending ? "Sending…" : kind === "consultation" ? "Request a consultation" : "Send enquiry"} <ArrowRight size={15} strokeWidth={1.6} />
      </button>
      {submit.isError ? (
        <p className="jw-form-error" role="alert">
          Sorry, that did not send. Please try again or message us on WhatsApp.
        </p>
      ) : null}
      <p className="jw-form-note">No payment is taken now. We confirm price and timing in writing first.</p>
    </form>
  );
}
