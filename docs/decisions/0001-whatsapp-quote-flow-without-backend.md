# 0001. Quotations through WhatsApp links, with no backend

- **Status:** Accepted (recorded 2026-11-12; in place since the first version of the site)
- **Where in the code:** `js/whatsapp.js`, quote form in `js/main.js`, product buttons in `js/main.js` and `tools/build_pages.mjs`

## Context
Ashland sells by quotation and does not publish prices. Customers already use WhatsApp, and the company has no server, database or email service for the website.

## Decision
Every enquiry button and the quote form open `https://wa.me/<number>?text=<message>`. The message is written from product data (name and size) and form entries, URL-encoded. The visitor must press Send in WhatsApp. The site never claims a message was delivered. If the window cannot open, the form shows the message to copy and the phone number to call.

## Consequences
- No server to run, secure or pay for; works on any phone with WhatsApp.
- An enquiry the customer does not send leaves no trace, so abandoned enquiries are lost and the site cannot count enquiries.
- Message wording is built in more than one place (`js/whatsapp.js`, `js/calculator.js`, `tools/build_pages.mjs`); a wording change must be made in each.
- Optional mitigation: [0006](0006-optional-zoho-lead-capture.md).