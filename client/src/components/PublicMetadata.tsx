import { useEffect } from "react";
import { applyPublicSeo, type PublicSeoLocale } from "@/lib/publicSeo";

export default function PublicMetadata({ locale }: { locale: PublicSeoLocale }) {
  useEffect(() => {
    applyPublicSeo(locale);
  }, [locale]);
  return null;
}
