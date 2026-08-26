# Availability Import Readiness Record

## Current state

The protected availability import workflow is configured but **no live availability rows have been imported**. The active buyer-release control remains unchanged. The public profile matcher therefore shows its intentional reviewed-refresh empty state, and private availability remains subject to authentication, approval, buyer bands, and the existing server-enforced early-access lock.

## Accepted CSV contract

The importer accepts only a UTF-8 CSV whose first row exactly equals the following value, including spelling and order.

```csv
sku,shape,carat,color,clarity,cut,fluorescence,measurements,igi_cert_number,video_url,price_usd,band_tag,origin_partner
```

Rows missing `igi_cert_number`, a valid `video_url`, or a positive `price_usd` are rejected before activation. The protected administrator receives a line number, SKU, and reason for every rejected row. Structurally valid rows outside the agreed standard menu are retained in the new snapshot as flagged rows, but are excluded from public profiles, buyer lists, and buyer line-sheet PDFs.

## Attached legacy export

The attached `Alvora_Nivoda_Upload_100SKU.csv` was checked only with the offline preflight. It was blocked because its header does not match the normalized contract. No data was inserted, updated, deleted, or activated.

## Privacy and recovery

`origin_partner` is visible only in protected administration. It is not returned by public profile queries or approved-buyer availability queries and is not rendered in line-sheet PDFs. A validated replacement creates a new active snapshot while archiving the prior snapshot. An administrator can restore an archived snapshot from the protected Availability import screen.

## Verified presentation

The public English and French routes retain their premium production presentation and display the new matched-profile area only after an active reviewed import exists. The protected Availability import screen renders the validation and recovery controls inside the existing Alvora admin shell.

At a 375×812 viewport, the English and French public routes retain readable live-profile empty states and shape controls without horizontal overflow. The protected Availability import screen presents its upload, validation, summary, standards-review, and recovery areas as a single-column administrative workflow. No availability data was created during visual verification.

The protected Operations and Production Briefs screens were also rechecked at a 375×812 viewport after their administrator-query gates were tightened. Both screens load their authorised zero-data states, preserve market-aware controls, and keep the early-access warning visible without blank-page failures.
