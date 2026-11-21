# Ashland Concrete Systems Limited — website

Marketing and quotation website for Ashland Concrete Systems Limited (cabro pavers, hollow blocks and kerb stones), Murang'a Industrial Park, Makenji, Kenya. Visitors browse the catalogue and request a quotation on WhatsApp.

- **Live (preview) address:** https://ashland-concrete-systems-limited.vercel.app
- **Production domain:** not set yet. TODO(owner). See [docs/domain-migration-checklist.md](docs/domain-migration-checklist.md).

## Stack

| Part | Technology | Where |
|---|---|---|
| Pages | Hand-written HTML plus pages generated from data | `index.html`, `catalogue.html`, `404.html`, generated folders |
| Styling | Plain CSS | `css/style.css`, `css/pages.css` |
| Behaviour | Vanilla JavaScript, no framework, no bundler | `js/` |
| Page generator | Node script, no npm packages | `tools/build_pages.mjs` |
| PDF catalogue | Python + Playwright (headless Chromium) | `tools/make_catalogue_pdf.py` |
| Automation | GitHub Actions | `.github/workflows/catalogue-pdf.yml` |
| Hosting | Vercel (static files; optional serverless function `api/lead.js`) | Vercel dashboard |
| Quotes | WhatsApp links (`wa.me`) with a pre-written message | `js/whatsapp.js` |
| Lead capture (optional, **off by default**) | Zoho CRM through `api/lead.js` | `lib/zoho-lead.js`, `leadCapture` in `js/config.js` |
| Fonts | Google Fonts (Barlow, Barlow Condensed) | `<head>` of every page |

## Run locally

Verified on Node 22 and Python 3 (the GitHub workflow uses Node 20). On Windows the Python command may be `python` or `py`.

```
node tools/build_pages.mjs        # regenerate pages from the data files
python3 -m http.server 8000       # then open http://localhost:8000
```

Do not open the HTML files by double-clicking them: the pages use addresses that start at the site root (`/css/...`), so they only look right when served.

The build prints `TODO:` lines for things still missing (domain, map coordinates, empty About items). They are reminders, not errors.

Optional, to rebuild the PDF catalogue locally:

```
pip install playwright
playwright install chromium
python3 tools/make_catalogue_pdf.py   # writes assets/Ashland-Product-Catalogue.pdf
```

There are no automated tests.

## Deploy

1. Push to `main`.
2. If you changed product, company, vacancy or image files, the GitHub workflow **Build catalogue PDF and pages** runs, regenerates the pages and PDF, and commits them back as `github-actions[bot]`.
3. Vercel publishes the `main` branch. TODO(owner): confirm the Git integration under Vercel > Project > Settings > Git.
4. Before your next push, run `git pull` to receive the bot's commit.

More detail: [docs/runbook.md](docs/runbook.md).

## Folder structure

```
index.html            Home page (hand-written; some blocks are refreshed by the build)
catalogue.html        Print-style catalogue page; the PDF is made from it
404.html              Not-found page
css/                  style.css (base), pages.css (sub-pages, dropdown, slideshow, careers)
js/
  config.js           Company details and site switches
  products.js         Product catalogue and categories  <- main data file
  jobs.js             Vacancies (published true/false)
  whatsapp.js         WhatsApp link/message and map-link helpers
  main.js             Home page: catalogue, filters, dialogs, quote list, quote form
  product-select.js   Custom product dropdown in the quote form
  menu-enhance.js     Home menu extras (outside tap, section highlight, back button)
  nav-dropdown.js     Products dropdown in the header
  animate.js          Entrance and hover animations
  hero-slider.js      Home hero slideshow
  page.js             Menu and links on generated pages
  calculator.js       Quantity calculator page
  careers.js          Careers pre-registration form
tools/
  build_pages.mjs     Generates pages, sitemap/robots (once a domain is set), refreshes marked blocks in index.html
  make_catalogue_pdf.py
api/lead.js           Vercel function: POST /api/lead
functions/api/lead.js Cloudflare Pages version of the same function (unused on Vercel)
lib/zoho-lead.js      Shared lead handler (creates a Lead in Zoho CRM)
assets/images/        Product, in-use, banner and gallery images
assets/logo/          Logo and favicons
assets/Ashland-Product-Catalogue.pdf   Generated
.github/workflows/    catalogue-pdf.yml
docs/                 Guides, runbook, checklists, decisions
GENERATED (do not edit by hand): cabro-pavers/ hollow-blocks/ kerb-stones/ products/ faq/
  quantity-calculator/ careers/ privacy.html sitemap.xml robots.txt
```

## Where the data lives

| What | File |
|---|---|
| Products, sizes, photos, categories | `js/products.js` |
| Phone, WhatsApp number, address, domain, map pin, switches | `js/config.js` |
| Vacancies | `js/jobs.js` |
| FAQ on the home page | `index.html` (section `#faq`) |
| FAQ on `/faq/` | `FAQ` list in `tools/build_pages.mjs` |

Step-by-step instructions for non-technical editors: [docs/content-guide.md](docs/content-guide.md).

## Documentation 

- [docs/content-guide.md](docs/content-guide.md): editing products, contact details, images, FAQ and publishing
- [docs/runbook.md](docs/runbook.md): hosting, deployment, rollback, domain, accounts
- [docs/domain-migration-checklist.md](docs/domain-migration-checklist.md): move to a .co.ke domain
- [docs/seo-launch-checklist.md](docs/seo-launch-checklist.md): launch and monthly SEO checklist
- [docs/decisions/](docs/decisions/): architecture decision records
- [docs/handover.md](docs/handover.md): owner summary
- [CHANGELOG.md](CHANGELOG.md)

## Contact

Ashland Concrete Systems Limited, Murang'a Industrial Park, Makenji, Kenya. Tel 0769 872 363.
Site maintainer: Brian (IT Management).