# Current Production Availability CSV — Import Specification

Use a UTF-8 encoded, comma-separated `.csv` file with **one stone per row**. The first row must use the exact lowercase header spelling and order below. Do not include a title row, blank preamble rows, merged cells, currency fields, calculated fields, or totals.

```csv
stock_no,category,colour,shape,carat,carat_band,clarity,cut,polish,symmetry,measurements,depth_pct,table_pct,ratio,lab,cert_no,verify_url,video_url
```

| Header | Required | Expected value | Public handling and validation |
| --- | --- | --- | --- |
| `stock_no` | Yes | Unique stable stock identifier | A blank or duplicate value rejects the row. It is shown in the public catalog. |
| `category` | Yes | Exactly `Fancy Colour` or `White` | Determines the public collection; Fancy Colour is presented first. |
| `colour` | Yes | The supplied colour or Fancy Colour expression | Shown verbatim as a catalog specification. |
| `shape` | Yes | Stone shape | No prescribed menu applies; structurally valid supplied shapes remain in the catalog. |
| `carat` | Yes | Positive decimal, without a `ct` suffix | Shown as a catalog specification. |
| `carat_band` | Yes | Source-defined carat-band label | Used as a public catalog filter. |
| `clarity` | Yes | Source-defined clarity value | Used as a public catalog filter. |
| `cut` | No | Cut detail when supplied | Shown only when populated. Blank values are accepted for Fancy Colour rows. |
| `polish` | No | Polish detail when supplied | Shown only when populated. |
| `symmetry` | No | Symmetry detail when supplied | Shown only when populated. |
| `measurements` | No | Concise dimensions, for example `6.90 x 6.92 x 4.25` | Shown only when populated. |
| `depth_pct` | No | Positive numeric percentage without `%` | Shown only when populated. |
| `table_pct` | No | Positive numeric percentage without `%` | Shown only when populated. |
| `ratio` | No | Positive numeric ratio | Shown only when populated. |
| `lab` | Yes | Laboratory name, such as `IGI` | Shown as certification context. |
| `cert_no` | Yes | Real certificate/report number | A blank value rejects the row. |
| `verify_url` | Yes | Valid `https://` or `http://` report-verification URL | A malformed URL rejects the row. For IGI report pages, the active catalog stores `https://api.igi.org/viewpdf.php?r=<cert_no>`. |
| `video_url` | No | Valid `https://` or `http://` video URL when present | Blank is accepted. A populated malformed URL rejects the row. A valid URL is publicly visible; no empty video placeholder is shown. |

## Non-negotiable no-price rule

This contract has **no price column**. Price data must not be included, displayed, calculated, inferred, filtered, sorted, exported, or added to catalog collateral. Public visitors may submit a request about a specific stone. That action does not present a price.

## Import outcomes

The protected importer validates every row before replacing the current snapshot. If any row is rejected, activation does not run and the administrator receives a report containing its **line number, stock number, and reason**. Rejected conditions include a non-exact header, blank or duplicate `stock_no`, invalid category, non-positive or non-numeric carat, missing `cert_no`, malformed `verify_url`, malformed populated `video_url`, and malformed populated numeric specification fields.

All structurally valid `White` and `Fancy Colour` rows are catalog rows. There is no legacy standard-menu or partner-origin review path in this contract.

## STATEMENT collection contract

`STATEMENT` is a **separate, independently replaceable** collection. Its rows never route into the Fancy Colour or White tabs; the supplied `category` remains a stone specification for grouping and filtering only. The exact UTF-8 CSV header is:

```csv
stock_no,category,type,colour,shape,carat,carat_band,clarity,cut,polish,symmetry,fluorescence,measurements,ratio,depth_pct,table_pct,crown_height,pavilion_depth,crown_angle,pavilion_angle,girdle_pct,lab,cert_no,cert_pdf_url,video_url,image_url
```

`stock_no`, `category` (`White` or `Fancy Colour`), `type`, `colour`, `shape`, positive `carat`, `carat_band`, and `clarity` are required. The supplied `cert_pdf_url`, `video_url`, and `image_url` must be valid `http` or `https` URLs when populated. Blank `cert_no`, `lab`, `cert_pdf_url`, or `video_url` values are retained as blank data: the catalog does not fabricate a certificate link or a media placeholder. Literal `null` in optional source fields is treated as blank.

The STATEMENT card uses `cert_pdf_url` exactly as supplied, so IGI and GIA certificate destinations remain source-accurate. It may show its supplied 360° viewer and still image publicly. A successful STATEMENT refresh archives and replaces **only** the prior STATEMENT snapshot; it does not alter the active core Fancy Colour or White snapshot.

## Replace, recovery, visibility, and freshness

Each successful upload creates a new catalog snapshot and makes it active in one database transaction. The prior active snapshot **for the same collection** is archived rather than deleted, allowing an administrator to restore it if a replacement is wrong. Historic buyer requests and line sheets retain their original references.

`/availability` is public and paginated. It exposes every supplied non-price catalog specification, populated media link, and supplied report verification link, with filters for Shape, Carat band, Colour, and Clarity. Specific-stone enquiries prefill the public production brief; they do not reveal a price. Catalog imports never alter protected administrator access.

> Validating or importing a CSV does not create customer identities, change public catalog visibility, or alter protected administrator access.
