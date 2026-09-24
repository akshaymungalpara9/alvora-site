# Alvora Jewellery: how to run it

Plain-English guide to the jewellery side of the site. Commands are run from the website folder on your Mac (`~/Claude/Projects/LBG/website`).

## Where things are

| What | Where |
|---|---|
| Jewellery homepage | `/` |
| Collections | `/engagement-rings`, `/earrings`, `/pendants`, `/jewellery` (everything), `/jewellery/antique-cuts`, `/jewellery/coloured-stones`, `/wedding-bands` (appears when bands go live) |
| Shape pages | `/engagement-rings/shape/oval` (and each other shape) |
| A piece | `/jewellery/<piece-name>` |
| Consultation | `/book-a-consultation` |
| Wholesale site (unchanged) | `/trade` and all its existing pages |
| Trade jewellery catalogue (no prices) | `/trade/jewellery` |
| Jewellery enquiry inbox | `/admin/jewellery` |
| Trade line-sheet requests | `/admin/briefs` (same inbox as other trade requests) |

## Adding the photos

1. Download the Drive folders `junerings-images`, `poojadiamond-images` and `caratdiamonds-images` from **Catalogue**.
2. Put them in `data/jewellery/raw-images/` so you have, for example, `data/jewellery/raw-images/junerings-images/marlow-east-west-oval/…jpg`.
3. Run `pnpm jewellery:images`.

Every photo is framed on an ivory background, gets the Alvora watermark, is renamed to the piece code (no partner names), and has its hidden file data stripped. Raw photos are never committed to GitHub.

Pieces whose photo folder could not be matched are listed in `data/jewellery/import-report.txt`. To fix one, set `imageFolder` for that piece in `data/jewellery/pieces.json` to the right folder name and run the command again.

**Branding any photos (one command):**
```
pnpm brand:image path/to/folder --out path/to/output-folder
```
This handles a whole folder, including sub-folders. Each photo gets:
- the soft ivory background (plain white or grey studio backgrounds are swapped for it, while diamonds and lifestyle photos are left alone)
- the Alvora watermark
- its hidden file details removed

Add `--keep-background` to skip the background swap, or `--size 2000` for larger files.

**Watermark logo:** save your logo (the version with the ALVORA wordmark underneath) as `client/public/assets/brand/alvora-logo.png`. The watermark then uses it automatically. You can also brand any single photo with `pnpm brand:image photo.jpg --out some-folder`.

## Names, prices and hiding a piece

All in `data/jewellery/pieces.json`. After editing, run `pnpm jewellery:build`.

- `name` changes the display name. Also change `slug` only if you want the web address to change.
- `priceUsd` sets a fixed "From" price for that piece and overrides the rule below.
- `hidden: true` removes the piece from the site.

**Price rule:** `data/jewellery/pricing.json` sets the "From" price as the partner price × `retailMultiplier`, rounded to `roundTo`. It is **1** today, which means partner prices are shown as-is. Set it to your markup (for example `2.2`) if the list prices are your cost.

Pieces with no price show "Price on request". These are currently the 45 June Rings pieces.

## Launching Wave 1-B

In `shared/jewellery/catalog.ts`, change `PUBLIC_WAVES` to `["A", "B"]`. In `scripts/jewellery/build-catalog.mjs`, change `PUBLIC_WAVES` to `["A", "B"]` as well. Then run `pnpm jewellery:build`.

## Enquiries

- Each enquiry is **saved first**, then emailed to the `LEAD_ALERT_TO` address, and the customer gets a confirmation email.
- If the database is ever unreachable, the email still goes out, marked "NOT SAVED", so no customer is lost.
- The database table is created automatically the first time an enquiry arrives. There is no manual step.
- The partner that makes a piece appears only in your internal email and in the admin inbox, never to customers.

## Before going live

Run `pnpm check`, `pnpm test` and `pnpm build`. The build fails if any page is missing a title or description. A test fails if a partner name appears anywhere visitors could see it.

The build also saves page snapshots into `prerendered/` so search engines see real content. Commit that folder after the build.
