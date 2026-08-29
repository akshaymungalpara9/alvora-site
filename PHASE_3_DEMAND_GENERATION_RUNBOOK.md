# Alvora Phase 3 — Demand Generation Runbook

## Purpose

Phase 3 turns the public site into a measurable B2B acquisition system. The operating metric is not raw traffic; it is the progression from **qualified enquiry → quote → sample → first purchase order → repeat purchase order**.

## Content publishing queue

The `/insights` route now contains five buyer-intent notes. Publish one useful note every 10–14 days, then add a relevant internal link from the manufacturer, custom, matched-parcel, and availability experiences. Each note should end in a production-brief or current-availability action.

| Content asset                    | Search / buyer intent               | Proof required before expanding                                        |
| -------------------------------- | ----------------------------------- | ---------------------------------------------------------------------- |
| Choosing a manufacturer in India | Supplier due diligence              | Current certification, QA, commercial terms, and named contact details |
| OEM vs ODM vs private label      | Manufacturing route selection       | Actual service boundaries and permitted customization                  |
| CAD to certified sample          | Custom-production process           | Real process stages, approval checkpoints, and accepted examples       |
| MOQ, sampling, and lead time     | Procurement qualification           | Current MOQ and capacity by project type                               |
| Export sourcing checklist        | Import and documentation confidence | Freight/customs review for each destination market                     |

Do not publish a customer case study until Alvora has permission to use the customer’s details or has approved an anonymized version. A credible case study should show the brief, category, timeline, QC checkpoints, deliverable, and reorder outcome without exposing confidential design information.

## Trade-citation outreach

Prioritize relevant, verifiable references over volume. The target is **15–25 relevant referring domains over time**, not generic directory links. Start with industry association and exhibition profiles, then add supplier or partner references that describe an actual relationship.

Every outreach request should point to the most relevant landing page, not always the homepage. Examples include a manufacturer page for an association profile, a custom-manufacturing page for a CAD partner story, and the export page for a logistics or customs resource.

Do not buy generic backlinks, publish mass AI guest posts, or create thin pages only to host keywords. Keep a simple outreach log with the organization, contact, requested URL, relationship, date, status, and live citation URL.

## Campaign naming and attribution

Use lowercase UTM values with stable names:

```text
?utm_source=linkedin&utm_medium=organic&utm_campaign=trade_outreach_2026&utm_content=manufacturer_page
?utm_source=trade_directory&utm_medium=referral&utm_campaign=directory_profile&utm_content=custom_manufacturing
?utm_source=email&utm_medium=outbound&utm_campaign=sample_programme_2026&utm_content=retailer_segment
```

The site stores only non-PII attribution in the browser session and sends source, medium, campaign, landing page, and referrer as privacy-safe analytics properties. Do not place a buyer’s name, email, company, CAD, budget, or design details in analytics event properties.

## Event funnel

The current public funnel uses these event names:

| Event                             | Meaning                                                                                    |
| --------------------------------- | ------------------------------------------------------------------------------------------ |
| `production_brief_open`           | A visitor opens a production brief from a CTA                                              |
| `production_brief_submit`         | A visitor submits the brief form; only request type and company-presence flag are included |
| `insights_production_brief_click` | A visitor clicks from the Insights index toward the brief                                  |
| `insight_rfq_click`               | A visitor clicks from an individual insight toward the brief                               |
| `insight_article_open`            | A visitor opens an insight article                                                         |
| `insight_case_study_interest`     | A visitor chooses the future case-study / production discussion path                       |
| `whatsapp_click`                  | A visitor opens the configured WhatsApp contact route                                      |

Review events monthly by source, landing page, and campaign. Join the analytics view to the internal production-brief workflow using the enquiry date and source context; do not attempt to identify visitors through analytics.

## Monthly review

At the end of each month, record the number of enquiries by source and landing page, then classify each enquiry as qualified, quoted, sampled, won, lost, or on hold. Record disqualification reasons consistently, especially MOQ mismatch, consumer enquiry, market not served, incomplete brief, and price-only enquiry.

Expand content or outreach only when it produces qualified conversations. If a page attracts clicks but no suitable enquiries, review the promise, qualification language, category fit, and CTA before producing more pages.

## Operator checklist before publishing claims

- Verify MOQ, sampling cost, timing, and production lead time.
- Verify the certification or report language and its source.
- Verify the countries and export documentation actually supported.
- Verify the named owner of enquiries and the response-time promise.
- Obtain permission for customer names, images, results, and case-study details.
- Confirm every campaign URL uses the agreed UTM convention.
- Confirm the production brief and WhatsApp routes work on mobile.
