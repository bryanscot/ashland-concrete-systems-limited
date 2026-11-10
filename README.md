# Ashland Concrete Systems Limited — website

Static website (HTML, CSS, vanilla JavaScript) with a small Node script that generates pages from data files.

## How it fits together
- **Edit data, not pages:** products in `js/products.js`, company details and switches in `js/config.js`, vacancies in `js/jobs.js`.
- `tools/build_pages.mjs` (Node, no packages) generates the category pages, product pages, FAQ, calculator, careers page, `privacy.html`, `sitemap.xml`/`robots.txt` (once a domain is set) and refreshes the marked blocks in `index.html` (WhatsApp links, About proof points, map buttons, structured data).
- `tools/make_catalogue_pdf.py` builds `assets/Ashland-Product-Catalogue.pdf`.
- A GitHub workflow (`.github/workflows/catalogue-pdf.yml`) runs both on every push that changes the data, then commits the results. **Run `git pull` before your next push.**
- **Do not hand-edit generated files**: `products/`, `cabro-pavers/`, `hollow-blocks/`, `kerb-stones/`, `faq/`, `quantity-calculator/`, `careers/`, `privacy.html`, `sitemap.xml`, the PDF. Text between `<!--NAME:START-->` and `<!--NAME:END-->` markers in `index.html` is also regenerated.

## Preview locally
`node tools/build_pages.mjs`, then `python -m http.server 8000` and open http://localhost:8000 (pages use root-style paths, so opening files directly shows no styling).

## Switches in `js/config.js`
| Setting | What it does |
|---|---|
| `siteUrl` | Production domain, e.g. `https://www.yourdomain.co.ke`. Turns on canonical links, social-sharing URLs, `sitemap.xml` and `robots.txt` |
| `geo`, `mapShareUrl`, `mapEmbedUrl` | Verified yard pin: shows "Get directions", GPS line, optional embedded map, adds coordinates to structured data |
| `serviceAreas` | Areas listed in structured data. Remove any you do not serve |
| `about.*` | Proof points on the About section. Empty items are hidden. Fill `standards` and `strength` only with documents to back them |
| `careers.*` | Closing date, interview details, online or WhatsApp-only pre-registration |
| `leadCapture` | `true` only after the server settings below are done. Turns on saving quote enquiries and careers pre-registrations to Zoho CRM |

## Vacancies
`js/jobs.js` holds all 15 posts from the job-descriptions document. `published: true` shows a post on `/careers/`; `false` hides it.

## Lead capture (Zoho CRM)
`api/lead.js` (Vercel) or `functions/api/lead.js` (Cloudflare Pages) call `lib/zoho-lead.js`, which creates a Lead in Zoho CRM. Secrets live only in the host's environment variables:

`ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN` (required) · `ZOHO_ACCOUNTS_URL` (your region, default `https://accounts.zoho.com`) · `SITE_ORIGINS` (allowed website addresses, comma-separated) · `ZOHO_LEAD_SOURCE` (default `Website`; must exist in the Lead Source list) · `ZOHO_CAREER_SOURCE` (default `Careers`) · `ZOHO_FIELD_MAP` (optional JSON for custom fields).

Get the credentials from the Zoho API Console (Self Client, scope `ZohoCRM.modules.leads.CREATE`). Then set `leadCapture: true` and push. If the server is not configured or fails, the forms fall back to WhatsApp, so nothing is lost.

## Before launch checklist
Set `siteUrl`, set the verified yard coordinates, confirm which vacancies to publish, confirm the About proof points, set the Zoho variables and `leadCapture`, then test on real phones.
