# Phase 1 brief: measure, claim, convert (26 Sep to 10 Oct 2026)

Owner: Akshay Mungalpara. Strategy: Claude. Execution: the owner's coding agents.
Audience order (owner decision, 26 Sep): D2C jewellery buyers first; traders, brokers and jewellers second.

## Why this phase, in one paragraph

The site is live with 232 pieces and most of the GEO extraction layer, but nobody can yet tell which page or channel produced an enquiry. Search Console is not connected, UTM tags are thrown away (the site stores only the landing path, never the query string), WhatsApp clicks are counted without the landing page or referrer, and the Organization entity still describes a trade-only manufacturer with an empty `sameAs`. Phase 1 fixes measurement first, then claims the brand entity, then points the three channels you already own (Instagram, Pinterest, IndiaMART) at the pages that convert. Nothing in this phase invents a claim, a price or a figure.

## Step 0: you, today, no agent needed (about 45 minutes)

| # | Task | Done when |
|---|------|-----------|
| 0.1 | Merge branch `docs/claude-md-2026-09-26` on GitHub (docs only, no site change). | CLAUDE.md on `main` shows "Owner decisions (2026-09-26)". |
| 0.2 | Railway: Service, Settings, Source. Confirm repo `akshaymungalpara9/alvora-site`, branch `main`, auto-deploy on. Stop using `railway up` from the Mac. | Source shows `main`; you have written "GitHub only" next to the deploy step in your notes. |
| 0.3 | Google Search Console: add a Domain property for `alvoradiamonds.com` (DNS TXT at GoDaddy), then submit `https://www.alvoradiamonds.com/sitemap.xml`. | Sitemap status "Success". |
| 0.4 | Bing Webmaster Tools: "Import from Google Search Console". | Site listed and sitemap imported. |
| 0.5 | Railway Variables: confirm `VITE_GA4_MEASUREMENT_ID` is set and that the Umami script is live. Open the site, accept analytics, check GA4 Realtime shows you. | One realtime visit visible. |
| 0.6 | Send Claude: the Instagram, Pinterest and IndiaMART (Alvora Diamonds account, not Fabrics) URLs; the role line for Akshay and for Rashesh; whether customers may visit Diamond World by appointment. | Received. |

Step 0 unblocks everything else. 1A can start in parallel; 1B waits on 0.6.

## Workstreams

| ID | Workstream | Audience | Depends on | Runs as |
|----|-----------|----------|-----------|---------|
| 1A | Attribution that survives UTMs and WhatsApp | Both | Nothing | Agent PR |
| 1B | Brand entity: sameAs, named authors, entity description | Both, GEO | 0.6 plus your approval of one sentence | Agent PR |
| 1C | Money page refresh: marquise engagement rings | D2C | 1A merged | Agent PR |
| 1D | Pinterest and Instagram as inbound channels | D2C | 1A merged, URLs | Agent PR plus you in the apps |
| 1E | Trade door and IndiaMART | Trade | 1A merged | Agent PR plus you in IndiaMART |
| 1F | Earrings readiness (decision only) | D2C | Your rupee price table | You |

Order: 0, then 1A, then 1B/1C/1D/1E in any order. One PR per workstream so each can be reviewed alone.

## Rules every agent prompt carries

Copy this block to the top of every prompt below.

```
Repo: https://github.com/akshaymungalpara9/alvora-site (clone fresh over HTTPS; do NOT use the Mac folder LBG/website, it is out of date).
Read CLAUDE.md first and follow its hard rules: no partner names, every public claim true and sourced, no em-dashes anywhere (code strings, copy, commit messages).
Work on a new branch and open a pull request against main. Do not merge. Do not deploy.
Gates before the PR: pnpm check clean; npx tsx scripts/validate-seo-meta.ts passes; pnpm vitest run shows no new failures against main (12 known pre-existing failures); pnpm build (with CHROMIUM_PATH) and commit regenerated prerendered/ snapshots.
Append one entry to seo/LOG.md in its existing format (Changed / Why / Measure).
In the PR description list every changed public URL and paste the gate results.
```

## 1A. Attribution that survives UTMs and WhatsApp

Why: from Phase 1 onwards, every Pinterest pin, Instagram link and IndiaMART listing carries UTM tags. Today `rememberLandingPage()` in `client/src/lib/ga4.ts` stores `window.location.pathname` only, so the tags vanish. `trackWhatsappClick()` sends only the page and the CTA position, and WhatsApp is the main D2C path. AI assistants as referrers (the GEO measurement promise) are not classified.

Prompt:

```
[rules block]

Task: make every enquiry and WhatsApp click traceable to its first page and its source.

1. In client/src/lib/ga4.ts, extend rememberLandingPage() so the first page of the visit also stores utm_source, utm_medium and utm_campaign from the query string (if present), in the same sessionStorage record. Keep the no-cookie design.
2. Extend landingContext() to return those three values. trackConversion() must send them as utm_source, utm_medium, utm_campaign alongside landing_page and referrer_host.
3. trackWhatsappClick() must send the same landing_page, referrer_host and utm fields as trackConversion().
4. Add a helper classifySource(referrerHost, utmSource) returning one of: "google", "bing", "ai_assistant", "pinterest", "instagram", "indiamart", "email", "direct", "other". ai_assistant matches chatgpt.com, chat.openai.com, perplexity.ai, gemini.google.com, copilot.microsoft.com, claude.ai. Send it as source_class on every conversion and WhatsApp click.
5. jewellery_enquiries: add nullable columns utmSource, utmMedium, utmCampaign, sourceClass (new Drizzle migration; do not touch existing rows). EnquiryForm already spreads landingContext(); make sure the server router accepts and stores the new fields.
6. Show landingPage, referrer, sourceClass and the utm fields on the admin enquiry view, so the owner can see where each enquiry came from.
7. Tests: unit tests for classifySource and for the landing record with and without UTMs.

Do not change any visible copy.
```

Acceptance: open `/engagement-rings?utm_source=pinterest&utm_medium=social&utm_campaign=p1-2026-10`, go to a product, submit a test enquiry, and see `pinterest / social / p1-2026-10 / pinterest` in the admin view. Delete the test row after.

## 1B. Brand entity: sameAs, named authors, entity description

Why: GEO Phase 1 item 2 is the only extraction item still open. AI answers and Google's brand panel pull the entity from the Organization node, which today says "Surat lab-grown diamond manufacturer making certified, calibrated diamonds..." That is the trade story only, and D2C is now primary. Named authors are stronger than "Alvora Diamonds editorial team".

Your approval needed before the agent runs: the new entity description. Proposed wording (edit freely; every word must be true):

> Alvora Diamonds is a lab-grown diamond house in Surat, India, making engagement rings and fine jewellery to order and supplying certified loose lab-grown diamonds to the jewellery trade.

Prompt:

```
[rules block]

Task: complete the Alvora Diamonds entity.

Inputs (fill before running):
- INSTAGRAM_URL, PINTEREST_URL, INDIAMART_URL (Alvora Diamonds account)
- AKSHAY_ROLE, RASHESH_ROLE
- ENTITY_DESCRIPTION (owner-approved sentence)

1. server/seoInjection.ts buildOrgJsonLd(): set sameAs to exactly the three URLs above, nothing else. Replace the Organization description with ENTITY_DESCRIPTION. Keep @id values unchanged.
2. Add two Person nodes to the same @graph: @id `${origin}/#akshay-mungalpara` and `${origin}/#rashesh-vadodariya`, with name, jobTitle (the roles above) and worksFor pointing at #organization. No sameAs on the Person nodes unless a URL is supplied.
3. Insights articles: replace the author string 'Alvora Diamonds editorial team' in client/src/pages/Insights.tsx with a per-article author. Default: Akshay Mungalpara for trade and sourcing articles, Rashesh Vadodariya for none until the owner assigns articles (leave a mapping object in one file so the owner can change it). Article JSON-LD author becomes the Person @id; visible byline shows "By <name>, <role>".
4. Add a short /about section "Who we are" naming both people and their roles, factual only, no claims beyond the roles.
5. Footer: add Instagram and Pinterest links (rel="me noopener").
6. Update llms.txt if it names authors. Re-run the llms.txt drift guard test.
```

Acceptance: Rich Results Test on `/` and on one insights article shows Organization with 3 sameAs entries and Article author as a Person. No "editorial team" string left on public pages.

## 1C. Money page refresh: marquise engagement rings

Why: `/engagement-rings/shape/marquise` is the current money page (`seo/STATE.md`) and has not had its launch checkup. The June Rings wave 2 import added marquise and Dutch marquise pieces after the page brief was written, and prices moved to rupees (from ₹30,000) with the E/VS1/Excellent centre-stone standard. `/earrings` was named as the next bet, but its pieces now show "Price on request" and 12 of 32 are hidden, so it stays parked until 1F.

Prompt:

```
[rules block]

Task: bring the marquise money page up to date. Do not change the URL, title pattern or H1 target query ("vintage marquise engagement ring") set in seo/STATE.md.

1. Count the shown marquise engagement-ring pieces from shared/jewellery/catalog.json (isShown only) and how many are Dutch marquise. Put both numbers in the PR description.
2. Intro copy: state the live piece count, the "from" price (read it from shared/jewellery/pricing.ts, do not type a number), the E colour, VS1 clarity, "Excellent polish and symmetry" centre-stone standard and the 0.5 to 6 ct choice. Use the existing centreStone.ts helpers so wording stays in one place.
3. Add an answer block at the top (same component the insights articles use) answering "What is a vintage marquise engagement ring?" in two or three sentences, plus a "What this means for you" line, D2C voice.
4. Internal links: link to this page from /guides/dutch-marquise-vs-marquise (already exists), from the /engagement-rings collection intro, and from the homepage shape strip if one exists. Anchor text varies; no exact-match stuffing.
5. ItemList JSON-LD on the page lists every shown marquise piece in display order.
6. Ensure every product card on the page has a unique, descriptive alt text built from name, shape, style and metal.
```

Acceptance: page shows the live count and the price pulled from code; Rich Results Test shows ItemList; three internal links point to it.

## 1D. Pinterest and Instagram as inbound channels

Why: both channels are D2C-native, and the catalogue already has 232 branded photo sets plus JPEG social images per piece (`/assets/social/pieces/<code>.jpg`). Pinterest search behaves like a visual search engine for engagement rings; every pin is a durable, UTM-tagged link.

Prompt (agent part):

```
[rules block]

Task: prepare the site and a bulk file for Pinterest and Instagram.

1. Pinterest domain claim: support an env var PINTEREST_DOMAIN_VERIFY; when set, inject <meta name="p:domain_verify" content="..."> in the head of every page (server/seoInjection.ts). No value hard-coded.
2. Product pages: og:type becomes "product" and add product:price:amount and product:price:currency (INR) only where the piece has a rupee price; Price-on-request pieces get neither tag.
3. Write scripts/social/pinterest-feed.mjs that reads shared/jewellery/catalog.json (shown pieces only) and writes data/social/pinterest-bulk.csv in Pinterest's bulk-upload columns: Title, Media URL, Pinterest board, Description, Link, Keywords.
   - Media URL: https://www.alvoradiamonds.com/assets/social/pieces/<code>.jpg
   - Link: the product URL + ?utm_source=pinterest&utm_medium=social&utm_campaign=p1-2026-10
   - Board: "Marquise engagement rings", "Oval engagement rings", "Emerald cut engagement rings", "Coloured stone rings", "Diamond earrings", "Diamond pendants" and so on, derived from category and shape; one board per shape with 5 or more pieces, else "Lab-grown engagement rings".
   - Title max 100 chars: "<Name>: <shape> lab-grown diamond <category>". Description max 500 chars from the piece description plus centre-stone line; no prices; no partner names.
4. Write data/social/instagram-links.md: one UTM link per collection for bio and story links (utm_source=instagram&utm_medium=social&utm_campaign=p1-2026-10).
5. Add pnpm social:pinterest to package.json.
```

You, in the apps (after the PR merges):
1. Pinterest Business: claim the website with the meta value (give it to the agent as `PINTEREST_DOMAIN_VERIFY` in Railway), create the boards the CSV names, bulk-upload `data/social/pinterest-bulk.csv` in batches of about 50 a day rather than all 232 at once.
2. Instagram: bio link to `/engagement-rings` with the Instagram UTM; a pinned highlight per collection using the links file.

Acceptance: Pinterest shows the site as claimed; first 50 pins live; a test click from a pin shows `source_class = pinterest` in GA4.

## 1E. Trade door and IndiaMART

Why: trade buyers must also drive sales, but they should not dilute the D2C first screen. Today the trade route is one link at the far right of the nav. One clear secondary door, plus IndiaMART pointing at the trade pages with tags, is enough for Phase 1.

Prompt:

```
[rules block]

Task: make the trade route easy to find without changing the jewellery-first homepage.

1. Homepage hero: add a secondary text link under the primary CTA: "Jewellers and trade buyers: loose diamonds and trade jewellery" linking to /trade. Visually secondary to the existing primary button.
2. Jewellery nav: keep "For the trade" but make it visible in the mobile menu's first screen, not only after scrolling.
3. Footer: add a "For the trade" column: /trade, /availability, /trade/jewellery, /request-a-quote.
4. /trade/jewellery: make the line-sheet request visible above the fold on phones.
No new claims; reuse existing copy where possible.
```

You, in IndiaMART (Alvora Diamonds account): every product listing links to the matching trade page with `?utm_source=indiamart&utm_medium=listing&utm_campaign=p1-2026-10`. Loose stones go to `/availability`, jewellery lines to `/trade/jewellery`.

## 1F. Earrings readiness (your decision, no agent)

`/earrings` has the biggest search demand in the plan (lab grown diamond earrings, 9,900 a month in `seo/STATE.md`), but it cannot be a money page while every piece says "Price on request". Before Phase 2 can target it, send a rupee "from" price for studs and for drop or hoop styles, in the same form as the engagement-ring table. If you prefer earrings to stay on request, say so and Phase 2 picks the next shape page instead.

## Checkpoint on 10 October

Phase 1 closes when all of these are true. Send Claude the answers and Phase 2 is written from them.

| Check | Where to look |
|-------|--------------|
| Search Console and Bing verified, sitemap read | GSC Sitemaps, Bing |
| Test enquiry shows landing page, referrer, UTM and source class | Admin enquiry view |
| Organization has 3 sameAs; articles show a named author | Rich Results Test |
| Marquise page shows live count and code-driven price | Page and PR |
| At least 50 pins live, Instagram bio link tagged | Pinterest, Instagram |
| IndiaMART listings link to trade pages with UTMs | IndiaMART |
| Earrings price decision made | Your reply |

Numbers to send at the checkpoint: GSC impressions and clicks for the 14 days (whatever exists), enquiries by source_class, WhatsApp clicks by landing page, and pins published.

## Not in Phase 1, on purpose

GEO Phase 2 trade pages (calibrated baguettes, step cuts, US buyer documents) move to Phase 2 and get ranked by trade enquiry potential. Redacted proof documents, off-site pitches (JCK, National Jeweler, Lab Grown Magazine), Google Business Profile (waits on the visit question and full address) and the monthly prompt panel run (your tools, first run in October) are scheduled after the checkpoint. The damaged-photo sweep and the 4 on-hand-only pieces stay on their own track.
