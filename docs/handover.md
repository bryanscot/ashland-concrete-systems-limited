# Handover summary (for the owner)

*Status date: 2026-11-12. Live preview: https://ashland-concrete-systems-limited.vercel.app*

## What was delivered
- A mobile-friendly website for Ashland Concrete Systems Limited: home page with slideshow, 9 products with exact sizes, filters and search, a Products menu, quantity calculator, FAQ, careers page with pre-registration, About, contact and a downloadable PDF catalogue.
- Customers request quotations on WhatsApp with the product name and size already written for them.
- Pages for each product group and each product (for Google), a privacy notice, and a custom "not found" page.
- Editing is simple: products, phone and address live in a few settings files; the product pages and PDF rebuild themselves ([content-guide.md](content-guide.md)).
- Optional: saving enquiries into Zoho CRM is built but switched off.
- Documentation: [runbook](runbook.md), [domain migration checklist](domain-migration-checklist.md), [SEO checklist](seo-launch-checklist.md), [decision records](decisions/).

## What is still needed from you (TODO(owner))
1. **Domain:** choose and register the .co.ke domain in the company's name; name who owns the registration and renewals.
2. **Hosting:** decide the plan. The free Vercel plan is limited to non-commercial use.
3. **Ownership of accounts:** move the GitHub repository to a company account; name owners for Vercel, the registrar, Search Console, Bing Webmaster Tools, Google Business Profile and analytics ([runbook](runbook.md), section 8), with two administrators each.
4. **Business email** on the new domain, and the social media links, opening hours and delivery policy to show.
5. **Yard location:** the verified Google Maps pin (coordinates) for the factory gate.
6. **Address wording:** decide whether pages say Thika or Murang'a; today they differ.
7. **Photographs:** real photos of products, finished projects and the factory.
8. **About-page facts:** KEBS standards and product strength figures, only with documents to support them; approve the eTIMS wording and the areas served.
9. **Vacancies:** confirm which posts are published, the closing date and interview details.
10. **Zoho:** decide whether to switch on lead capture and provide the Zoho credentials to whoever sets up the host.

## Recommended next steps
1. Register the domain and follow the [migration checklist](domain-migration-checklist.md).
2. Claim and verify the **Google Business Profile**; add photos, products and hours.
3. Ask real customers for **Google reviews** after each completed job.
4. Install **analytics** to count visits, WhatsApp taps and calculator use.
5. Do the **monthly checks** in the [SEO checklist](seo-launch-checklist.md) and keep the notes.
6. Replace oversized photos with 1200 px versions to shrink the PDF and speed up pages.

## Known limitations
- The catalogue PDF is about 43 MB and the repository's history is about 131 MB because every rebuild stores a new full-size copy; photos need resizing.
- No custom domain yet: canonical links, sitemap and robots are placeholders; the page generator also points to a banner image file name that does not exist (`ashland-banner.png`/`.jpg`; the file is `.webp`). Fix both when the domain is set.
- The map is a text search, not a surveyed pin.
- WhatsApp-only enquiries that are not sent are lost, and there is no analytics yet.
- The home page product cards are drawn by JavaScript; the generated product and category pages carry the search weight.
- Some text is written twice (home page and generator: header, footer, FAQ), and contact details are typed directly into `index.html`, `404.html` and `catalogue.html` as well as `js/config.js`.
- There are no automated tests, and testing so far used browser emulation, not real phones.
- No security or caching headers are configured; fonts come from Google Fonts.
- Social-sharing image is a WebP, which not every app previews.