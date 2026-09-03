export interface CompanyInfo {
  legalName: string;
  foundingYear: number;
  address: {
    street: string | null;
    city: string;
    state: string;
    postalCode: string | null;
    country: string;
  };
  gstin: null;
  iec: null;
  gjepcStatus: null;
  phone: string;
  whatsappNumber: string;
  email: string;
  growthMethods: string[];
  certBodies: string[];
  moq: {
    stock: string;
    layouts: string;
    pairs: string;
    customCuts: string;
    melee: string;
  };
  tolerance: {
    calibrated: string;
    pairs: string;
  };
  leadTime: {
    stock: string;
    bespoke: string;
  };
  paymentTerms: string;
  marketsServed: string[];
  founders: null;
  monthlyCapacity: string | null;
  canonicalOrigin: string;
}

export const COMPANY: CompanyInfo = Object.freeze({
  legalName: "Alvora Diamonds",
  foundingYear: 2000,
  address: Object.freeze({
    street: null,         // BLOCKED — Diamond World unit number not yet confirmed
    city: "Surat",
    state: "Gujarat",
    postalCode: null,     // BLOCKED — PIN not yet confirmed
    country: "India",
  }),
  gstin: null,
  iec: null,
  gjepcStatus: null,
  phone: "+91 99244 90125",
  whatsappNumber: "919924490125",
  email: "akshaym@alvoradiamonds.com",
  growthMethods: ["CVD", "HPHT"],
  certBodies: ["IGI", "GIA"],
  moq: Object.freeze({
    stock: "No minimum — single certified stones available ex-stock",
    layouts: "Minimum 5 carats total weight per layout order",
    pairs: "1 pair (2 stones) minimum",
    customCuts: "Minimum 5 carats total per custom-cut production run",
    melee: "Minimum 10 carats per parcel",
  }),
  tolerance: Object.freeze({
    calibrated: "±0.05mm on diameter/length-width",
    pairs: "Matched within 1 color grade, 1 clarity grade, and 2% weight variance between the two stones",
  }),
  leadTime: Object.freeze({
    stock: "2–3 working days",
    bespoke: "7–10 working days",  // DRAFT — confirm with Akshay for custom-cut/layout pages
  }),
  paymentTerms: "Flexible payment terms — advance, LC, or memo terms available depending on order size, confirmed with each quote.",
  marketsServed: [
    "United States",
    "Canada",
    "Belgium",
    "France",
    "Italy",
    "United Kingdom",
    "United Arab Emirates",
    "Saudi Arabia",
    "Qatar",
    "Kuwait",
    "Bahrain",
    "Oman",
    "Singapore",
    "Hong Kong",
    "Australia",
  ],
  founders: null,
  monthlyCapacity: "100,000+",  // units (carats or stones) to confirm with Akshay before use
  canonicalOrigin: "https://www.alvoradiamonds.com",
});
