import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { AvailabilityStone, BuyerAccount } from "../drizzle/schema";

const pageWidth = 595.28;
const pageHeight = 841.89;
const graphite = rgb(0.047, 0.051, 0.051);
const paper = rgb(0.941, 0.933, 0.906);
const muted = rgb(0.61, 0.61, 0.57);
const signal = rgb(0.788, 1, 0.388);

const columnLayout = [
  ["SHAPE", 58], ["CT", 31], ["COLOUR", 56], ["CLARITY", 48], ["CUT", 32], ["IGI CERT #", 120], ["STOCK NO", 64],
] as const;

const compact = (value?: string | null, max = 22) => {
  if (!value) return "—";
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
};

export async function buildLineSheetPdf(input: { buyer?: BuyerAccount; title?: string; stones: AvailabilityStone[]; validUntil: Date }) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([pageWidth, pageHeight]);
  const serif = await pdf.embedFont(StandardFonts.TimesRoman);
  const sans = await pdf.embedFont(StandardFonts.Helvetica);
  const sansBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  page.drawRectangle({ x: 0, y: 0, width: pageWidth, height: pageHeight, color: graphite });
  page.drawRectangle({ x: 0, y: 0, width: pageWidth, height: 3, color: signal });

  page.drawText("A L V O R A", { x: 48, y: 781, size: 12, font: sansBold, color: paper });
  page.drawText("M A D E   I N   S U R A T", { x: 48, y: 762, size: 6.4, font: sans, color: signal });
  page.drawText(input.title || (input.buyer ? "Approved buyer line sheet" : "Current production view"), { x: 48, y: 714, size: 27, font: serif, color: paper });
  const bands = input.buyer
    ? `${input.buyer.shapes.replaceAll(",", " / ")}  ·  ${input.buyer.caratMin}–${input.buyer.caratMax} CT  ·  ${input.buyer.colors.replaceAll(",", " / ")}  ·  ${input.buyer.clarities.replaceAll(",", " / ")}`
    : "CURRENT PUBLIC AVAILABILITY · CUT, CALIBRATED AND CERTIFIED AT OUR BENCHES";
  page.drawText(input.buyer ? input.buyer.accountName.toUpperCase() : "ALVORA / MADE IN SURAT", { x: 48, y: 692, size: 7.2, font: sansBold, color: signal });
  page.drawText(compact(bands, 110), { x: 48, y: 674, size: 6.5, font: sans, color: muted });
  page.drawLine({ start: { x: 48, y: 649 }, end: { x: 547, y: 649 }, thickness: 0.5, color: rgb(0.3, 0.31, 0.29) });

  let x = 48;
  for (const [name, width] of columnLayout) {
    page.drawText(name, { x, y: 632, size: 5.4, font: sansBold, color: signal });
    x += width;
  }

  const maximumRows = 64;
  const rows = input.stones.slice(0, maximumRows);
  const hasMissingCertificates = rows.some((stone) => !stone.reportNumber);
  const rowHeight = Math.min(8.8, Math.max(7.2, 460 / Math.max(rows.length, 1)));
  const fontSize = Math.min(6.6, Math.max(5.2, rowHeight - 1.35));
  let y = 615;
  for (let index = 0; index < rows.length; index += 1) {
    const stone = rows[index];
    if (index % 2 === 0) page.drawRectangle({ x: 48, y: y - rowHeight + 2, width: 499, height: rowHeight, color: rgb(0.072, 0.077, 0.076) });
    x = 48;
    const cells = [
      compact(stone.shape, 12), `${stone.carat.toFixed(stone.carat % 1 === 0 ? 0 : 2)}`, compact(stone.color, 12), compact(stone.clarity, 10), compact(stone.cut || stone.polish, 6), compact(stone.reportNumber, 28), compact(stone.stockNumber, 16),
    ];
    cells.forEach((cell, cellIndex) => {
      page.drawText(cell, { x, y: y - 2, size: fontSize, font: sans, color: paper });
      x += columnLayout[cellIndex][1];
    });
    y -= rowHeight;
  }

  const footerY = 49;
  page.drawLine({ start: { x: 48, y: footerY + 22 }, end: { x: 547, y: footerY + 22 }, thickness: 0.45, color: rgb(0.3, 0.31, 0.29) });
  const validText = `VALID UNTIL ${input.validUntil.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()}`;
  page.drawText(validText, { x: 48, y: footerY + 7, size: 6.2, font: sansBold, color: signal });
  page.drawText(rows.length < input.stones.length ? `${rows.length} OF ${input.stones.length} MATCHING STONES SHOWN` : `${input.stones.length} MATCHING STONES`, { x: 262, y: footerY + 7, size: 6.2, font: sans, color: muted });
  page.drawText("ALVORA DIAMONDS — MADE IN SURAT", { x: 390, y: footerY + 7, size: 5.8, font: sans, color: paper });
  if (hasMissingCertificates) {
    const disclosure = "DATA NOTE: CERTIFICATE NUMBERS ARE NOT PRESENT IN THE CURRENT AVAILABILITY IMPORT; CONFIRM BEFORE COMMITTING.";
    page.drawText(compact(disclosure, 135), { x: 48, y: 33, size: 5.1, font: sans, color: muted });
  }
  return Buffer.from(await pdf.save());
}
