# Phase 4 Operations Runbook

## Purpose

This runbook defines the operational process for converting Alvora production briefs into qualified conversations, quotations, samples, orders, and repeat programmes. It is intentionally usable before a third-party CRM or WhatsApp Business API is connected.

## Lead stages

| Stage | Meaning | Required next action |
|---|---|---|
| `new` | A brief has been saved but not reviewed. | Confirm commercial fit, market, category, and completeness. |
| `reviewing` | The Alvora team is checking the requirement. | Assign an owner and record the missing information or proposed route. |
| `shortlist_sent` | A relevant shortlist, profile, or sample direction has been sent. | Record what was sent and pause automated qualifier follow-up. |
| `quoted` | A commercial quotation or defined next step has been issued. | Record quotation date, validity, and buyer response. |
| `on_hold` | The opportunity is active but waiting on the buyer, timing, documents, or internal decision. | Record the reason and the next review date. |
| `closed` | The active follow-up is complete. | Record whether it was won, lost, deferred, or converted to a repeat-order opportunity in the internal note. |

The current database intentionally keeps the public stage vocabulary small. Until dedicated outcome fields are approved and migrated, use the internal note for the final outcome using this format: `Outcome: won|lost|deferred|repeat; Reason: ...; Next action: ...`.

## Minimum qualification record

Every reviewed lead should have an owner, buyer type, market, category, intended quantity, required date, and a concise technical requirement. Do not put sensitive personal information into analytics properties. Contact details remain in the protected lead workflow and approved internal systems.

## Human handoff

Automated acknowledgement may confirm receipt, but a human should own the commercial conversation. Automation must stop when the buyer asks for a quotation, shares a non-standard technical requirement, asks about destination compliance, requests a hold, or presents a complaint. The owner should record the next action and target date before closing the lead record.

## WhatsApp readiness gate

Do not activate an official WhatsApp Business API flow until Alvora has a verified business number, approved provider, message templates, opt-in language, human escalation path, retention policy, and test coverage for wrong-number, unsupported-market, consumer, and sensitive-document scenarios. Product or SKU context may be passed into an enquiry, but analytics must remain free of names, email addresses, phone numbers, documents, budgets, and design details.

## CRM mapping

When a CRM is selected, map these fields without changing the meaning of the existing workflow:

| Website field | CRM field |
|---|---|
| `id` | External enquiry ID |
| `createdAt` | Received timestamp |
| `source`, `referrerName`, campaign context | Acquisition source |
| `market` | Target market |
| `requestType` | Product/service interest |
| `yearsTrading`, `tradeReferencesAvailable`, `preferredPaymentApproach` | Qualification context |
| `followUpStatus` | Pipeline stage |
| `ownerName` | Assigned owner |
| `internalNote` | Next action and outcome notes |
| `alertStatus`, acknowledgement status | Delivery health |

Use an idempotency key based on the production-brief ID when sending records to a third-party CRM. Retries must not create duplicate contacts or opportunities.

## Repeat-order review

At the monthly review, identify closed leads whose notes contain a won or repeat outcome. Record the accepted product profile, report or specification reference, expected replenishment timing, and owner. Contact buyers only through an approved channel and only for a relevant business reason; do not add advertising audiences or remarketing pixels without a separate privacy review.

## Monthly review metrics

Review the following by source, market, landing page, and request type:

- Total production briefs.
- New and active briefs.
- Briefs with company context.
- Referral-sourced briefs.
- Shortlists sent.
- Quotations issued.
- Closed opportunities by documented outcome.
- Alert and acknowledgement failures.
- Average age of unowned or unreviewed briefs.
- Repeat-order opportunities identified.

Traffic should not be treated as success unless it produces qualified conversations. If a page produces clicks but no suitable enquiries, review the page promise, audience, qualification language, and CTA before increasing publishing or advertising volume.

## Production checklist

Before activating an external automation:

1. Confirm the provider credentials are stored only as server-side deployment variables.
2. Confirm the provider’s webhook or callback support and signature-verification method.
3. Add retry and idempotency handling.
4. Test human handoff and failure states.
5. Confirm the privacy notice and retention policy.
6. Run a mobile test of the brief, WhatsApp path, and acknowledgement.
7. Confirm who owns each incoming lead during working and non-working hours.
