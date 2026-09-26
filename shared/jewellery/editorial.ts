/**
 * Editorial copy for SEO money pages and their supporting guides.
 * Written answer-first: the first sentence under every heading answers the
 * heading on its own, so both searchers and AI answers can quote it.
 * See seo/reports for the research behind each page.
 */
import { PUBLIC_PIECES, type JewelleryPiece } from "./catalog";
import { CENTRE_STONE_CARATS, CENTRE_STONE_GRADE, isWhite } from "./centreStone";
import { formatInr, fromPriceInr } from "./pricing";

export type EditorialSection = { heading: string; body: string[]; link?: { label: string; href: string } };

export type ShapeContent = {
  title: string;
  description: string;
  heading: string;
  intro: string;
  sections: EditorialSection[];
  guide?: { label: string; href: string };
  answer?: { question: string; text: string; buyerNote: string };
};

/** "a", "a and b", "a, b and c" (house style: no Oxford comma). */
function joinList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}



function priceSpan(pieces: JewelleryPiece[]) {
  const prices = pieces.map((p) => fromPriceInr(p)).filter((p): p is number => p != null).sort((a, b) => a - b);
  if (!prices.length) return null;
  return { from: prices[0], to: prices[prices.length - 1], count: prices.length };
}

/** Per-shape copy for /engagement-rings/shape/:shape. Shapes without an entry use the generic template. */
export function shapeContentFor(shape: string): ShapeContent | null {
  if (shape !== "marquise") return null;
  const pieces = PUBLIC_PIECES.filter((p) => p.shape === "marquise" && p.collections.includes("engagement-rings"));
  if (!pieces.length) return null;
  const dutch = pieces.filter((p) => p.tags.includes("dutch-marquise")).length;
  // The vintage and Dutch copy below only runs while Dutch (or otherwise
  // vintage-detailed) marquise pieces are actually on sale; without them it
  // would promise rings we do not show.
  const vintage = dutch > 0;
  const span = priceSpan(pieces);
  const fromText = span ? ` from ${formatInr(span.from)}` : "";
  const styleList = joinList(Array.from(new Map(pieces.map((p) => [p.style, p.styleLabel.toLowerCase()])).values()));
  const carats = `${CENTRE_STONE_CARATS[0]} to ${CENTRE_STONE_CARATS[CENTRE_STONE_CARATS.length - 1]} ct`;
  const grade = `${CENTRE_STONE_GRADE.colour} colour, ${CENTRE_STONE_GRADE.clarity} clarity with ${CENTRE_STONE_GRADE.cut} polish and symmetry`;
  const gradeSentence = pieces.every(isWhite)
    ? `Every centre stone is ${grade}, in your choice of ${carats}.`
    : `White centre stones are ${grade}, in your choice of ${carats}; champagne and coloured stones are graded to the same ${CENTRE_STONE_GRADE.clarity} standard.`;
  return {
    title: vintage ? "Vintage & Dutch Marquise Engagement Rings, Lab-Grown | Alvora" : "Marquise Lab-Grown Diamond Engagement Rings | Alvora",
    description: vintage
      ? `Vintage-style marquise and Dutch marquise lab-grown diamond engagement rings with milgrain, filigree and engraved detail, made to order in silver, 14K or 18K gold, or platinum${fromText}.`
      : `${pieces.length} marquise lab-grown diamond engagement rings in ${styleList} settings, made to order in silver, 14K or 18K gold, or platinum${fromText}.`,
    heading: vintage ? "Vintage & Dutch marquise engagement rings" : "Marquise engagement rings",
    intro: vintage
      ? `Lab-grown marquise diamonds in vintage-style settings, from the classic curved marquise to the straighter-sided Dutch marquise, made to your size in silver, 14K or 18K gold, or platinum${fromText}.`
      : `${pieces.length} marquise lab-grown diamond engagement rings in ${styleList} settings, made to your size in silver, 14K or 18K gold, or platinum${fromText}. ${gradeSentence}`,
    guide: { label: "Dutch marquise or classic marquise? Read the guide", href: "/guides/dutch-marquise-vs-marquise" },
    answer: {
      question: "What is a vintage marquise engagement ring?",
      text: "A vintage marquise engagement ring sets the long, pointed marquise diamond, a shape born in 18th-century France, with details borrowed from heirloom jewellery: milgrain edges, filigree, hand engraving or leaf-shaped claws. The stone lengthens the look of the finger, and the detailing gives it the character of a ring passed down through generations.",
      buyerNote: "What this means for you: every ring here is made to order, so if a vintage detail matters to you, mention it in your enquiry and we will tell you what is possible before you commit.",
    },
    sections: [
      ...(vintage ? [{
        heading: "What makes a marquise engagement ring vintage?",
        body: [
          "The setting does. Milgrain edges, filigree, hand engraving and leaf- or flower-shaped claws give a marquise the look of an heirloom, while the long, pointed stone itself has been a jewellery classic since 18th-century France.",
          "Most of the rings on this page carry at least one of those details. Each product page names the detailing on that ring.",
        ],
      },
      {
        heading: "Dutch marquise or classic marquise?",
        body: [
          "A classic marquise has smoothly curved sides that meet in two points; a Dutch marquise has straight, angled sides that form a long six-sided outline, so it reads slightly wider and more geometric on the hand.",
          `${dutch} of the ${pieces.length} rings here are Dutch marquise. Both shapes lengthen the look of the finger.`,
        ],
        link: { label: "Compare the two shapes in detail", href: "/guides/dutch-marquise-vs-marquise" },
      }] : []),
      {
        heading: "How much does a lab-grown marquise engagement ring cost?",
        body: [
          span
            ? `Our marquise engagement rings start at ${formatInr(span.from)} in 925 sterling silver with a 0.5 ct centre stone; the price rises with the centre-stone size and metal you choose.`
            : "Prices depend on the centre-stone size and gold you choose.",
          "You receive a written price for your exact ring, stone and size before anything is made, and nothing is charged until you confirm.",
        ],
        link: { label: "Book a free consultation", href: "/book-a-consultation" },
      },
    ],
  };
}

export type Guide = {
  slug: string;
  title: string;
  description: string;
  heading: string;
  /** One-sentence direct answer shown first. */
  answer: string;
  published: string;
  sections: EditorialSection[];
  /** Pieces to show beneath the guide. */
  pieces: () => JewelleryPiece[];
  cta: { label: string; href: string };
  /** Optional embedded explainer video (YouTube id). */
  video?: { youtubeId: string; title: string };
};

export const GUIDES: Guide[] = [
  {
    slug: "dutch-marquise-vs-marquise",
    title: "Dutch Marquise vs Marquise Cut: What's the Difference? | Alvora",
    description: "A Dutch marquise has straight, angled sides forming a six-sided outline; a classic marquise has curved sides. How they look on the hand, and which to choose.",
    heading: "Dutch marquise vs marquise: what's the difference?",
    answer:
      "A classic marquise has smoothly curved sides that meet in two points, like a boat; a Dutch marquise keeps the same long, pointed shape but has straight, angled sides, giving it an elongated six-sided outline that looks a little wider and more geometric.",
    published: "2026-09-24",
    sections: [
      {
        heading: "How do they look on the hand?",
        body: [
          "Both lengthen the look of the finger. The classic marquise is the slimmer and more dramatic of the two, with a narrow, blade-like profile.",
          "The Dutch marquise is fuller through the middle because its sides run straight instead of curving in, so the same carat weight can read slightly broader from above. Its crisp edges catch light in clean flashes rather than a soft sweep.",
        ],
      },
      {
        heading: "Which one looks more vintage?",
        body: [
          "The Dutch marquise, usually. Its faceted, antique-inspired outline pairs naturally with milgrain, filigree and engraved bands, which is why most of our Dutch marquise rings sit in heritage settings.",
          "A classic marquise can be vintage too; it depends on the setting. In a slim modern solitaire it looks clean and contemporary, and in a milgrain or filigree mount it looks like an heirloom.",
        ],
      },
      {
        heading: "Is a Dutch marquise less likely to chip?",
        body: [
          "Neither shape is safer by itself. Both have two points, and those points are the most exposed part of the stone, so what protects them is the setting: V-shaped prongs or claws that wrap each tip.",
          "Ask us to confirm how the points are held on any ring you are considering; we include it in your written quote.",
        ],
      },
      {
        heading: "Are Dutch marquise diamonds available lab-grown?",
        body: [
          "Yes. The Dutch marquise has grown mainly in lab-grown diamonds, because lab-grown stones can be cut to newer specialty shapes more readily. Every stone we set is lab-grown: the same carbon crystal as a mined diamond, grown under controlled conditions.",
        ],
        link: { label: "Are lab-grown diamonds real?", href: "/insights/are-lab-grown-diamonds-real-diamonds" },
      },
      {
        heading: "How do I choose between them?",
        body: [
          "Choose the classic marquise if you want the slimmest, most elongated look, or a modern solitaire. Choose the Dutch marquise if you love an antique, faceted look and want a stone that reads a little fuller on the hand.",
          "If you are still unsure, a short consultation lets you compare both side by side before anything is made.",
        ],
        link: { label: "Book a free consultation", href: "/book-a-consultation" },
      },
    ],
    pieces: () => PUBLIC_PIECES.filter((p) => p.shape === "marquise" && p.collections.includes("engagement-rings")).sort((a, b) => Number(b.tags.includes("dutch-marquise")) - Number(a.tags.includes("dutch-marquise")) || b.featuredScore - a.featuredScore).slice(0, 8),
    cta: { label: "See all marquise engagement rings", href: "/engagement-rings/shape/marquise" },
  },
  {
    slug: "how-to-measure-ring-size",
    title: "How to Measure Ring Size at Home (3 Methods That Work) | Alvora",
    description: "Three reliable ways to measure ring size at home: an existing ring, a printable sizer, and the paper-strip method, plus when to get measured professionally.",
    heading: "How to measure ring size at home",
    answer:
      "The most reliable home method is to measure a ring that already fits: match its inside diameter to a ring size chart. If no ring is available, wrap a thin strip of paper around the finger, mark where it meets, and match the length in millimetres to the same chart.",
    published: "2026-09-25",
    video: { youtubeId: "U_v_BI_ENAo", title: "How to Measure your Ring Size at Home" },
    sections: [
      {
        heading: "Method 1: measure a ring that already fits",
        body: [
          "Take a ring the person wears on the same finger and measure its inside diameter in millimetres with a ruler, or place it over the circles of a printable ring size chart until the circle just fills the inside edge.",
          "Use a ring from the correct hand: the ring finger of the dominant hand is usually about half a size larger.",
        ],
      },
      {
        heading: "Method 2: the paper-strip method",
        body: [
          "Cut a thin strip of paper, wrap it snugly around the base of the finger, and mark where the end meets. Measure the length in millimetres; that circumference converts directly to a ring size on a standard chart.",
          "Measure at the end of the day when fingers are at their largest, and repeat twice to confirm. Do not pull the strip tight; the ring should slide over the knuckle.",
        ],
      },
      {
        heading: "Method 3: get measured professionally",
        body: [
          "Any jeweller can measure a finger in a minute with a metal sizing set, and it is the most accurate option. Fingers change with temperature, time of day and humidity, so a professional measurement removes the guesswork.",
          "If the ring is a surprise, borrow one from the correct finger and have a jeweller size it on a ring mandrel instead.",
        ],
      },
      {
        heading: "What if the size is still wrong?",
        body: [
          "Most plain solitaire bands can be resized by a jeweller within one or two sizes. Rings with stones set all around the band usually cannot, so it is worth confirming size before ordering those styles.",
          "Tell us the size you have and we will confirm the fit approach for the specific ring before anything is made.",
        ],
        link: { label: "Book a consultation", href: "/book-a-consultation" },
      },
    ],
    pieces: () => PUBLIC_PIECES.filter((p) => p.category === "ring").slice(0, 4),
    cta: { label: "Browse engagement rings", href: "/engagement-rings" },
  },
  {
    slug: "lab-grown-vs-natural-diamonds",
    title: "Lab-Grown vs Natural Diamonds: What Is the Actual Difference? | Alvora",
    description: "Lab-grown and natural diamonds are the same material with the same hardness, sparkle and grading. The real differences are origin, supply and price.",
    heading: "Lab-grown vs natural diamonds: what is the actual difference?",
    answer:
      "A lab-grown diamond and a natural diamond are the same material, carbon crystallised in the diamond structure, with identical hardness, brilliance and grading standards. They differ in origin, one grown in a laboratory and one formed underground, and in price and supply.",
    published: "2026-09-25",
    sections: [
      {
        heading: "Are lab-grown diamonds real diamonds?",
        body: [
          "Yes. Lab-grown diamonds are graded by the same laboratories, including IGI and GIA, on the same 4Cs scales, and they are laser-inscribed with a report number like any certified stone.",
          "They are not simulants. Cubic zirconia and moissanite look similar but are different materials with different optical and hardness properties.",
        ],
        link: { label: "Are lab-grown diamonds real diamonds?", href: "/insights/are-lab-grown-diamonds-real-diamonds" },
      },
      {
        heading: "Can anyone tell them apart?",
        body: [
          "Not by looking. Even a trained jeweller cannot distinguish a lab-grown diamond from a natural one without laboratory equipment, because the visual and physical properties are the same.",
          "The certificate states the origin, and the stone's laser inscription ties it to that report.",
        ],
      },
      {
        heading: "Why do lab-grown diamonds cost less?",
        body: [
          "Supply. Natural diamonds are finite and extracted; lab-grown diamonds are produced to demand, so the same size and quality costs significantly less.",
          "For the same budget, buyers typically choose a larger stone, a higher colour or clarity grade, or a more substantial setting.",
        ],
      },
      {
        heading: "Which should you choose?",
        body: [
          "Choose lab-grown if you want the largest, highest-quality stone for your budget and you buy for how the ring looks and wears. Choose natural if finite origin and traditional resale framing matter more to you than size and grade.",
          "Every stone Alvora sets is lab-grown, certified by IGI or GIA, and laser-inscribed.",
        ],
        link: { label: "Is a lab-grown diamond worth it?", href: "/insights/is-a-lab-grown-diamond-worth-it" },
      },
    ],
    pieces: () => PUBLIC_PIECES.filter((p) => p.category === "ring").slice(0, 4),
    cta: { label: "See lab-grown engagement rings", href: "/engagement-rings" },
  },
  {
    slug: "14k-vs-18k-gold-engagement-ring",
    title: "14K vs 18K Gold for an Engagement Ring: Which Should You Pick? | Alvora",
    description: "14K gold is harder and more scratch-resistant for daily wear; 18K gold has a richer colour and higher gold content. How to choose for an engagement ring.",
    heading: "14K vs 18K gold for an engagement ring",
    answer:
      "14K gold contains 58.5% pure gold and is the harder, more scratch-resistant choice for everyday wear; 18K gold contains 75% pure gold and offers a richer colour and higher gold content at a higher price. Both hold a centre stone securely when the ring is made well.",
    published: "2026-09-25",
    sections: [
      {
        heading: "What does the karat number mean?",
        body: [
          "Karat measures gold purity out of 24 parts. 14K is 14 parts gold in 24 (58.5%), and 18K is 18 parts (75%); the remainder is alloy metals that add strength and set the colour.",
          "Karat is about gold content only. It says nothing about the diamond, which is graded separately.",
        ],
      },
      {
        heading: "Which wears better day to day?",
        body: [
          "14K. Its higher alloy content makes it harder and more resistant to scratches and dents, which suits a ring worn every day, including during manual work or sport.",
          "18K is softer and shows fine scratches sooner, though many owners accept that patina in exchange for the richer colour.",
        ],
      },
      {
        heading: "Do they look different?",
        body: [
          "In yellow gold, yes: 18K has a visibly deeper, warmer yellow. In white gold both are usually rhodium-plated, so they look near-identical out of the box. Rose gold differs less, but 18K reads slightly softer and pinker.",
          "All three colours are available in both karats for Alvora rings.",
        ],
      },
      {
        heading: "Which should you choose?",
        body: [
          "Choose 14K for an active lifestyle, a tighter budget, or a preference for durability. Choose 18K for richer colour, higher gold content, and a ring that is worn with a little more care.",
          "Every Alvora engagement ring can be made in 14K or 18K gold in yellow, white or rose, and the price difference is confirmed in your written quote.",
        ],
        link: { label: "Browse engagement rings", href: "/engagement-rings" },
      },
    ],
    pieces: () => PUBLIC_PIECES.filter((p) => p.category === "ring").slice(0, 4),
    cta: { label: "Compare rings in 14K and 18K", href: "/engagement-rings" },
  },
  {
    slug: "engagement-ring-setting-styles",
    title: "Engagement Ring Setting Styles, Explained Simply | Alvora",
    description: "Solitaire, east-west, bezel, hidden halo and heritage settings explained: how each style holds the stone, how it looks, and who it suits.",
    heading: "Engagement ring setting styles, explained simply",
    answer:
      "A setting is how the ring holds and presents the centre stone. The main styles are the solitaire, a single stone on a plain band; the east-west, a fancy shape set sideways; the bezel, metal wrapped around the stone's edge; and heritage styles with milgrain and engraving detail.",
    published: "2026-09-25",
    sections: [
      {
        heading: "Solitaire: the classic",
        body: [
          "One centre stone held by prongs on a plain band. Every design choice points at the stone, so cut quality matters most here.",
          "A solitaire suits any shape and any hand, and it pairs with almost any wedding band later.",
        ],
      },
      {
        heading: "East-west: the stone turned sideways",
        body: [
          "An elongated shape such as an oval, marquise, emerald or pear is set across the finger instead of along it. The look is modern and reads wider on the hand.",
          "East-west settings suit elongated shapes specifically; a round stone looks the same either way.",
        ],
        link: { label: "What is an east-west setting?", href: "/guides/east-west-setting" },
      },
      {
        heading: "Bezel: metal around the edge",
        body: [
          "A thin rim of metal wraps the stone's outer edge. It is the most protective setting for daily wear and gives a clean, modern outline.",
          "A bezel covers a sliver of the stone's edge, so it can make a stone read slightly smaller than prongs would.",
        ],
      },
      {
        heading: "Heritage and antique-inspired settings",
        body: [
          "Milgrain edges, engraving and filigree give a ring a vintage character. These settings pair naturally with antique cut shapes such as old mine and Dutch marquise.",
          "Detail work adds visual weight, so heritage settings often suit larger centre stones or statement pieces.",
        ],
        link: { label: "Browse antique cut rings", href: "/jewellery/antique-cuts" },
      },
    ],
    pieces: () => PUBLIC_PIECES.filter((p) => p.category === "ring").slice(0, 4),
    cta: { label: "Browse all setting styles", href: "/engagement-rings" },
  },
  {
    slug: "how-to-choose-a-diamond-shape",
    title: "How to Choose a Diamond Shape for Your Hand and Style | Alvora",
    description: "Round, oval, pear, cushion, emerald, marquise and radiant compared: how each shape looks on the hand, what it costs per carat, and who it suits.",
    heading: "How to choose a diamond shape",
    answer:
      "Choose the shape by how you want the stone to read on the hand: rounds are the most brilliant and classic, elongated shapes like oval, pear and marquise make the finger look longer and the stone look larger for its weight, and step cuts like emerald trade sparkle for clean, architectural flashes.",
    published: "2026-09-25",
    sections: [
      {
        heading: "Round: maximum sparkle",
        body: [
          "The round brilliant is cut to return the most light, and it is the only shape laboratories grade for cut. It suits every hand and every setting style.",
          "Rounds typically cost more per carat than fancy shapes because more rough is lost in cutting.",
        ],
        link: { label: "Browse round rings", href: "/engagement-rings/shape/round" },
      },
      {
        heading: "Oval, pear and marquise: bigger looking per carat",
        body: [
          "Elongated shapes spread weight across a larger top surface, so a 1 ct oval looks visibly bigger than a 1 ct round. They also lengthen the look of the finger.",
          "Ovals are the most popular elongated shape today; pears and marquises point along the finger for a more directional look.",
        ],
        link: { label: "Browse oval rings", href: "/engagement-rings/shape/oval" },
      },
      {
        heading: "Cushion and radiant: soft corners, strong sparkle",
        body: [
          "Cushions have rounded corners and a pillow outline with a softer, chunkier sparkle. Radiants have trimmed corners and a crisper, more glittering light return.",
          "Both hide colour well and suit vintage and modern settings alike.",
        ],
      },
      {
        heading: "Emerald and step cuts: clean and architectural",
        body: [
          "Step cuts have long, parallel facets that produce broad flashes instead of glitter. They show clarity honestly, so a higher clarity grade matters more here.",
          "An emerald cut suits minimal, tailored settings and reads elegant rather than sparkly.",
        ],
        link: { label: "Browse emerald cut rings", href: "/engagement-rings/shape/emerald" },
      },
    ],
    pieces: () => PUBLIC_PIECES.filter((p) => p.category === "ring").slice(0, 4),
    cta: { label: "Browse rings by shape", href: "/engagement-rings" },
  },
  {
    slug: "oval-vs-round-engagement-ring",
    title: "Oval vs Round Engagement Rings: Which Is Right for You? | Alvora",
    description: "Oval diamonds look larger per carat and elongate the finger; rounds give maximum sparkle and a timeless look. Price, bow-ties and settings compared.",
    heading: "Oval vs round engagement rings",
    answer:
      "A round brilliant gives the most sparkle and the most classic look, while an oval of the same weight looks larger, elongates the finger, and usually costs less per carat. Choose round for brilliance and tradition, oval for size presence and a modern outline.",
    published: "2026-09-25",
    sections: [
      {
        heading: "Which looks bigger?",
        body: [
          "The oval. Its elongated outline spreads weight over a larger top surface, so a 1 ct oval presents noticeably bigger than a 1 ct round from above.",
          "The lengthening effect also flatters shorter or wider fingers.",
        ],
      },
      {
        heading: "Which sparkles more?",
        body: [
          "The round. It is the only shape cut to a measured light-return ideal, and laboratories grade its cut. Ovals are graded for polish and symmetry only, so cut quality varies more stone to stone.",
          "A well-cut oval still sparkles strongly; it just trades a little brilliance for its elongated look.",
        ],
      },
      {
        heading: "What is the bow-tie effect?",
        body: [
          "Most ovals show a soft dark band across the middle called a bow-tie. In a well-cut stone it is faint and adds character; in a poorly cut one it is a dead, dark stripe.",
          "Judge it in the stone's own video rather than from the certificate. Every Alvora stone page shows the actual stone where a verified 360 view exists.",
        ],
      },
      {
        heading: "Do they suit the same settings?",
        body: [
          "Almost. Both work in solitaires, bezels and heritage settings. The oval also suits an east-west setting, where it sits across the finger; a round looks identical in either orientation.",
          "Both shapes are available across the Alvora range with IGI or GIA certified stones.",
        ],
        link: { label: "Compare oval and round rings", href: "/engagement-rings" },
      },
    ],
    pieces: () => PUBLIC_PIECES.filter((p) => p.shape === "oval" || p.shape === "round").slice(0, 4),
    cta: { label: "Compare oval and round rings", href: "/engagement-rings" },
  },
  {
    slug: "east-west-setting",
    title: "What Is an East-West Ring Setting? | Alvora",
    description: "An east-west setting turns an elongated diamond sideways across the finger. Which shapes suit it, how it wears, and why it looks modern.",
    heading: "What is an east-west setting?",
    answer:
      "An east-west setting holds an elongated diamond horizontally across the finger instead of pointing along it. Ovals, marquises, emerald cuts, pears and radiants all suit it; the sideways orientation gives a modern look and makes the stone read wider on the hand.",
    published: "2026-09-25",
    sections: [
      {
        heading: "Which shapes work east-west?",
        body: [
          "Any elongated shape: oval, marquise, emerald, pear, radiant and elongated cushion. The longer the stone relative to its width, the stronger the effect.",
          "Round and square stones look the same in either orientation, so the style only makes sense for elongated shapes.",
        ],
      },
      {
        heading: "How does it change the look?",
        body: [
          "The stone covers more of the finger's width, so the ring reads bolder and more modern from above. It is a simple way to make a classic solitaire feel designed rather than traditional.",
          "On shorter fingers the sideways line can balance proportions better than a long stone pointing toward the knuckle.",
        ],
      },
      {
        heading: "Does it wear differently?",
        body: [
          "The stone's long edges now sit toward the neighbouring fingers, so a comfortable gallery height matters. A well-made east-west setting keeps the stone low enough not to catch.",
          "Pointed ends on marquises and pears still need protective prongs, exactly as in a north-south setting.",
        ],
      },
      {
        heading: "Is it a passing trend?",
        body: [
          "The orientation dates back to vintage bar rings and Art Deco design; its current popularity is a revival rather than an invention. In a plain solitaire form it ages like any classic.",
          "If you want the option of both looks, a north-south setting is the safer default; east-west is the deliberate choice.",
        ],
        link: { label: "Browse east-west rings", href: "/engagement-rings" },
      },
    ],
    pieces: () => PUBLIC_PIECES.filter((p) => p.styleLabel && p.styleLabel.toLowerCase().includes("east-west")).slice(0, 4),
    cta: { label: "Browse east-west rings", href: "/engagement-rings" },
  },
  {
    slug: "igi-certificate-lab-grown-diamond",
    title: "What an IGI Certificate Tells You About a Lab-Grown Diamond | Alvora",
    description: "How to read an IGI lab-grown diamond report: the 4Cs, the laser inscription, and how to verify the report number online before you buy.",
    heading: "What an IGI certificate tells you about a lab-grown diamond",
    answer:
      "An IGI report grades a lab-grown diamond on the same 4Cs scales as a natural diamond and states its laboratory-grown origin. The report number is laser-inscribed on the stone's girdle, and you can verify the report on IGI's website before you buy.",
    published: "2026-09-25",
    sections: [
      {
        heading: "What the report grades",
        body: [
          "Carat weight, colour grade, clarity grade, and for round stones a cut grade; fancy shapes receive polish and symmetry grades instead, because laboratories grade cut only on rounds.",
          "The report also records the stone's measurements, fluorescence, and growth method (CVD or HPHT), and it states clearly that the diamond is laboratory-grown.",
        ],
      },
      {
        heading: "The laser inscription",
        body: [
          "The report number is inscribed microscopically on the stone's girdle. A jeweller's loupe shows it, and it ties the physical stone to its paperwork.",
          "Match the inscription to the report before accepting a stone; the two should always travel together.",
        ],
      },
      {
        heading: "How to verify a report online",
        body: [
          "Enter the report number on IGI's verification page and compare every detail: weight, measurements, grades and origin statement should match the stone exactly.",
          "Alvora links certificate records only where a matching official IGI or GIA destination is available, and every stone ships with its own report.",
        ],
        link: { label: "About IGI certification at Alvora", href: "/certifications" },
      },
      {
        heading: "IGI vs GIA for lab-grown",
        body: [
          "Both grade lab-grown diamonds on the same scales. IGI grades the large majority of lab-grown stones in the market; GIA lab-grown reports are equally valid and less common.",
          "What matters is that a recognised laboratory graded the specific stone, not which logo sits on the report.",
        ],
        link: { label: "IGI vs GIA vs SGL compared", href: "/insights/igi-vs-gia-vs-sgl-lab-grown-diamonds" },
      },
    ],
    pieces: () => PUBLIC_PIECES.filter((p) => p.category === "ring").slice(0, 4),
    cta: { label: "Browse certified rings", href: "/engagement-rings" },
  },
  {
    slug: "lab-grown-engagement-ring-cost",
    title: "What Does a Lab-Grown Engagement Ring Cost? | Alvora",
    description: "What drives the price of a lab-grown engagement ring: centre stone size and grade, metal choice, and setting style, and how Alvora confirms pricing.",
    heading: "What does a lab-grown engagement ring cost?",
    answer:
      "The price of a lab-grown engagement ring is set mainly by the centre stone's carat weight and grades, the metal (silver, 14K or 18K gold, or platinum), and the setting work. Lab-grown stones cost far less than mined equivalents, so the same budget buys a larger or higher-graded stone.",
    published: "2026-09-25",
    sections: [
      {
        heading: "The stone is the biggest factor",
        body: [
          "Carat weight moves price fastest: a 2 ct stone costs well more than twice a 1 ct of the same quality. Colour and clarity grade step the price within each size.",
          "Alvora centre stones run from 0.5 to 6 ct at E colour and VS1 clarity as standard, so grading is not a variable you need to trade down on.",
        ],
      },
      {
        heading: "Metal choice",
        body: [
          "Sterling silver is the most affordable option, then 14K gold, then 18K gold, with platinum at the top. The difference is the metal weight and market price, not quality of workmanship.",
          "White gold and platinum look similar when new; yellow and rose golds price the same as white at the same karat.",
        ],
      },
      {
        heading: "Setting style and labour",
        body: [
          "A plain solitaire uses less metal and labour than a heritage setting with milgrain and engraving, and the price reflects that. Side stones and hidden detail add material and setting time.",
          "Custom work is quoted individually: nothing is made until you approve a written price and timeline.",
        ],
      },
      {
        heading: "How pricing works at Alvora",
        body: [
          "Each ring on the site shows a starting price, and the final figure depends on your stone size, metal and any customisation. The written quote confirms the total before production begins.",
          "There are no hidden setting, certification or inscription charges added later.",
        ],
        link: { label: "Book a consultation", href: "/book-a-consultation" },
      },
    ],
    pieces: () => PUBLIC_PIECES.filter((p) => p.category === "ring").slice(0, 4),
    cta: { label: "See rings with starting prices", href: "/engagement-rings" },
  },
  {
    slug: "how-to-care-for-lab-grown-diamond-jewellery",
    title: "How to Care for Lab-Grown Diamond Jewellery | Alvora",
    description: "Cleaning, storage and wear habits for lab-grown diamond rings and earrings: what is safe, what to avoid, and when to have settings checked.",
    heading: "How to care for lab-grown diamond jewellery",
    answer:
      "Clean lab-grown diamond jewellery in warm water with a drop of mild dish soap and a soft brush, dry with a lint-free cloth, and store pieces separately. Lab-grown diamonds are as hard as mined diamonds, so care is identical; the metal and setting need the attention.",
    published: "2026-09-25",
    sections: [
      {
        heading: "Cleaning at home",
        body: [
          "Soak the piece in warm water with mild dish soap for a few minutes, brush gently behind the stone where lotion and soap scum collect, rinse and pat dry. That restores most lost sparkle.",
          "Avoid toothpaste and abrasive cleaners; they scratch gold. Ultrasonic cleaners are safe for most diamond solitaires but not for fracture-filled stones or loose settings.",
        ],
      },
      {
        heading: "What to avoid",
        body: [
          "Chlorine and bleach attack gold alloys, so remove rings before pools and cleaning. Take rings off for gym, gardening and manual work: diamonds are hard, but prongs are small pieces of metal.",
          "Put jewellery on after perfume, hairspray and lotion, not before; film on the stone dulls its light return.",
        ],
      },
      {
        heading: "Storage",
        body: [
          "Store each piece separately in a soft pouch or lined box. Diamonds scratch other jewellery, and gold chains tangle around ring settings.",
          "Keep certificates and invoices with the piece's records, not in the jewellery box.",
        ],
      },
      {
        heading: "When to get a check",
        body: [
          "Have prongs and settings checked by a jeweller once a year, or immediately if the stone moves or a prong snags on fabric. A loose stone caught early is a tightening, not a loss.",
          "White gold may want fresh rhodium plating every year or two to keep its bright white finish.",
        ],
        link: { label: "Book a consultation", href: "/book-a-consultation" },
      },
    ],
    pieces: () => PUBLIC_PIECES.filter((p) => p.category === "ring" || p.category === "earrings").slice(0, 4),
    cta: { label: "Browse all jewellery", href: "/jewellery" },
  },
];

/** A guide is published only while it has pieces on sale to point at. */
export function isGuideLive(guide: Guide) {
  return guide.pieces().some((piece) => piece.tags.includes("dutch-marquise")) || !guide.slug.includes("dutch-marquise");
}

export const LIVE_GUIDES = GUIDES.filter(isGuideLive);

export function findGuide(slug: string) {
  return LIVE_GUIDES.find((guide) => guide.slug === slug);
}
