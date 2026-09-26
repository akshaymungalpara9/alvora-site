# Alvora site: project context

Read this first. The owner is non-technical: explain in plain English, plan
before big changes, and end each work session with a short summary.

## Who does what (owner decision, 2026-09-26)
- Claude (the owner's strategy session) owns **inbound, SEO and GEO strategy
  only**: plans, priorities, briefs and execution-ready prompts.
- **Execution is done by the owner using other LLMs / coding agents** (Claude
  Code, Codex, etc.). If you are the executing agent, follow the brief you
  were given and log what shipped in `seo/LOG.md`.
- House style for all copy and docs: no em-dashes anywhere.

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
  Diamond (all), Carat Diamonds (earrings and pendants; pendants added
  2026-09-26).
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
  metal (925 sterling silver, 14K gold, 18K gold, platinum) and centre-stone
  carat (0.5–6 ct). "From" price = 0.5 ct in silver (₹30,000 since the +10%
  rise on 2026-09-25; `retailMultiplier` 1.10); the product page
  opens on it. Platinum = 14K prices (owner-confirmed). Silver and platinum are
  white only; gold keeps yellow/white/rose.
- Earrings and pendants show "Price on request" (owner's choice). The partner list prices
  (`fromPriceUsd`) are internal only: they may be trade prices, so don't publish
  them without a markup decision.
- Launch offer: table prices are the offer prices; runs until 25 Dec 2026
  (`LAUNCH_OFFER.endsOn`, "till Christmas"). The full price is struck through,
  rounded UP so the saving is always at least 30%. It must be a real price
  charged after the offer (Indian rules on misleading discounts). Build-time
  page snapshots leave the offer out (`showLaunchOffer()`), so they never go
  stale; visitors see it until the date passes, then it disappears.
- Currency: `shared/jewellery/currency.ts`. Visitors see their currency (guessed
  from time zone) with a switcher. Owner rates: USD 96, EUR 110, GBP 126,
  CAD 70, AUD 70 rupees; converted prices rounded to 10. AED/SGD have no rate,
  so they are not offered. Search results and structured data use rupees.

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
- Up to **12 photos per piece** (`MAX_IMAGES_PER_PIECE`). Near-duplicates are
  skipped before numbering: a 64-bit difference hash (dhash) drops any photo
  within 2 bits of one already kept. Dropped filenames are logged to the
  git-ignored `data/jewellery/skipped-photos.txt` so you can review the trims.
- Status (2026-09-26): catalogue 347 pieces (291 rings, 32 earrings, 18
  pendants, 6 bands); **232 shown on the site** (196 rings, 20 earrings, 16
  pendants). Hidden for lack of photos: 95 rings, 12 earrings, 2 pendants
  (ALV-P-0004 pear, ALV-P-0018 cushion) and all 6 bands. The Pooja pieces
  (91) still need photos; they appear automatically once added and
  `pnpm jewellery:images` is run. `data/jewellery/import-report.txt` is the
  source of truth for these counts.
- Lead-card standard (2026-09-26, PR #22): every lead card is the piece
  cropped from the original, centred on ivory at subjectFill 0.78, light
  sharpen, 1400px lead + 600px thumb. 58 upscaled with Real-ESRGAN
  (realesr-general-x4v3), each checked against its original. Four pieces
  kept as-is (ALV-R-0213, 0214, 0215, 0219: on-hand-only sources); they need
  studio photos from the owner.
- Damaged-photo sweep of all 232 cards is in progress (2026-09-26): a
  per-piece fix plan goes to the owner before anything live changes.

- Every product gallery ends with the shared grading-report photo
  (`client/public/assets/jewellery/shared/grading-report*.webp`,
  `GRADING_REPORT_IMAGE` in `shared/jewellery/catalog.ts`). It is an
  owner-supplied AI image; replace with a real IGI report photo when available.
- Owner photo overrides: set `"lockedImages": true` on a piece in
  `data/jewellery/pieces.json` and `pnpm jewellery:images` leaves that piece's
  `client/public/assets/jewellery/<code>/` folder alone. Currently set on
  ALV-R-0042 (Fiora Oval Solitaire), whose images 03-04 are the owner's own
  model and hand photos.
- After a re-import the numbering of a piece's shots can shift (e.g. a photo
  that was slot 02 is now 03). If that piece has entries in
  `data/jewellery/ai-photos/approved.json`, remap the `"NN"` key so it still
  points at the source photo the AI enhancement was based on. See the diffing
  approach used on 2026-09-25 (dhash old vs new NN.webp).

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
- Next money page: `/earrings` (per `seo/LOG.md`; `seo/STATE.md` baseline
  still describes the marquise bet and pre-launch state).
- Monthly GEO prompt panel: `seo/geo-prompt-panel.md` (36 prompts, first run
  in the October cycle).
- Route meta: `server/seoInjection.ts`; `npx tsx scripts/validate-seo-meta.ts`
  checks every title/description is unique. Prerendered snapshots in
  `prerendered/` are regenerated by `pnpm build` (needs `CHROMIUM_PATH`) and
  committed.

## GEO (AI search) status
- /availability reopened to crawlers on 2026-09-25 (PR #10): robots.txt now
  blocks only `/buyer-availability`, `/admin`, `/api/`; /availability is in
  the sitemap.
- GEO Phase 1: 9 of 12 items live as of 2026-09-26 (one Alvora Diamonds
  entity, article markup with real dates, breadcrumbs and ItemList on all 22
  insights articles, labelled answer blocks, bylines and last-reviewed dates,
  evidence labels on 8 volatile articles, llms.txt listing all 22 articles
  with a drift-guard test, the calibrated-parcel specification template page,
  the prompt panel). Owner-gated: redacted documents, off-site outreach,
  company facts (address, PIN, GSTIN, IEC, GJEPC).
- Readability: white-on-cream text fixed site-wide and DRAFT-VALUE terms
  removed (PR #21, contrast audit over 326 routes). Unconfirmed tolerance,
  MOQ and lead-time values read "On request".
- Stock facts from `server/data/stones.public.json` (3,185 stones): white
  colours D–G (plus 4 outliers), clarity IF–SI2 (mostly VVS2–VS1), cut mostly
  Ideal/Excellent. Public copy must match these.
- No "TODO" text may appear on public pages; unconfirmed specifics say
  "confirmed in your quotation" instead.

## Open items for the owner
- Rupee prices for earrings (on request for now); review exchange rates
  from time to time (see Prices).
- Logo file at `client/public/assets/brand/alvora-logo.png` (optional).
- Two Carat earrings appear to be the same product (flower-stud marquise vs
  marquise prong-style); decide whether to hide one.
- After launch: connect Google Search Console and Bing Webmaster Tools
  (the brand-search plan needs the Search Console login).
- Company facts for GEO/entity markup: address, PIN, GSTIN, IEC, GJEPC.
- Pendants: is there a pear pendant photo set (ALV-P-0004)? Is the spare
  rose-gold cushion set ALV-P-0018 Viola?
- Six likely-same-design ring pairs from the June Rings wave 2 import were
  kept separate pending review; three band designs are classed as rings.

## Commands
- `pnpm dev` (localhost:3000), `pnpm check`, `pnpm vitest run`, `pnpm build`.
- Deploy: live site matched `origin/main` on 2026-09-26 (PR #20 template page
  and PR #19 pendants were live). The older note says deploy is `railway up`
  from the owner's Mac; confirm which route is current before deploying.
- The owner's Mac copy at `LBG/website` could not fetch from GitHub on
  2026-09-26 (SSH host key check fails) and was behind `origin/main`. Work
  from a fresh HTTPS clone, not from that folder.
- Known pre-existing test failures: 12 as of 2026-09-26 (was 9). Compare
  against the main baseline, not zero.
- Prerender snapshots: 326 routes.
