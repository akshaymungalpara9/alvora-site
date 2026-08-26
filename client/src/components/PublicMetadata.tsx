import { useEffect } from "react";
import { applyAvailabilitySeo, applyPublicSeo, type PublicSeoLocale } from "@/lib/publicSeo";

export default function PublicMetadata({ locale, page = "landing" }: { locale: PublicSeoLocale; page?: "landing" | "availability" }) {
  useEffect(() => {
    if (page === "availability") applyAvailabilitySeo(locale);
    else applyPublicSeo(locale);
  }, [locale, page]);
  return null;
}
