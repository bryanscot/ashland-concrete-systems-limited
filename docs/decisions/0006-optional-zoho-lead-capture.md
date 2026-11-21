# 0006. Optional lead capture to Zoho CRM through a serverless function

- **Status:** Implemented, switched **off** (`leadCapture: false` in `js/config.js`); recorded 2026-11-12
- **Where in the code:** `lib/zoho-lead.js`, `api/lead.js`, `functions/api/lead.js`, `sendLead` in `js/main.js`, `js/careers.js`

## Context
WhatsApp-only enquiries (decision 0001) lose any enquiry the customer does not send, and the careers pre-registration needs somewhere to land. The browser must never hold Zoho secrets.

## Decision
A small serverless endpoint, `POST /api/lead`, creates a Lead in Zoho CRM using an OAuth refresh token stored as host environment variables. Quote enquiries are sent in the background after WhatsApp opens; careers pre-registration waits for the answer and falls back to a prepared WhatsApp message if it fails. Spam protection: a hidden honeypot field, input length limits, and an allowed-origins list (`SITE_ORIGINS`). The feature is behind a switch so the site's privacy wording matches reality.

## Consequences
- Until credentials are configured and `leadCapture` is true, nothing is sent and the privacy notice says so.
- When on, the site stores personal data in the CRM; the privacy page changes automatically and the company has data-protection responsibilities for that data.
- Zoho field names and picklist values (Lead Source) must exist in the CRM or Zoho rejects the lead.
- Leads and job pre-registrations share the Leads module (different Lead Source). A recruitment tool would be cleaner later.
- If Zoho is down, customers are not blocked: WhatsApp still works.