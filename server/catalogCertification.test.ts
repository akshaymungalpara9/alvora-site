import { describe, expect, it } from "vitest";
import { hasTrustedCertificateLink, isWorkshopViewerUrl } from "./catalogCertification";

describe("public catalogue certificate eligibility", () => {
  it("accepts only a matching certificate number on the named official IGI or GIA host", () => {
    expect(hasTrustedCertificateLink({ lab: "IGI", reportNumber: "821663473", verifyUrl: "https://api.igi.org/viewpdf.php?r=821663473" })).toBe(true);
    expect(hasTrustedCertificateLink({ lab: "GIA", reportNumber: "1525179485", verifyUrl: "https://www.gia.edu/report-check?reportno=1525179485" })).toBe(true);
    expect(hasTrustedCertificateLink({ lab: "IGI", reportNumber: "821663473", verifyUrl: "https://www.igi.org/" })).toBe(false);
    expect(hasTrustedCertificateLink({ lab: "IGI", reportNumber: "821663473", verifyUrl: "https://example.org/report/821663473" })).toBe(false);
    expect(hasTrustedCertificateLink({ lab: "IGI", reportNumber: "821663473", verifyUrl: "https://api.igi.org/viewpdf.php?r=000000000" })).toBe(false);
  });

  it("identifies workshop 360° URLs so they can remain source-held but be omitted publicly", () => {
    expect(isWorkshopViewerUrl("https://workshop.360view.link/360viewer/360view.html?d=ST-001")).toBe(true);
    expect(isWorkshopViewerUrl("https://viewer.example/ST-001")).toBe(false);
    expect(isWorkshopViewerUrl(null)).toBe(false);
  });
});
