# SEO brief: Alvora fine jewellery

The agent reads this first on every run. Edit it when the business changes.

## The business
Alvora is a lab-grown diamond house in Surat, India. The site sells finished fine jewellery (engagement rings, earrings, pendants) in 14K/18K gold, set with lab-grown diamonds. Buying is **enquiry-first**: the customer picks a piece and options, we reply with a written price, and nothing is made or charged until they confirm. The wholesale diamond business lives under `/trade` and is out of scope for this loop.

## Who buys
Couples in the US (primary market, prices in USD) looking for a lab-grown engagement ring from about $600 to $1,500, especially vintage and unusual shapes (Dutch marquise, old mine, elongated cushion, east-west). A second group buys everyday earrings and pendants from $90 to $430.

## What counts as a conversion
Named events, each carrying `landing_page` and `referrer_host` (GA4 and Umami; also stored on the enquiry row):

| Event | Meaning | Value |
|---|---|---|
| `jewellery_enquiry` | Enquiry form sent from a product page | Primary |
| `consultation_request` | Consultation form sent | Primary |
| `whatsapp_click` | WhatsApp button pressed (product page: `cta_location=jewellery_product`) | Secondary |
| `trade_linesheet_request` | Trade catalogue request (trade loop, not this one) | n/a |

A page that ranks but produces none of these is a **trap**, not a win.

## Rules for the agent
- One money page at a time; one change per cycle once the site is live and has a baseline.
- Every claim in a report links to its source. If data is missing, say "missing"; never fill the gap with a guess.
- Never publish, deploy or edit live content without the owner's explicit yes.
- Ignore ranking moves shorter than two weeks. Judge a change on search **and** conversions together.
- Schema only where the page qualifies for a rich result (Product, Breadcrumb). It is not an AI-answers shortcut.
- Partner names never appear anywhere public (see `server/jewelleryPartnerGuard.test.ts`).

## Tools available
- Semrush (keywords, SERPs): **units exhausted on 2026-09-24**; refills with the next billing period.
- Google Search Console: **not connected yet**. Connect when the jewellery site goes live (see LOG).
- Web search: available. Direct page reading of competitor sites is blocked from the cloud environment, so competitor findings come from search excerpts only.
