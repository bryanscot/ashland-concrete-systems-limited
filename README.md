# Ashland Concrete Systems Limited — website

Static site: HTML, CSS, vanilla JavaScript. No build step, no backend.

## Preview locally
`python3 -m http.server 8000` in this folder, then open http://localhost:8000
(or just open `index.html`; everything uses relative paths).

## Deploy
Upload the whole folder to any static host (Netlify, Vercel, GitHub Pages, cPanel `public_html`).
`404.html` uses root-relative paths, so it expects the site at the domain root.

## Edit things
- Phone, WhatsApp number, address, map search: `js/config.js` (WhatsApp number is digits only, international format, no "+"). Phone/address are also written in plain text in `index.html`, `privacy.html` and the JSON-LD block in `index.html` — search for `0769` and `254769872363` when changing them.
- Products (names, dimensions, descriptions, images, categories): `js/products.js`. WhatsApp messages read from this data automatically.
- Replace a product photo: overwrite the file in `assets/images/` with the same name, or change the path in `products.js`.
- Colours: CSS variables at the top of `css/style.css`.

## How enquiries work
Nothing is emailed or stored. The form and all "Enquire" buttons open WhatsApp with a ready message; the customer must press Send. To add a real backend later, handle the `submit` event in `js/main.js` (never put secret keys in browser code).

## Dependencies
Google Fonts (Barlow, Barlow Condensed) with system fallbacks. WhatsApp and Google Maps links open only on click.

## Before launch
- Replace `YOUR-DOMAIN` in `sitemap.xml`, add the Sitemap line in `robots.txt`, add a canonical link in `index.html`, and make the `og:image` URL absolute.
- Product images are cropped from your flyers (several appear to be illustrative renders). The three HB blocks share the same block photo, as on the flyers.
- Road Kerb: the flyer says 800 × 140 × 250 mm; your brief said "Road Cap 400 × 230 × 200". The site uses the flyer. Change it in `products.js` if the brief was right.
