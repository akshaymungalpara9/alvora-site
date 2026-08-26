# Current Production Availability CSV — Import Specification

Use a UTF-8 encoded, comma-separated `.csv` file with **one stone per row**. The first row must use the exact lowercase header spelling and order below. Do not include a title row, blank preamble rows, merged cells, currency fields, calculated fields, or totals.

```csv
stock_no,category,colour,shape,carat,carat_band,clarity,cut,polish,symmetry,measurements,depth_pct,table_pct,ratio,lab,cert_no,verify_url,video_url
```

| Header | Required | Expected value | Public handling and validation |
| --- | --- | --- | --- |
| `stock_no` | Yes | Unique stable stock identifier | A blank or duplicate value rejects the row. It is shown in the public catalog and buyer view. |
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
| `verify_url` | Yes | Valid `https://` or `http://` report-verification URL | A malformed URL rejects the row. For IGI report pages, the active catalog stores the confirmed report-diagnosis URL using the `r=<cert_no>` parameter. |
| `video_url` | No | Valid `https://` or `http://` video URL when present | Blank is accepted. A populated malformed URL rejects the row. A valid URL is visible only to approved buyers; no empty video placeholder is shown. |

## Non-negotiable no-price rule

This contract has **no price column**. Price data must not be included, displayed, calculated, inferred, filtered, sorted, exported, or added to buyer collateral. Public visitors may submit a request about a specific stone; approved buyers may place a request or request a hold. Neither action presents a price.

## Import outcomes

The protected importer validates every row before replacing the current snapshot. If any row is rejected, activation does not run and the administrator receives a report containing its **line number, stock number, and reason**. Rejected conditions include a non-exact header, blank or duplicate `stock_no`, invalid category, non-positive or non-numeric carat, missing `cert_no`, malformed `verify_url`, malformed populated `video_url`, and malformed populated numeric specification fields.

All structurally valid `White` and `Fancy Colour` rows are catalog rows. There is no legacy standard-menu or partner-origin review path in this contract.

## Replace, recovery, visibility, and freshness

Each successful upload creates a new catalog snapshot and makes it active in one database transaction. The prior active snapshot is archived rather than deleted, allowing an administrator to restore it if a replacement is wrong. Historic buyer requests and line sheets retain their original references.

`/availability` is public and paginated. It exposes every supplied non-price catalog specification and the report verification link, with filters for Shape, Carat band, Colour, and Clarity. Approved buyers receive the same current eligible stones plus any populated video link, a matching current line sheet, and Request or Hold actions. The existing server-enforced buyer early-access lock is unaffected by importing a catalog.

> Validating or importing a CSV does not approve a buyer, release protected buyer access, or change the controlled rollout setting.
