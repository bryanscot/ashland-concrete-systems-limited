# Changelog

All notable changes to this project are recorded here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). The project has not had a numbered release yet.

## [Unreleased] — production-readiness work (November 2026)

### Added
- Documentation: `README.md`, `docs/content-guide.md`, `docs/runbook.md`, `docs/domain-migration-checklist.md`, `docs/seo-launch-checklist.md`, `docs/handover.md` and architecture decision records in `docs/decisions/`.
- Careers page (`/careers/`) built from `js/jobs.js` (each post can be published or hidden), with a pre-registration form that uses WhatsApp, or the server when lead capture is on.
- Optional lead capture to Zoho CRM: `api/lead.js`, `lib/zoho-lead.js`, and a Cloudflare Pages copy in `functions/api/lead.js`. Switched off by default (`leadCapture` in `js/config.js`).
- About-section block "Quality, compliance and capability", driven by `about` in `js/config.js`; empty items are not shown.
- Support for a verified yard pin (`geo`, `mapShareUrl`, `mapEmbedUrl`): directions button, GPS line, optional embedded map and location in structured data.
- Production-domain setting `siteUrl`: canonical links, social-sharing URLs, `sitemap.xml` and `robots.txt` are written from it.
- Quantity calculator page, category pages, product pages and FAQ page generated from `js/products.js`.
- Richer LocalBusiness structured data (address, PO box, postal code, areas served).

### Changed
- `privacy.html` is now generated and its wording follows the `leadCapture` setting.
- WhatsApp links on the home page are given real addresses at build time instead of `#` placeholders; the build also refreshes marked blocks in `index.html`.
- FAQ answers about stored details now point to the privacy notice.
- The workflow also runs when `js/jobs.js` changes.

### Fixed
- Placeholder `href="#"` WhatsApp links on the home page.

### Known issues
See "Known limitations" in `docs/handover.md` (for example the 43 MB catalogue PDF, the missing production domain, and generator references to `ashland-banner.png` / `.jpg` while the file is `ashland-banner.webp`).

## [0.1.0] — pre-production baseline (2026-10-17 to 2026-11-11)

### Added
- Home page with hero slideshow, filterable and searchable product catalogue (9 products with exact dimensions), product details dialog, quote list, quote form that prepares a WhatsApp message, floating WhatsApp button, gallery, FAQ and contact section.
- Mobile menu, Products dropdown, custom product dropdown, animations.
- Downloadable PDF catalogue built automatically by a GitHub Action.
- Page generator `tools/build_pages.mjs` and the GitHub workflow that runs it.