import { useEffect } from "react";
import JewelleryShell from "@/components/jewellery/JewelleryShell";
import EnquiryForm from "@/components/jewellery/EnquiryForm";
import { CONSULTATION_META } from "@shared/jewellery/seo";
import { COMPANY } from "@shared/companyInfo";
import { applyJewellerySeo } from "@/lib/jewellerySeo";
import { buildWhatsAppHrefWithMessage } from "@/lib/whatsapp";
import "./jewellery-pages.css";

export default function ConsultationPage() {
  useEffect(() => {
    applyJewellerySeo("/book-a-consultation", CONSULTATION_META.title, CONSULTATION_META.description);
  }, []);
  const whatsappHref = buildWhatsAppHrefWithMessage(COMPANY.whatsappNumber, "Hello Alvora, I'd like to book a jewellery consultation.");

  return (
    <JewelleryShell>
      <section className="jb">
        <div className="jb-copy">
          <p className="jw-eyebrow">Consultation</p>
          <h1 className="jw-display">Choose your ring with <em>us</em>, not alone.</h1>
          <p className="jw-lede">A free, unhurried conversation by video, WhatsApp or phone with someone who knows diamonds from the bench up.</p>
          <ol className="jb-list">
            <li>
              <span>01</span>
              <div>
                <strong>Tell us what you love</strong>
                <p>A shape, a setting, a photo you saved, or simply a budget and an occasion.</p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <strong>We show you real options</strong>
                <p>Pieces from the collection, with stone sizes and gold colours compared side by side.</p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <strong>You get a written price</strong>
                <p>For your exact selection and size. Take your time; nothing is made until you confirm.</p>
              </div>
            </li>
          </ol>
        </div>
        <div className="jb-form">
          <h2>Request a consultation</h2>
          <EnquiryForm kind="consultation" idPrefix="consult" />
          {whatsappHref ? (
            <p className="jb-alt">
              Prefer to message? <a href={whatsappHref} target="_blank" rel="noreferrer">Chat with us on WhatsApp</a>.
            </p>
          ) : null}
        </div>
      </section>
    </JewelleryShell>
  );
}
