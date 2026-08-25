# Partner Availability CSV — Import Specification

Use a UTF-8 encoded, comma-separated `.csv` file with **one stone per row**. The header row must use the exact spelling, spacing, and order below. Do not add title rows, merged cells, currency symbols, or subtotal rows.

```csv
Stock #,Report #,Shape,Weight,Color,Clarity,Cut,Polish,Lab,Final Price,Location,Availability
```

| Header | Required | Expected value | Notes |
| --- | --- | --- | --- |
| `Stock #` | Yes | Unique partner or Alvora stock identifier, for example `ALV-EXAMPLE-001` | Must be unique across the file. This is the stable inventory key used for updates. |
| `Report #` | Yes | Confirmed IGI certificate number, for example `IGI-123456789` | This must be IGI-validated before upload. It drives the line-sheet certificate column and private-request alert subject. Do not leave blank. |
| `Shape` | Yes | `ROUND`, `OVAL`, `PEAR`, `EMERALD`, `CUSHION`, `RADIANT`, `PRINCESS`, or `MARQUISE` | Use uppercase values. Other shapes can be accepted only after the approved buyer bands are extended. |
| `Weight` | Yes | Decimal carat weight, for example `1.25` | Numbers only; no `ct` suffix. This is the exact import header for carat values. |
| `Color` | Yes | Diamond colour grade, for example `D`, `E`, `F`, `G`, `H`, `I`, or `J` | Use uppercase letters only. |
| `Clarity` | Yes | Clarity grade, for example `VVS2`, `VS1`, `VS2`, `SI1` | Use uppercase values only. |
| `Cut` | Yes | `EX`, `VG`, `GD`, or `ID` | Use `EX` for Excellent and `ID` for Ideal. |
| `Polish` | Yes | `EX`, `VG`, `GD`, or `ID` | Use the laboratory/partner assessment value. |
| `Lab` | Yes | `IGI` | The private-list workflow is currently limited to IGI-certified stones. |
| `Final Price` | Yes | Decimal number in the agreed list currency, for example `1250.00` | Numbers only; no currency signs, commas, or text. This is the price shown on the buyer line sheet. |
| `Location` | Yes | `India` or the actual dispatch location | Keep the value concise and consistent across the export. |
| `Availability` | Yes | `Available` or `Unavailable` | Only rows marked `Available` are eligible for private-list display and buyer line sheets. |

## File checks before upload

Every row intended for early access must have a unique `Stock #`, a non-blank IGI-validated `Report #`, and a numeric `Final Price`. The export should contain only live stones; remove sold, held, duplicated, and provisional entries before sending it. Use `Available` only where the partner has confirmed that the stone can be dispatched on the agreed timetable.

> Do not include buyer names, trade terms, internal margins, supplier costs, or personal contact data in the CSV.

The provided `partner_availability_import_template.csv` contains the exact header and one illustrative row. Replace that row with confirmed partner inventory before upload.
