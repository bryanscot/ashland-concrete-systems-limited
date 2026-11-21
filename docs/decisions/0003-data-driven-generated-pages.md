# 0003. Product data file plus a build script, with generated pages committed

- **Status:** Accepted (recorded 2026-11-12)
- **Where in the code:** `js/products.js`, `js/config.js`, `js/jobs.js`, `tools/build_pages.mjs`, `.github/workflows/catalogue-pdf.yml`

## Context
Search engines rank pages, not pop-ups, so each product and category needed its own address. Products change often, and the owner is not a developer. The team wanted no framework, no package manager and no build tools to learn.

## Decision
Keep products, company details and vacancies in plain JavaScript data files that the browser also reads. A dependency-free Node script (`tools/build_pages.mjs`) generates category, product, FAQ, calculator, careers and privacy pages and refreshes marked blocks in `index.html`. A GitHub Action runs it on data changes and commits the output to the repository, so the host only serves files. The script also writes `sitemap.xml` and `robots.txt` once a domain is set.

## Consequences
- Adding or editing a product is one file edit; every page, the dropdown, the calculator and the PDF follow.
- Generated files live in the repository, so bot commits require `git pull` before pushing and can cause merge conflicts.
- Some content is still written twice (home page header, footer and FAQ in `index.html`, and again in the generator), so those can drift apart.
- Category web addresses are defined in more than one place (`CATS` in the generator and `SLUG` in `js/nav-dropdown.js`).
- A broken data file or image path fails the build, which is intended: nothing half-built is committed.