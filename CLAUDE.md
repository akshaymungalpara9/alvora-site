# Alvora site: project context

Read this first. The owner is non-technical: explain in plain English, plan
before big changes, and end each work session with a short summary.

## What the site is
- **Retail jewellery is the homepage.** Engagement rings, earrings and more,
  set with lab-grown diamonds. Buying is **enquiry-first**: no checkout. A
  visitor picks a piece, metal and size, then enquires or books a consultation.
- **The lab-grown diamond wholesale business lives at `/trade`**, with
  trade-only finished jewellery (no retail prices) at `/trade/jewellery`.
- Look: ivory / ink / brass; fonts Cormorant, DM Mono, Manrope. Shopping
  experience inspired by June Rings, but in Alvora's own style.

## Hard rules
- **Never show partner names publicly** (June Rings, Pooja Diamond, Carat
  Diamonds, or their design names). Only Alvora names and `ALV-X-0000` codes.
  The partner map is private: `server/data/jewellery-sourcing.json`.
  `server/jewelleryCatalog.test.ts` guards this.
- **Every public claim must be true and sourced.** Don't state where or how a
  piece is made unless confirmed.
- Every photo goes through the brand treatment (ivory backdrop + watermark).

## Catalogue: how it works
- Source list: `data/jewellery/launch_shortlist_v1.csv`.
- **Launch rule**: `data/jewellery/launch.json`: June Rings (all), Pooja
  Diamond (all), Carat Diamonds (earrings only).
- A piece is shown on the site only when it is on the launch list **and has
  at least one photo** (`isShown()` in `shared/jewellery/catalog.ts`).
  Empty collections hide from the navigation automatically.
- Editable names/slugs/prices: `data/jewellery/pieces.json`; markup:
  `data/jewellery/pricing.json`.
- Build: `node scripts/jewellery/build-catalog.mjs` (data only) or
  `pnpm jewellery:images` (also processes photos). Report:
  `data/jewellery/import-report.txt`. See `JEWELLERY_RUNBOOK.md`.

## Prices (owner-set 2026-09-25)
- `shared/jewellery/pricing.ts`: engagement rings are priced in rupees by
  metal (silver, 14K gold, 18K gold, platinum) and centre-stone carat
  (0.5–6 ct). "From" price = 0.5 ct in silver (₹25,000); the product page opens
  on it. Platinum = 14K prices (owner-confirmed). Silver and platinum are white
  only; gold keeps yellow/white/rose.
- Earrings (and anything else) show "Price on request" until rupee prices are
  set. The old partner-derived `fromPriceUsd` is internal only.
- Launch offer: table prices are the offer prices. `LAUNCH_OFFER.endsOn` (owner
  sets the date) shows the full price struck through and "30% launch offer
  until <date>". It must be a real price charged after that date (Indian
  consumer rules on misleading discounts). No date = no discount shown.
- Currency: `shared/jewellery/currency.ts`. Visitors see their currency, guessed
  from time zone, with a switcher. A currency is offered only once the owner
  sets its rate (rupees per unit); until then everyone sees rupees. Search
  results and structured data use rupees.

## Centre stone (engagement rings, necklaces & pendants)
- Owner-confirmed standard (2026-09-25): E colour, VS1 clarity, Excellent cut;
  customer chooses 0.5–6 ct. Lives in `shared/jewellery/centreStone.ts`
  (options, spec rows, "Your centre stone" story, meta/JSON-LD summary).
- Cut wording: "Excellent cut" for rounds; "Excellent polish and symmetry" for
  fancy shapes (labs grade cut on rounds only). Colour grade only for white
  diamonds; coloured stones show their colour.
- Ethical copy stays factual: grown not mined, a real diamond, cut in Surat.
  No "eco-friendly"/"sustainable" claims (not substantiated).

## Photos
- Raw photos (git-ignored): `data/jewellery/raw-images/<partner>-images/<handle>/`
  where partner dir is `junerings-images`, `poojadiamond-images` or
  `caratdiamonds-images`, and `<handle>` is the CSV handle.
- Branded output (committed): `client/public/assets/jewellery/alv-x-0000/`.
- Treatment: `scripts/jewellery/brand-image.mjs` (also `pnpm brand:image`).
  Studio shots get the background swapped and are cropped to fill the frame;
  lifestyle/hand shots keep their background inside an ivory frame.
- Status (2026-09-25): June Rings 45/45 and Carat earrings 20/20 have photos.
  **Pooja (91 pieces) still needs photos**; they appear automatically once
  added and `pnpm jewellery:images` is run.

- Every product gallery ends with the shared grading-report photo
  (`client/public/assets/jewellery/shared/grading-report*.webp`,
  `GRADING_REPORT_IMAGE` in `shared/jewellery/catalog.ts`). It is an
  owner-supplied AI image; replace with a real IGI report photo when available.
- Owner photo overrides: ALV-R-0042 (Fiora Oval Solitaire) uses the owner's
  model and hand photos as images 03-04 instead of the partner lifestyle shot.
  The committed output in `client/public/assets/jewellery/alv-r-0042/` is the
  source of truth; if raw photos are re-downloaded, keep that override.

## AI photo upgrade (owner-approved only)
- `pnpm jewellery:ai-photos generate|review|apply` (`scripts/jewellery/ai-photos.mjs`):
  sharper redraws of studio photos + new styled shots (hand, model, close-up,
  side view) made from the piece's own studio photos. Candidates are
  git-ignored; **only photos the owner approves** on the private review page
  are copied to the site as `ai-*.webp`, listed in
  `data/jewellery/ai-photos/approved.json` (decisions and rejection notes in
  `decisions.json`; notes are fed into the next retry). The catalogue build
  keeps them when raw photos are re-processed.
- Status (2026-09-25): trial on ALV-R-0001, ALV-R-0026, ALV-E-0006 (17
  approved). Gemini stopped by the owner on cost (about 13 INR per image);
  choose a cheaper provider before running the other 62 pieces.

## Homepage hero photos
- The homepage rotates the owner's photos (cross-fade every 6s; still for
  reduced-motion visitors). Current set (2026-09-25): 4 photos, two with a
  model and two hand shots, 1611x2000 each.
- Replace or add: `pnpm hero:image a.jpg b.jpg ... --alt "..." --alt "..."`
  (one --alt per photo, same order). Writes `client/public/assets/home/` and
  `shared/homeHero.json`. `pnpm hero:image --clear` goes back to the top
  engagement-ring shot. Use photos 1600px+ wide (2400px+ ideal).
- Contact options are email, WhatsApp and phone. There is no video call.

## Link previews (WhatsApp etc.)
- `socialImageFor()` in `server/seoInjection.ts`: product pages use
  `/assets/social/pieces/<code>.jpg` (the piece's first photo); homepage,
  collections, shapes, consultation and guides use
  `/assets/social/alvora-jewellery.jpg` (the homepage photos side by side);
  trade pages keep `/assets/alvora-og.jpg`. JPEG only (WebP breaks previews).
- Rebuilt automatically by `pnpm hero:image` and `pnpm jewellery:images`, or
  run `pnpm social:images`.

## SEO
- Follows the owner's SEO/AEO playbook: conversions first, one money page at
  a time, weekly loop, every claim sourced. Files in `seo/` (`BRIEF.md`,
  `STATE.md`, `LOG.md`, `WEEKLY_LOOP.md`, `reports/`).
- Next money page: `/earrings`.
- Route meta: `server/seoInjection.ts`; `npx tsx scripts/validate-seo-meta.ts`
  checks every title/description is unique. Prerendered snapshots in
  `prerendered/` are regenerated by `pnpm build` (needs `CHROMIUM_PATH`) and
  committed.

## GEO (AI search) status
- Phase 1 (2026-09-17) was partly undone by the 2026-09-23 production
  checkpoint: /availability is blocked in robots.txt again and missing from
  the sitemap and llms.txt. Awaiting the owner's decision to reopen it.
- Stock facts from `server/data/stones.public.json` (3,185 stones): white
  colours D–G (plus 4 outliers), clarity IF–SI2 (mostly VVS2–VS1), cut mostly
  Ideal/Excellent. Public copy must match these.
- No "TODO" text may appear on public pages; unconfirmed specifics say
  "confirmed in your quotation" instead.

## Open items for the owner
- Launch offer end date, exchange rates for other currencies, and rupee
  prices for earrings (see Prices).
- Logo file at `client/public/assets/brand/alvora-logo.png` (optional).
- Two Carat earrings appear to be the same product (flower-stud marquise vs
  marquise prong-style); decide whether to hide one.
- After launch: connect Google Search Console and Bing Webmaster Tools.

## Commands
- `pnpm dev` (localhost:3000), `pnpm check`, `pnpm vitest run`, `pnpm build`.
- Deploy: from the owner's Mac, `railway up` (no Railway token in the cloud).
- Known pre-existing test failures (9): resend, whatsapp, buyerWorkflow ×2,
  publicLegalSeo sitemap, publicMakerLanguage ×2, publicSeo og image,
  tradeEngagementPublic.
