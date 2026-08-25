# Approved-buyer workflow integration notes

## Resend API reference

The welcome-kit and private-list alert workflows use the Resend REST API. The API key was validated successfully against the official `GET https://api.resend.com/domains` endpoint. Welcome messages and alert messages are sent through `POST https://api.resend.com/emails` with a `from` sender, `to` recipient list, subject, HTML and text bodies, optional Base64 attachments, and workflow tags.

Official references:

- [Resend — List Domains](https://resend.com/docs/api-reference/domains/list-domains)
- [Resend — Send Email](https://resend.com/docs/api-reference/emails/send-email)

The sender is read only from `ALVORA_EMAIL_FROM`; it currently uses `Alvora Diamonds <onboarding@resend.dev>` and can be changed to the verified Alvora address without source changes.

## Current availability source

The initial private-list import uses the project-supplied `Alvora_Nivoda_Upload_100SKU.csv`, which contains 100 available stones across eight shapes. Its populated filters support buyer bands for shape, weight, colour, clarity, cut/polish and location. The imported source does **not** currently contain `Report #` (IGI certificate) or `Final Price` values; the application deliberately renders them as `Not listed` and `On request` and marks generated PDFs with a data note until a complete source is provided.
