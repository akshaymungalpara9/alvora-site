# Live Availability CSV — Import Specification

Use a UTF-8 encoded, comma-separated `.csv` file with **one stone per row**. The first row must use the exact lowercase spelling and order below. Do not include title rows, blank preamble rows, merged cells, currency symbols, or totals.

```csv
sku,shape,carat,color,clarity,cut,fluorescence,measurements,igi_cert_number,video_url,price_usd,band_tag,origin_partner
```

| Header | Required | Expected value | Visibility and validation |
| --- | --- | --- | --- |
| `sku` | Yes | Unique stable availability identifier, for example `ALV-RND-001` | A blank or duplicate value rejects the row. |
| `shape` | Yes | Stone shape, for example `Round`, `Oval`, `Emerald`, or `Pear` | Stored in uppercase. Non-standard shapes are retained only as flagged admin-review rows. |
| `carat` | Yes | Positive decimal, for example `1.25` | No `ct` suffix. Values outside 1.00–4.19 are flagged, not silently dropped. |
| `color` | Yes | Colour grade, for example `D`–`H` | Values below H are flagged for review. |
| `clarity` | Yes | Clarity grade, for example `VVS2`, `VS1`, or `VS2` | Values below VS2 are flagged for review. |
| `cut` | Yes | `EX` or `Ideal` for the standard menu | Other non-empty values are flagged for review. |
| `fluorescence` | Yes | `None` for the standard menu | Any other non-empty value is flagged for review. |
| `measurements` | No | Concise dimensions, for example `6.90 x 6.92 x 4.25` | Shown only where appropriate to approved buyers. |
| `igi_cert_number` | Yes | Confirmed IGI certificate number | A blank value rejects the row. Validate the report independently before commercial release. |
| `video_url` | Yes | Reachable `https://` or `http://` media URL | A blank or malformed URL rejects the row. |
| `price_usd` | Yes | Positive decimal USD amount, for example `1250.00` | Blank, zero, negative, or non-numeric values reject the row. |
| `band_tag` | No | Internal commercial label, for example `Core` or `Premium` | Available to protected administration and buyer-aware operational handling. |
| `origin_partner` | No | Partner origin identifier | **Admin-only.** Never returned by public or buyer procedures and never included in buyer line-sheet PDFs. |

## Import outcomes

The protected importer validates every row before any current availability is replaced. If a row is rejected, the import does not run and the administrator receives a report containing its **line number, SKU, and reason**. Rejected conditions include a non-exact header, blank/duplicate `sku`, blank `igi_cert_number`, malformed or blank `video_url`, and blank, zero, negative, or non-numeric `price_usd`.

Rows that are structurally valid but outside Alvora’s standard menu are not silently dropped. They are stored in the new version as **flagged rows** for protected review, with a reason for each mismatch. Flagged rows are excluded from public production-profile matching, approved-buyer lists, and generated buyer line-sheet PDFs unless an administrator later resolves the standard issue through a future review change.

## Replace, recovery, and freshness

Each successful upload creates a new availability version and makes it the active version in one database transaction. The previous live version is archived rather than deleted, allowing an administrator to restore it if an upload is wrong. Buyer requests and historic line sheets retain their original saved references.

The public profile matcher and approved-buyer list use only the current active version’s standard-menu rows. Both surfaces show the active import timestamp as **Last refreshed**. The buyer early-access lock remains server-enforced and is not changed by importing data.

## Safe preparation

Before submitting a file to the protected importer, confirm that all live availability, pricing, report, and media fields are final. Do not include buyer names, individual contact details, trade terms, internal margin, or cost data. `origin_partner` is accepted solely for protected operational traceability.

> Uploading or validating a CSV does not itself approve any buyer, enable buyer early access, or change the controlled rollout setting.
