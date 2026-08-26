# Controlled inventory-release runbook

This runbook is the operating sequence for a future partner inventory export. It is intentionally **non-executing**: it does not contain inventory data, does not approve buyers, does not send email, and does not alter the controlled early-access lock. The public manufacturing site and public production-brief workflow remain live throughout.

> **Release principle:** a CSV passing local checks is not approval to publish buyer availability. A buyer release requires confirmed IGI report verification, price confirmation, data review, and the owner’s explicit written approval.

| Gate | Required evidence | Outcome if incomplete |
| --- | --- | --- |
| File contract | Exact UTF-8 CSV headers, one stone per row, and no personal, credit, margin, or partner-cost data | Do not continue to preflight. |
| Preflight | A `PASS` result from the offline validator | Correct the export; do not import. |
| Certificate review | Every intended early-access `Report #` checked against the IGI database by the operating team | Exclude any unverified or mismatched row. |
| Commercial review | Confirmed final price, live availability, dispatch location, and an internal revision/timestamp from the partner | Hold provisional, held, sold, or unpriced stones. |
| Import review | Generated import output reviewed before application, with post-import row and field checks | Do not expose a buyer list. |
| Release authorisation | Explicit owner approval to enable early access after the preceding gates | Keep `ALVORA_EARLY_ACCESS_ENABLED=false`. |

## 1. Receive and isolate the partner file

Save the partner file outside the public application and retain its original filename, source, and received time in the internal operating record. The file must use the exact contract in [`PARTNER_AVAILABILITY_IMPORT_SPEC.md`](./PARTNER_AVAILABILITY_IMPORT_SPEC.md). It must not include buyer names, trade terms, internal margins, supplier costs, or personal contact data.

Do not replace the current availability data, edit a certificate number, fill a missing price, or convert a provisional line into `Available` during receipt. Any incomplete record remains excluded until the partner supplies verified data.

## 2. Run the offline CSV preflight

Run the following command against the received export:

```bash
node scripts/validate-partner-availability.mjs /absolute/path/to/partner_export.csv
```

The command is a format and quality check only. It requires the exact header sequence, required fields, unique `Stock #` values, accepted shape/grade/finish values, `Lab=IGI`, plausible report syntax, a positive decimal `Final Price`, and `Available` or `Unavailable` status. It does **not** import data, query the live IGI database, change buyer access, create line sheets, or send alerts.

If the command reports `BLOCKED`, return the diagnostic list to the partner or correct only partner-confirmed values. A `PASS` result advances the file to human verification; it does not make it buyer-ready.

## 3. Verify certificate and commercial readiness

For every row proposed for early access, the operating team must confirm that the `Report #` matches the stone’s supplied details in the IGI database. Record the verification time and reviewer in the internal operational record; do not add this evidence to public copy or buyer-facing exports.

At the same review point, confirm that the `Final Price` is the currently agreed list price, that `Availability=Available` is genuinely dispatchable, and that `Location` is a usable dispatch location. Exclude records with certificate discrepancies, unavailable status, unclear price currency, expired partner confirmation, or unresolved commercial conditions.

## 4. Prepare and review the import

Only after the preceding checks pass should the operating team prepare the import output using the current project import tooling. Review the generated output before applying it. The review must confirm the expected count of eligible `Available` stones, non-blank report numbers, numeric final prices, and preservation of `Unavailable` rows where they are retained for internal availability state.

Apply no destructive database action. If an import requires a correction, prepare a new reviewed input or use the project’s checkpoint recovery path rather than manually editing buyer-visible certificate or price values.

## 5. Post-import non-release verification

With `ALVORA_EARLY_ACCESS_ENABLED` still set to `false`, verify that the stored records retain their confirmed report numbers, final prices, shape, carat, colour, clarity, cut, polish, location, and availability status. Confirm that line-sheet generation uses the stored report and price fields, and that private request subjects resolve the confirmed IGI report number. Do not generate buyer collateral from missing or provisional values.

The admin operations view may be used to review data readiness, but no buyer account should be approved or welcomed at this stage. The public homepage, localized landing pages, and public production-brief forms remain independent of this inventory gate.

## 6. Explicit controlled-release approval

Early access stays server-locked by `ALVORA_EARLY_ACCESS_ENABLED=false`. Change it to `true` only after all gates above pass **and** the owner explicitly authorises the release. The authorisation should state the approved inventory revision, scope of buyers, and intended release time.

After the owner approves, verify the guard-enabled buyer workflow with a controlled administrator session before approving real buyers. Approval triggers, welcome emails, private availability, line-sheet creation, and stone requests are already server-gated and must remain unavailable if the flag is false.

## 7. Release monitoring and reversal

After release, monitor buyer requests, email delivery logs, and alert failures through protected operations views. Keep the source export and import review record for traceability. If a confirmed report number, price, or availability status becomes invalid, remove or correct the affected inventory through a reviewed update, keep the early-access lock decision under owner control, and use a saved project checkpoint for application-code recovery when required.

## Non-negotiable prohibitions

The operating team must not fabricate inventory, report numbers, prices, buyer accounts, customer leads, reviews, or dispatch commitments. Preflight success is not a certificate verification. A partner file alone is not permission to enable early access.
