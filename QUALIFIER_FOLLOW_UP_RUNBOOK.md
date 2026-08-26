# Hourly qualifier follow-up runbook

## Purpose

This workflow sends **one concise request for missing brief detail** when a saved production brief has remained eligible for at least 24 hours. It is designed for the public production-brief process only. It does not alter buyer availability, inventory, approval, or the existing early-access lock.

## Preconditions

The site must first be published from the checkpoint that contains this runbook and the scheduled callback route. The scheduler must not be enabled against a development preview. Confirm that `RESEND_API_KEY`, `ALVORA_EMAIL_FROM`, and `LEAD_ALERT_TO` remain configured before enabling it.

| Item | Expected state | Why it matters |
| --- | --- | --- |
| Public brief is saved | `production_briefs` record exists | The lead remains retrievable even if either email attempt fails. |
| Immediate acknowledgement | Audited as `sent` or `failed` | It is separate from the internal alert and the later qualifier follow-up. |
| Eligibility | `qualifierFollowUpStatus = pending` and creation time is at least 24 hours ago | The hourly callback considers only due, unsent briefs. |
| Stop condition | Admin sets `followUpStatus = shortlist_sent` | This atomically changes the qualifier state to `paused` before a later hourly run can claim it. |

## Enable after publication

Sign in as an Alvora administrator, open **Production Briefs**, and select **Enable hourly follow-up**. That protected action creates or re-enables the project job with the hourly UTC cadence `0 0 * * * *` and binds it to `/api/scheduled/qualifier-follow-ups`.

The callback accepts only the platform-managed cron identity. It finds the persisted schedule using its task identifier, skips orphaned or disabled jobs safely, and never trusts client-supplied callback data.

## Expected delivery behavior

Each candidate is atomically moved from `pending` to `processing` before email delivery begins. The system then creates an immutable email log, sends the concise request through Resend with the trade inbox as reply-to, and records either `sent` or `failed`. A second callback cannot claim the same pending record, so it cannot issue a second follow-up.

> If an administrator has already marked **shortlist sent**, the candidate is paused and the scheduler cannot claim it.

## Investigation and recovery

Use the protected Production Briefs screen to inspect the brief’s follow-up state, its alert status, and the internal note. A failed qualifier delivery remains in the database and email log; it does not remove the saved brief or silently send another message. Review the delivery error, correct the relevant email configuration or recipient issue, then decide whether a manual customer follow-up is appropriate. The schedule’s execution history and failures are available through the project’s protected schedule controls after publication.

## Verification after enabling

Do not create buyer, inventory, or fabricated enquiry data to test this workflow. Instead, use an authorised non-production test brief only when the owner approves it, verify exactly one recorded follow-up delivery after the due time, then verify that a second eligible test brief marked **shortlist sent** remains paused across the next hourly run.
