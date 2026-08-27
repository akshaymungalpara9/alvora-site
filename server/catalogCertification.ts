type CertificateInput = {
  lab: string | null | undefined;
  reportNumber: string | null | undefined;
  verifyUrl: string | null | undefined;
};

function isHostOrSubdomain(hostname: string, domain: string) {
  const normalized = hostname.toLowerCase();
  return normalized === domain || normalized.endsWith(`.${domain}`);
}

/** A certificate action is public only when it resolves to the named lab and report. */
export function hasTrustedCertificateLink({ lab, reportNumber, verifyUrl }: CertificateInput) {
  const normalizedLab = lab?.trim().toUpperCase();
  const certificate = reportNumber?.trim();
  if (!certificate || !verifyUrl || (normalizedLab !== "IGI" && normalizedLab !== "GIA")) return false;

  try {
    const parsed = new URL(verifyUrl);
    const trustedHost = normalizedLab === "IGI"
      ? isHostOrSubdomain(parsed.hostname, "igi.org")
      : isHostOrSubdomain(parsed.hostname, "gia.edu");
    return trustedHost && parsed.href.includes(certificate);
  } catch {
    return false;
  }
}

/** Workshop viewer links are retained in protected source records but are not public proof media. */
export function isWorkshopViewerUrl(value: string | null | undefined) {
  if (!value) return false;
  try {
    return isHostOrSubdomain(new URL(value).hostname, "workshop.360view.link");
  } catch {
    return false;
  }
}
