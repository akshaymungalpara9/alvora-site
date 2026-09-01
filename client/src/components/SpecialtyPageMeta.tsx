import { useEffect } from "react";
import { applyDocumentMetadata } from "@/lib/publicSeo";

interface Props {
  title: string;
  description: string;
  path: string;
  jsonLd?: object;
}

export default function SpecialtyPageMeta({ title, description, path, jsonLd }: Props) {
  useEffect(() => {
    applyDocumentMetadata({ lang: "en", path, title, description });
    if (!jsonLd) return;
    const id = "specialty-page-jsonld";
    let el = document.getElementById(id) as HTMLScriptElement | null;
    if (!el) {
      el = document.createElement("script");
      el.id = id;
      el.type = "application/ld+json";
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(jsonLd);
  }, [title, description, path, jsonLd]);
  return null;
}
