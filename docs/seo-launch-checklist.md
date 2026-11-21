# SEO launch checklist

Tick items when done. Status was checked against the repository on 2026-11-12. Re-run the **Monthly maintenance** section every month, resetting the boxes.

## Launch items

### Technical
- [x] Unique title and meta description on every indexable page (19 pages checked, 17 of them indexable, no duplicate titles).
- [x] Exactly one H1 per page (checked on all generated and hand-written pages).
- [x] Every image has an `alt` attribute (checked).
- [x] Business structured data (LocalBusiness: address, phone, areas served) on the home page.
- [ ] Verified yard coordinates added (`geo` in `js/config.js`), so the pin, directions and structured-data location are accurate. Needs: TODO(owner).
- [ ] Production domain set (`siteUrl` in `js/config.js`). Until then: home canonical and social tags point at `vercel.app`, generated pages have no canonical link, `sitemap.xml` holds a placeholder, `robots.txt` has no Sitemap line, and breadcrumb/product structured data is not written. See [domain-migration-checklist.md](domain-migration-checklist.md).
- [ ] Fix the generator's banner references (`ashland-banner.png`/`.jpg` do not exist; the file is `.webp`). See the migration checklist, step A.
- [ ] Social sharing image works in WhatsApp/Facebook previews (currently a WebP, 1896 x 904; use a 1200 x 630 JPG or PNG).
- [ ] Image weights under budget (all images are WebP, but the largest are about 750 KB and up to 3328 px wide; no limit is enforced).
- [ ] Catalogue PDF size reduced (currently about 43 MB; every photo is embedded at full size).
- [ ] Security and caching headers added (`vercel.json` does not exist yet).
- [ ] Core Web Vitals measured on mobile (PageSpeed Insights) and recorded: LCP ____ s, CLS ____, INP ____ ms.
- [ ] Tested on real phones (all current testing used browser emulation).
- [x] Custom 404 page exists (`404.html`).
- [x] Pages not meant for search are marked `noindex` (`catalogue.html`, `404.html`).

### Content and structure
- [x] Separate crawlable pages for each category (`/cabro-pavers/`, `/hollow-blocks/`, `/kerb-stones/`) and each product (`/products/<id>/`).
- [x] FAQ page, quantity calculator page and careers page.
- [x] Internal links: footer, Products dropdown, product cards and related products.
- [ ] Real photographs of finished projects and the factory, with descriptive alt text. Needs: TODO(owner).
- [ ] About proof points backed by documents: KEBS standards and strength figures are empty on purpose (`about.standards`, `about.strength`). Needs: TODO(owner).
- [ ] Consistent address wording everywhere (some pages say Thika, others Murang'a). Needs: TODO(owner).

### Search engines and local
- [ ] Google Search Console property verified, sitemap submitted. Owner: TODO(owner).
- [ ] Bing Webmaster Tools set up, sitemap submitted. Owner: TODO(owner).
- [ ] Google Business Profile claimed and verified, with category, address, phone, website, hours, photos and products. Owner: TODO(owner).
- [ ] Same business name, address and phone on every listing (Google, Facebook, directories).
- [ ] Analytics installed (none is installed today). Owner: TODO(owner).
- [ ] Review request process in place (ask real customers; never buy or write reviews).

## Monthly maintenance (copy and tick each month)

Month: ________  Done by: ________

- [ ] Search Console: look at Pages (new errors, "Not indexed" reasons) and Performance (top queries, clicks, impressions). Note the top 3 queries: ______
- [ ] Search Console: sitemap still reads successfully; submitted vs indexed counts look right.
- [ ] Open the live site on a phone: home, one category, one product, calculator, careers, PDF download.
- [ ] Tap every call and WhatsApp button once; confirm the right number answers.
- [ ] GitHub Actions: last runs are green; Vercel latest deployment is Ready.
- [ ] Check for broken links and images (try the footer links and a few product pages).
- [ ] Run PageSpeed Insights on the home page and one product page; compare with last month.
- [ ] Google Business Profile: respond to reviews and questions; add a new photo or post.
- [ ] Confirm product list, sizes, photos and vacancies are current ([content-guide.md](content-guide.md)).
- [ ] Count enquiries received (WhatsApp, calls) and note which products were asked about.
- [ ] Domain, hosting and email renewals are not due within 60 days.
- [ ] Review the Known limitations in [handover.md](handover.md); fix one.