// Generates crawlable pages from js/products.js: category pages, one page per product, FAQ, calculator, sitemap.
// Run:  node tools/build_pages.mjs     (also runs automatically in the GitHub workflow)
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// Set your live domain here (no trailing slash) once you own it, e.g. "https://www.ashlandconcrete.co.ke"
let SITE_URL = "https://YOUR-DOMAIN"; // set in js/config.js (siteUrl) or with the SITE_URL environment variable
let hasDomain = false;

/* ---------- load site data ---------- */
const ctx = vm.createContext({ window: {} });
for (const f of ["js/config.js", "js/products.js", "js/whatsapp.js", "js/jobs.js"])
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), "utf8"), ctx);
const C = ctx.window.ASHLAND_CONFIG,
  P = ctx.window.ASHLAND_PRODUCTS,
  CATLIST = ctx.window.ASHLAND_CATEGORIES;
const WAJS = ctx.window.AshlandWA,
  JOBS = ctx.window.ASHLAND_JOBS || [];
SITE_URL = (process.env.SITE_URL || C.siteUrl || SITE_URL).replace(/\/+$/, "");
hasDomain = !SITE_URL.includes("YOUR-DOMAIN");

const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const dimsText = (p) => `${p.dims.l} × ${p.dims.w} × ${p.dims.h} mm`;
const wa = (msg) =>
  `https://wa.me/${C.whatsappNumber}?text=${encodeURIComponent(msg)}`;
const greet = `Hello ${C.companyName}, `;
const waProduct = (p) =>
  wa(
    `${greet}I am interested in ${p.name} (${dimsText(p)}). Kindly provide your current price, availability, and quotation details.`,
  );
const waGeneral = wa(
  `${greet}I would like to enquire about your concrete products and request a quotation.`,
);
const waCategory = (label) =>
  wa(
    `${greet}I would like to enquire about your ${label.toLowerCase()} and request a quotation.`,
  );
const asset = (p) => "/" + String(p).replace(/^\//, "");
const abs = (p) => SITE_URL + p;
const trunc = (s, n = 158) =>
  s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, "") + "…";

/* ---------- category copy (edit freely) ---------- */
const CATS = {
  paving: {
    slug: "cabro-pavers",
    nav: "Cabro & paving",
    short: "Cabro pavers",
    title:
      "Cabro Pavers & Paving Blocks in Thika, Kenya | Ashland Concrete Systems",
    h1: "Cabro pavers and paving blocks in Thika, Kenya",
    intro: [
      `${C.companyName} supplies concrete cabro and paving blocks from ${C.locationLine}. Every product below is listed with its exact length, width and height in millimetres, so you can compare options before you ask for a quotation.`,
      "The range includes rectangular Cabro blocks, wave-profile Uni blocks and angular Pavers in different thicknesses.",
      "Paving blocks are commonly used for driveways, parking areas and walkways. Which product suits your project depends on the loads and the laying method, so please confirm with us before ordering.",
    ],
  },
  blocks: {
    slug: "hollow-blocks",
    nav: "Hollow blocks",
    short: "Hollow blocks",
    title: "Concrete Hollow Blocks in Thika, Kenya | Ashland Concrete Systems",
    h1: "Concrete hollow blocks in Thika, Kenya",
    intro: [
      `${C.companyName} supplies three-cell hollow concrete blocks from ${C.locationLine}. Each block is listed with its exact length, width and height in millimetres.`,
      "Hollow blocks are used in building construction. The right width depends on your design and your builder's or engineer's specification, so please confirm with us when you enquire.",
    ],
  },
  kerbs: {
    slug: "kerb-stones",
    nav: "Kerbs",
    short: "Kerb stones",
    title: "Concrete Kerb Stones in Thika, Kenya | Ashland Concrete Systems",
    h1: "Concrete kerb stones in Thika, Kenya",
    intro: [
      `${C.companyName} supplies concrete kerb units for road and landscape edging from ${C.locationLine}. Each kerb is listed with its exact length, width and height in millimetres.`,
      "Kerbs are used to edge roads, driveways and paved areas. Please confirm the right kerb for your project with us before ordering.",
    ],
  },
};
function catInfo(id) {
  if (CATS[id]) return CATS[id];
  const label = (CATLIST.find((c) => c.id === id) || {}).label || id;
  return {
    slug: id,
    nav: label,
    short: label,
    title: `${label} in Thika, Kenya | Ashland Concrete Systems`,
    h1: `${label} in Thika, Kenya`,
    intro: [
      `${C.companyName} supplies ${label.toLowerCase()} from ${C.locationLine}. Each product is listed with its exact dimensions in millimetres.`,
      "Please confirm with us that a product suits your project before ordering.",
    ],
  };
}
const catIds = CATLIST.map((c) => c.id).filter(
  (id) => id !== "all" && P.some((p) => p.category === id),
);
const catUrl = (id) => `/${catInfo(id).slug}/`;
const prodUrl = (p) => `/products/${p.id}/`;

/* ---------- shared layout ---------- */
const NAV = [
  ["Home", "/"],
  ["About Us", "/#about"],
  ["Products", "/#products"],
  ["Calculator", "/quantity-calculator/"],
  ["FAQ", "/faq/"],
  ["Contact", "/#contact"],
];

function layout({ url, title, desc, body, jsonld = [], image, scripts = [] }) {
  const ld = jsonld
    .map(
      (o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`,
    )
    .join("\n");
  const navLinks = NAV.map(
    ([l, h]) =>
      `<li><a href="${h}"${h === url ? ' aria-current="page"' : ""}>${esc(l)}</a></li>`,
  ).join("");
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#142854">
${hasDomain ? `<link rel="canonical" href="${abs(url)}">` : "<!-- add SITE_URL in tools/build_pages.mjs to output canonical links -->"}
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
${hasDomain ? `<meta property="og:url" content="${abs(url)}">\n<meta property="og:image" content="${abs(asset(image || "assets/images/ashland-banner.png"))}">` : ""}
<link rel="icon" type="image/png" sizes="48x48" href="/assets/logo/favicon-48.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Barlow:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/style.css">
<link rel="stylesheet" href="/css/pages.css">
${ld}
</head>
<body id="top">
<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="/" aria-label="${esc(C.companyName)} — home"><img src="/assets/logo/ashland-logo.webp" alt="Ashland Concrete Systems Ltd logo" width="900" height="604"></a>
    <nav class="nav" id="site-nav" aria-label="Main">
      <ul>${navLinks}</ul>
      <div class="nav-extras">
        <a class="btn btn-primary btn-block" href="/#quote">Request a Quote</a>
        <div class="nav-row"><a class="btn btn-wa" data-wa-general href="${waGeneral}" target="_blank" rel="noopener">WhatsApp</a><a class="btn btn-light" href="tel:${C.phoneTel}">Call us</a></div>
        <p class="nav-meta">${esc(C.locationLine)}<br>${esc(C.phoneDisplay)}</p>
      </div>
    </nav>
    <div class="header-actions">
      <a class="btn btn-primary header-cta" href="/#quote">Request a Quote</a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Open menu"><span></span><span></span><span></span></button>
    </div>
  </div>
</header>
<main id="main">
${body}
</main>
<footer class="site-footer">
  <div class="wrap footer-grid">
    <div><a class="footer-logo" href="/" aria-label="Home"><img src="/assets/logo/ashland-logo.webp" alt="Ashland Concrete Systems Ltd" width="900" height="604" loading="lazy"></a>
      <p>Concrete paving, hollow blocks and kerbs from Thika, Kenya.</p></div>
    <div><h2>Products</h2><ul>${catIds.map((id) => `<li><a href="${catUrl(id)}">${esc(catInfo(id).nav)}</a></li>`).join("")}<li><a href="/quantity-calculator/">Quantity calculator</a></li><li><a href="/faq/">FAQ</a></li></ul></div>
    <div><h2>Company</h2><ul><li><a href="/#about">About Us</a></li><li><a href="/#contact">Contact</a></li><li><a href="/careers/">Careers</a></li><li><a href="/privacy.html">Privacy notice</a></li><li><a href="/assets/Ashland-Product-Catalogue.pdf" download="Ashland-Product-Catalogue.pdf">Product catalogue (PDF)</a></li></ul></div>
    <div><h2>Reach us</h2><p>${esc(C.locationLine)}<br>${esc(C.postalLine)}</p>
      <p><a href="tel:${C.phoneTel}">${esc(C.phoneDisplay)}</a><br><a data-wa-general href="${waGeneral}" target="_blank" rel="noopener">WhatsApp</a></p></div>
  </div>
  <div class="wrap footer-base"><p>© <span id="year"></span> ${esc(C.companyName)}. All rights reserved.</p></div>
</footer>
<a class="wa-float" data-wa-general href="${waGeneral}" target="_blank" rel="noopener" aria-label="Chat with Ashland on WhatsApp"><svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true" focusable="false"><path fill="currentColor" d="M16.04 3C9.4 3 4 8.4 4 15.03c0 2.12.55 4.18 1.6 6L4 28l7.15-1.87a12 12 0 0 0 4.88 1.03h.01C22.68 27.16 28 21.76 28 15.13 28 11.92 26.76 8.9 24.5 6.63A11.9 11.9 0 0 0 16.04 3Zm0 21.98h-.01a9.96 9.96 0 0 1-5.08-1.39l-.36-.22-3.8.99 1.02-3.7-.24-.38a9.96 9.96 0 0 1-1.53-5.3c0-5.5 4.5-9.97 10.03-9.97 2.68 0 5.19 1.04 7.08 2.93a9.9 9.9 0 0 1 2.93 7.05c0 5.5-4.5 9.99-10.04 9.99Zm5.5-7.48c-.3-.15-1.78-.88-2.06-.98-.27-.1-.47-.15-.67.15-.2.3-.77.98-.95 1.18-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.78-1.67-2.08-.18-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.47 1.07 2.9 1.22 3.1.15.2 2.1 3.2 5.08 4.48.71.3 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.08 1.78-.73 2.03-1.43.25-.7.25-1.3.17-1.43-.07-.13-.27-.2-.57-.35Z"/></svg></a>
<script src="/js/config.js"></script>
<script src="/js/products.js"></script>
<script src="/js/whatsapp.js"></script>
<script src="/js/page.js"></script>
<script src="/js/nav-dropdown.js"></script>
${scripts.map((s) => `<script src="${s}"></script>`).join("\n")}
</body>
</html>
`;
}

const crumbs = (items) =>
  `<nav class="crumbs" aria-label="Breadcrumb">${items.map(([l, h]) => (h ? `<a href="${h}">${esc(l)}</a>` : `<span aria-current="page">${esc(l)}</span>`)).join(' <span aria-hidden="true">/</span> ')}</nav>`;
const crumbLd = (items) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map(([l, h], i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: l,
    ...(h ? { item: abs(h) } : {}),
  })),
});

function card(p, i = 0) {
  const d = p.dims;
  return `<article class="card">
<a class="card-media" href="${prodUrl(p)}" aria-label="View ${esc(p.name)}"><img src="${asset(p.image)}" alt="${esc(p.alt || p.name)}" ${i > 1 ? 'loading="lazy"' : ""} width="600" height="450"></a>
<div class="dims" role="group" aria-label="Dimensions in millimetres"><span><b>${d.l}</b>Length</span><span><b>${d.w}</b>Width</span><span><b>${d.h}</b>Height <i>mm</i></span></div>
<div class="card-body"><h3><a class="card-link" href="${prodUrl(p)}">${esc(p.name)}</a></h3><p>${esc(p.description)}</p>
<div class="card-actions"><a class="btn btn-wa" target="_blank" rel="noopener" href="${waProduct(p)}">Enquire on WhatsApp</a><a class="btn btn-ghost-dark" href="${prodUrl(p)}">View details</a></div></div></article>`;
}

/* ---------- output helpers ---------- */
const written = [];
function write(url, html) {
  const file = path.join(ROOT, url, "index.html");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  written.push(url);
}
function check(rel) {
  if (rel && !fs.existsSync(path.join(ROOT, rel)))
    console.warn(`WARNING: image not found: ${rel}`);
}
fs.rmSync(path.join(ROOT, "products"), { recursive: true, force: true });
for (const id of Object.values(CATS).map((c) => c.slug))
  fs.rmSync(path.join(ROOT, id), { recursive: true, force: true });

/* ---------- category pages ---------- */
for (const id of catIds) {
  const info = catInfo(id),
    list = P.filter((p) => p.category === id),
    url = catUrl(id);
  const desc = trunc(
    `${info.short} from ${C.companyName}, Thika, Kenya. ${list.length} product${list.length > 1 ? "s" : ""} with exact sizes in mm. Request a quotation on WhatsApp.`,
  );
  const bc = [
    ["Home", "/"],
    [info.nav, null],
  ];
  const others = catIds.filter((o) => o !== id);
  write(
    url,
    layout({
      url,
      title: info.title,
      desc,
      image: list[0].image,
      jsonld: hasDomain
        ? [
            crumbLd(bc),
            {
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              name: info.h1,
              description: desc,
              url: abs(url),
            },
          ]
        : [],
      body: `<section class="page-hero"><div class="wrap">${crumbs(bc)}<h1>${esc(info.h1)}</h1><p class="lead">${esc(info.intro[0])}</p>
<div class="hero-actions"><a class="btn btn-wa" target="_blank" rel="noopener" href="${waCategory(info.short)}">Enquire on WhatsApp</a><a class="btn btn-ghost-dark" href="/quantity-calculator/">Quantity calculator</a></div></div></section>
<section class="section"><div class="wrap"><h2>${list.length} ${esc(info.short.toLowerCase())} product${list.length > 1 ? "s" : ""}</h2><div class="grid">${list.map(card).join("\n")}</div></div></section>
<section class="section section-alt"><div class="wrap prose"><h2>About these products</h2>${info.intro
        .slice(1)
        .map((t) => `<p>${esc(t)}</p>`)
        .join("")}
<p>Prices are by quotation. Tap <strong>Enquire on WhatsApp</strong> on any product, or call <a href="tel:${C.phoneTel}">${esc(C.phoneDisplay)}</a>, and tell us the product, quantity and your project location.</p>
<p>Not sure how many you need? Try the <a href="/quantity-calculator/">quantity calculator</a>, or read the <a href="/faq/">frequently asked questions</a>.</p></div></section>
<section class="section"><div class="wrap"><h2>More from Ashland</h2><ul class="linklist">${others.map((o) => `<li><a href="${catUrl(o)}">${esc(catInfo(o).nav)}</a></li>`).join("")}</ul></div></section>`,
    }),
  );
}

/* ---------- product pages ---------- */
for (const p of P) {
  check(p.image);
  check(p.inUseImage);
  const info = catInfo(p.category),
    url = prodUrl(p),
    d = p.dims;
  const bc = [
    ["Home", "/"],
    [info.nav, catUrl(p.category)],
    [p.name, null],
  ];
  const title = `${p.name} – ${dimsText(p)} | ${info.short} in Thika`;
  const desc = trunc(
    `${p.name}, ${dimsText(p)}. ${p.description} Thika, Kenya – request a quotation on WhatsApp.`,
  );
  const related = P.filter(
    (o) => o.category === p.category && o.id !== p.id,
  ).slice(0, 4);
  write(
    url,
    layout({
      url,
      title,
      desc,
      image: p.image,
      jsonld: hasDomain
        ? [
            crumbLd(bc),
            {
              "@context": "https://schema.org",
              "@type": "Product",
              name: p.name,
              description: p.description,
              image: [abs(asset(p.image)), abs(asset(p.inUseImage))],
              category: info.nav,
              brand: { "@type": "Brand", name: "Ashland" },
              depth: {
                "@type": "QuantitativeValue",
                value: d.l,
                unitCode: "MMT",
              },
              width: {
                "@type": "QuantitativeValue",
                value: d.w,
                unitCode: "MMT",
              },
              height: {
                "@type": "QuantitativeValue",
                value: d.h,
                unitCode: "MMT",
              },
            },
          ]
        : [],
      body: `<section class="page-hero compact"><div class="wrap">${crumbs(bc)}</div></section>
<section class="section product-page"><div class="wrap pp-grid">
<div class="pp-gallery"><img class="pp-main" src="${asset(p.image)}" alt="${esc(p.alt || p.name)}" width="800" height="600">
<figure><img src="${asset(p.inUseImage)}" alt="Illustrative image of ${esc(p.name)} in use" loading="lazy"><figcaption>Illustrative image of ${esc(p.name)} in use.</figcaption></figure></div>
<div class="pp-info"><h1>${esc(p.name)}</h1><p class="lead">${esc(p.description)}</p>
<div class="dims" role="group" aria-label="Dimensions in millimetres"><span><b>${d.l}</b>Length</span><span><b>${d.w}</b>Width</span><span><b>${d.h}</b>Height <i>mm</i></span></div>
<p>The ${esc(p.name)} measures ${d.l} mm long, ${d.w} mm wide and ${d.h} mm high (${esc(dimsText(p))}).</p>
<table class="spec"><caption class="sr-only">Specifications for ${esc(p.name)}</caption><tbody>
<tr><th scope="row">Product</th><td>${esc(p.name)}</td></tr><tr><th scope="row">Category</th><td><a href="${catUrl(p.category)}">${esc(info.nav)}</a></td></tr>
<tr><th scope="row">Length</th><td>${d.l} mm</td></tr><tr><th scope="row">Width</th><td>${d.w} mm</td></tr><tr><th scope="row">Height</th><td>${d.h} mm</td></tr></tbody></table>
<div class="pp-actions"><a class="btn btn-wa" target="_blank" rel="noopener" href="${waProduct(p)}">Enquire on WhatsApp</a><a class="btn btn-primary" href="/#quote">Request a quote</a><a class="btn btn-ghost-dark" href="/quantity-calculator/?product=${p.id}">Estimate quantity</a></div>
<p class="note">Prices are by quotation. Please confirm with us that this product suits your project before ordering. Supplied from ${esc(C.locationLine)}.</p></div></div></section>
${related.length ? `<section class="section section-alt"><div class="wrap"><h2>Other ${esc(info.short.toLowerCase())}</h2><div class="grid">${related.map(card).join("\n")}</div></div></section>` : ""}`,
    }),
  );
}

/* ---------- FAQ ---------- */
const FAQ = [
  [
    "How do I get a price?",
    "Pricing is by quotation. Use any “Enquire on WhatsApp” button, the quote form, or call us, and we will reply with current prices and availability.",
  ],
  [
    "What do the dimensions mean?",
    "Every size is given as length × width × height in millimetres. For paving blocks the height is the thickness of the block.",
  ],
  [
    "Does the quote form send my details automatically?",
    "No. The form prepares a message and opens WhatsApp. You must press Send in WhatsApp to complete your enquiry. See our privacy notice for how your details are handled.",
  ],
  [
    "Can I ask about several products at once?",
    "Yes. On the home page, add products to your quote list, set quantities if you know them, and send the whole list in one WhatsApp message.",
  ],
  [
    "How do I know which product suits my project?",
    "Tell us what you are building and where when you enquire, and we will help you confirm the right product.",
  ],
  [
    "How many blocks, pavers or kerbs do I need?",
    "Use the quantity calculator for an estimate from your area, wall size or kerb length. It is an estimate only, so confirm the final quantity with us.",
  ],
  [
    "Where are you located?",
    `${C.locationLine}. Postal address: ${C.postalLine}.`,
  ],
  [
    "Do you deliver?",
    "Please ask about delivery and availability when you enquire, and include your project location.",
  ],
];
{
  const url = "/faq/",
    title = "FAQ | Ashland Concrete Systems Limited, Thika",
    desc =
      "Answers about ordering cabro pavers, hollow blocks and kerb stones from Ashland Concrete Systems Limited in Thika: quotations, sizes, quantities and delivery.";
  write(
    url,
    layout({
      url,
      title,
      desc,
      jsonld: [
        {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ.map(([q, a]) => ({
            "@type": "Question",
            name: q,
            acceptedAnswer: { "@type": "Answer", text: a },
          })),
        },
      ],
      body: `<section class="page-hero compact"><div class="wrap">${crumbs([
        ["Home", "/"],
        ["FAQ", null],
      ])}<h1>Frequently asked questions</h1></div></section>
<section class="section"><div class="wrap narrow">${FAQ.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}
<p>Still have a question? <a target="_blank" rel="noopener" href="${waGeneral}">Message us on WhatsApp</a> or call <a href="tel:${C.phoneTel}">${esc(C.phoneDisplay)}</a>.</p></div></section>`,
    }),
  );
}

/* ---------- calculator ---------- */
{
  const url = "/quantity-calculator/",
    title = "Cabro, Hollow Block & Kerb Quantity Calculator | Ashland Concrete",
    desc =
      "Estimate how many cabro pavers, hollow blocks or kerb stones you need from your area, wall size or kerb length, then send the estimate to Ashland on WhatsApp.";
  const num = (id, label, extra = "") =>
    `<div class="field"><label for="${id}">${label}</label><input id="${id}" type="number" inputmode="decimal" min="0" step="any" ${extra}></div>`;
  write(
    url,
    layout({
      url,
      title,
      desc,
      scripts: ["/js/calculator.js"],
      body: `<section class="page-hero compact"><div class="wrap">${crumbs([
        ["Home", "/"],
        ["Quantity calculator", null],
      ])}<h1>Quantity calculator</h1><p class="lead">Estimate how many pieces you need. Choose a product, enter your measurements in metres, and send the estimate to us on WhatsApp.</p></div></section>
<section class="section"><div class="wrap calc-grid">
<form id="calc" novalidate><div class="field"><label for="c-product">Product</label><select id="c-product"></select></div>
<div data-mode="area"><p class="hint">Enter the total area, or length and width.</p>${num("c-area", "Total area (m²)")}<div class="row">${num("c-len", "Length (m)")}${num("c-wid", "Width (m)")}</div></div>
<div data-mode="wall" hidden><p class="hint">Enter the wall length and height. Block face area is length × height.</p><div class="row">${num("c-wlen", "Wall length (m)")}${num("c-wht", "Wall height (m)")}</div>${num("c-open", "Openings to deduct (m²), optional")}</div>
<div data-mode="run" hidden><p class="hint">Enter the total length of kerb needed.</p>${num("c-run", "Kerb run length (m)")}</div>
${num("c-allow", "Allowance for cuts and breakages (%)", 'value="5" max="30"')}
<button class="btn btn-primary btn-block" type="submit">Calculate</button></form>
<div><div class="result" id="c-result" role="status" aria-live="polite" tabindex="-1"><p class="muted">Your estimate will appear here.</p></div>
<div class="prose small"><h2>How this is calculated</h2><p>Paving: area ÷ (block length × width). Hollow blocks: wall area ÷ (block length × height). Kerbs: run length ÷ kerb length. The allowance is added on top and the result is rounded up.</p>
<p>This is an estimate only. It uses the product's stated size and does not account for joint widths, laying pattern, mortar or site conditions. Please confirm your final quantity with us.</p></div></div>
</div><noscript><p class="wrap">The calculator needs JavaScript. Please call ${esc(C.phoneDisplay)}.</p></noscript></section>`,
    }),
  );
}

/* ---------- careers page ---------- */
const pubJobs = JOBS.filter((j) => j.published);
const careerOnline = !!(C.leadCapture && (!C.careers || C.careers.onlinePreRegistration !== false));
const DOCS = [
  "Factory employment form, cover letter and curriculum vitae",
  "Copies of your academic, trade and professional certificates (testimonials)",
  "National ID",
  "KRA PIN certificate",
  "Certificate of Good Conduct",
  "Any licence or professional registration listed for the role (for example a driving licence with the right endorsements)",
];
const ulist = (a) => (a && a.length ? `<ul>${a.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : "");
const jsec = (h, a) => (a && a.length ? `<h4>${h}</h4>${ulist(a)}` : "");
const jobHtml = (j) =>
  `<details class="job" id="job-${j.n}"><summary><span>${esc(j.title)}</span><span class="job-ref">Ref ${esc(j.ref)}</span></summary><div class="job-body"><p>${esc(j.summary)}</p>${jsec("Key responsibilities", j.responsibilities)}${jsec("Academic qualification", j.academic)}${jsec("Professional certifications", j.certifications)}${jsec("Experience", j.experience)}<a class="btn btn-primary" href="#pre-register" data-apply-role="${esc(j.ref)}">Pre-register for this role</a></div></details>`;
{
  const url = "/careers/";
  const title = `Careers and Vacancies | ${C.companyName}`;
  const desc = trunc(`Current vacancies at ${C.companyName}, ${C.locationLine}. Read the role descriptions, pre-register your interest and learn how our on-site vetting works.`);
  const bc = [["Home", "/"], ["Careers", null]];
  const deadline = C.careers && C.careers.applicationDeadline ? `<p><strong>Closing date:</strong> ${esc(C.careers.applicationDeadline)}</p>` : "";
  const interview = C.careers && C.careers.interviewInfo ? `<p><strong>Interviews:</strong> ${esc(C.careers.interviewInfo)}</p>` : "";
  const roleOptions = pubJobs.map((j) => `<option value="${esc(j.ref)}" data-title="${esc(j.title)}">${esc(j.title)}</option>`).join("");
  const formHtml = pubJobs.length
    ? `<div class="career-form-wrap" id="pre-register"><h2>Pre-register</h2>
<p class="muted">A short form to tell us you are interested. Please do not enter ID numbers or upload documents here: you will present them on site.</p>
<form id="career-form" novalidate>
<div class="field"><label for="cf-name">Full name <span aria-hidden="true">*</span></label><input id="cf-name" name="name" type="text" autocomplete="name" required aria-describedby="e-name"><p class="error" id="e-name" hidden></p></div>
<div class="field"><label for="cf-phone">Phone number <span aria-hidden="true">*</span></label><input id="cf-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" required aria-describedby="e-phone"><p class="error" id="e-phone" hidden></p></div>
<div class="field"><label for="cf-role">Vacancy <span aria-hidden="true">*</span></label><select id="cf-role" name="role" aria-describedby="e-role"><option value="">Select a vacancy</option>${roleOptions}</select><p class="error" id="e-role" hidden></p></div>
<div class="field"><label for="cf-experience">Years of relevant experience</label><select id="cf-experience" name="experience"><option value="">Prefer not to say</option><option>Less than 1 year</option><option>1 to 3 years</option><option>3 to 5 years</option><option>More than 5 years</option></select></div>
<div class="field"><label for="cf-notes">Machines, trade or skills (optional)</label><textarea id="cf-notes" name="notes" rows="3" maxlength="600"></textarea></div>
<div class="hp" aria-hidden="true"><label>Website <input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>
<div class="field"><label class="check"><input id="cf-consent" name="consent" type="checkbox" aria-describedby="e-consent"><span>I agree that ${esc(C.companyName)} may keep these details to contact me about this vacancy. <a href="/privacy.html">Privacy notice</a></span></label><p class="error" id="e-consent" hidden></p></div>
<button class="btn btn-primary btn-block" type="submit">${careerOnline ? "Submit pre-registration" : "Prepare WhatsApp message"}</button>
<p class="form-note">${careerOnline ? "Your details are sent to Ashland and saved in our recruitment records." : "Nothing is sent until you press Send in WhatsApp."} Only shortlisted candidates will be contacted.</p>
<div class="form-result" id="career-result" tabindex="-1" hidden></div></form></div>`
    : "";
  write(url, layout({ url, title, desc, scripts: ["/js/jobs.js", "/js/careers.js"],
    jsonld: hasDomain ? [crumbLd(bc)] : [],
    body: `<section class="page-hero"><div class="wrap">${crumbs(bc)}<h1>Careers at Ashland</h1><p class="lead">${esc(C.companyName)} seeks to recruit qualified, competent, result-oriented and self-driven individuals to fill the vacant posts below.</p></div></section>
<section class="section"><div class="wrap"><h2>How to apply</h2>
<div class="steps-grid">
<div class="step-card"><b>1</b><h3>Pre-register</h3><p>Pick a vacancy and send your name, phone number and experience. It takes about a minute.</p></div>
<div class="step-card"><b>2</b><h3>Prepare your documents</h3><p>Gather the documents in the list below. Hands-on trade assessment and plant safety vetting happen at the factory.</p></div>
<div class="step-card"><b>3</b><h3>Deliver and be vetted</h3><p>Deliver hard copies to the office of the Corporate Head / Chief Executive Officer at ${esc(C.locationLine)}. Only shortlisted candidates are contacted and invited for interview.</p></div></div>
${deadline}${interview}
<div class="docs-box"><strong>Documents you may be asked to present</strong><ul id="docs-list">${DOCS.map((d) => `<li>${esc(d)}</li>`).join("")}</ul></div>
<p class="note">Online pre-registration helps us plan and does not replace the on-site process.</p></div></section>
<section class="section section-alt"><div class="wrap career-layout"><div><h2>Vacancies</h2>${pubJobs.length ? pubJobs.map(jobHtml).join("") : `<p>No vacancies are advertised at the moment. Please check again soon, or call <a href="tel:${C.phoneTel}">${esc(C.phoneDisplay)}</a>.</p>`}</div>${formHtml}</div></section>` }));
}

/* ---------- privacy page ---------- */
{
  const cap = !!C.leadCapture;
  const html = layout({ url: "/privacy.html", title: `Privacy notice | ${C.companyName}`,
    desc: `How ${C.companyName} handles the details you enter in the quotation and careers forms on this website.`,
    body: `<section class="page-hero compact"><div class="wrap">${crumbs([["Home", "/"], ["Privacy notice", null]])}<h1>Privacy notice</h1></div></section>
<section class="section"><div class="wrap prose">
<p>This notice explains what happens to the details you enter on this website.</p>
<h2>The quotation form</h2>
<p>When you complete the form, your browser prepares a WhatsApp message from what you typed (name, phone number, product, quantity, location and message) and opens WhatsApp. The message is only sent to us if you press Send in WhatsApp, after which WhatsApp's own terms and privacy policy apply.</p>
${cap ? `<p>The website also sends the same details to our customer records (a CRM service) so that we can follow up on your enquiry even if you do not press Send in WhatsApp.</p>` : `<p>This website does not receive or store what you type in the form.</p>`}
<h2>Careers pre-registration</h2>
${cap && careerOnline ? `<p>When you pre-register for a vacancy, we receive your name, phone number, the vacancy, your experience level and any skills you mention, and save them in our recruitment records so that we can contact shortlisted candidates. We do not ask for ID numbers or other documents online: they are checked in person at the factory. If the online submission fails, the form offers a WhatsApp message instead.` : `<p>The pre-registration form prepares a WhatsApp message with your name, phone number, chosen vacancy, experience level and notes. Nothing is sent until you press Send in WhatsApp.`}</p>
<h2>Quote list</h2>
<p>Products you add to your quote list are kept in your browser's session storage so the list survives a page reload. They are cleared when you close the tab${cap ? ", and are only sent to us if you include them in a quotation enquiry" : " and are never sent anywhere by this website"}.</p>
<h2>Third-party services</h2>
<p>This website loads fonts from Google Fonts${C.mapEmbedUrl ? " and shows an embedded Google Map on the contact section" : ""}. Links to WhatsApp and Google Maps open those services only when you click them. These services have their own privacy policies.</p>
<h2>Your choices</h2>
<p>You can ask us to correct or delete the details you have given us by calling <a href="tel:${C.phoneTel}">${esc(C.phoneDisplay)}</a> or messaging us on <a data-wa-general href="${waGeneral}" target="_blank" rel="noopener">WhatsApp</a>.</p>
<h2>Contact</h2>
<p>${esc(C.companyName)}, ${esc(C.locationLine)}. ${esc(C.postalLine)}.</p></div></section>` });
  fs.writeFileSync(path.join(ROOT, "privacy.html"), html);
}

/* ---------- patch the hand-written home page (only marked blocks, WhatsApp links and URLs) ---------- */
const pinOk = WAJS.hasPin();
const aboutFacts = C.about || {};
const warnings = [];
function localBusinessLd() {
  const street = String(C.locationLine).split(",").slice(0, 2).join(",").trim();
  const poBox = (String(C.postalLine).match(/\b(\d{3,})\b/) || [])[1];
  const ld = { "@context": "https://schema.org", "@type": "LocalBusiness", name: C.companyName, telephone: C.phoneTel,
    address: { "@type": "PostalAddress", streetAddress: street, addressLocality: C.addressLocality || "", ...(C.postalCode ? { postalCode: C.postalCode } : {}), ...(poBox ? { postOfficeBoxNumber: poBox } : {}), addressCountry: "KE" } };
  if (hasDomain) { ld.url = abs("/"); ld.image = abs("/assets/images/ashland-banner.jpg"); ld.logo = abs("/assets/logo/ashland-logo.png"); }
  if (pinOk) ld.geo = { "@type": "GeoCoordinates", latitude: C.geo.lat, longitude: C.geo.lng };
  if (C.serviceAreas && C.serviceAreas.length) ld.areaServed = C.serviceAreas.map((n) => ({ "@type": "Place", name: n }));
  return ld;
}
function proofHtml() {
  const card = (h, t) => `<article class="proof-card"><h4>${esc(h)}</h4><p>${esc(t)}</p></article>`;
  const techMsg = wa(`${greet}I would like technical information (specifications and available test data) for the following product: `);
  return `<div class="wrap proof"><h3>Quality, compliance and capability</h3><div class="proof-grid">
${card("KRA eTIMS", "We issue eTIMS-compliant tax documentation.")}
${aboutFacts.equipment ? card("Manufacturing", aboutFacts.equipment) : ""}
${aboutFacts.standards ? card("Standards", aboutFacts.standards) : ""}
${aboutFacts.strength ? card("Product strength", aboutFacts.strength) : ""}
${aboutFacts.reach ? card("Reach", aboutFacts.reach) : ""}
<article class="proof-card"><h4>Technical data on request</h4><p>Need sizes, tolerances or strength data for a tender or RFQ? Ask us and we will share what is available for your product.</p><a class="btn btn-wa" href="${techMsg}" target="_blank" rel="noopener">Request technical data</a></article>
</div></div>`;
}
function patchIndex() {
  const file = path.join(ROOT, "index.html");
  if (!fs.existsSync(file)) return;
  let html = fs.readFileSync(file, "utf8");
  const original = html;
  const block = (name, inner) => {
    const re = new RegExp(`(<!--${name}:START-->)[\\s\\S]*?(<!--${name}:END-->)`);
    if (!re.test(html)) { console.warn(`NOTE: marker ${name} not found in index.html`); return; }
    html = html.replace(re, (m, a, b) => `${a}\n${inner}\n${b}`);
  };
  html = html.replace(/(data-wa-general href=")[^"]*(")/g, (m, a, b) => a + waGeneral + b);
  if (hasDomain) {
    for (const re of [/(<link rel="canonical" href=")https?:\/\/[^\/"]+/, /(<meta property="og:url"\s+content=")https?:\/\/[^\/"]+/, /(<meta property="og:image"\s+content=")https?:\/\/[^\/"]+/, /(<meta name="twitter:image"\s+content=")https?:\/\/[^\/"]+/])
      html = html.replace(re, (m, a) => a + SITE_URL);
  }
  block("JSONLD", `<script type="application/ld+json">${JSON.stringify(localBusinessLd())}</script>`);
  block("ABOUT-PROOF", proofHtml());
  const dir = WAJS.directionsLink();
  block("CONTACT-MAP-BUTTONS", dir
    ? `<a class="btn btn-primary" href="${dir}" target="_blank" rel="noopener">Get directions</a>\n<a class="btn btn-ghost-dark" id="map-link" href="${WAJS.mapLink()}" target="_blank" rel="noopener">View on Google Maps</a>`
    : `<a class="btn btn-ghost-dark" id="map-link" href="${WAJS.mapLink()}" target="_blank" rel="noopener">Open in Google Maps</a>`);
  const embed = /^https:\/\/www\.google\.com\/maps\/embed/.test(C.mapEmbedUrl || "") ? `<div class="map-embed"><iframe src="${esc(C.mapEmbedUrl)}" title="Map showing the ${esc(C.companyName)} factory yard" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div>` : "";
  block("CONTACT-MAP-NOTE", pinOk
    ? `<p class="gps">GPS: ${C.geo.lat}, ${C.geo.lng}</p>${embed}`
    : `<p class="note">The map link searches for the address. It is not a surveyed pin, so please call if you need directions.</p>`);
  if (html !== original) fs.writeFileSync(file, html);
  if (!pinOk) warnings.push("No verified yard coordinates yet (config.geo): the map still uses a text search and shows the 'not a surveyed pin' note.");
  if (!hasDomain) warnings.push("No production domain yet (config.siteUrl): canonical/social URLs on the home page still point at the old address, and sitemap.xml/robots.txt were not updated.");
  for (const k of ["standards", "strength"]) if (!aboutFacts[k]) warnings.push(`About block: '${k}' is empty, so that proof point is not shown (fill it only with documented facts).`);
  if (!pubJobs.length) warnings.push("Careers: no vacancy is marked published in js/jobs.js.");
}
patchIndex();

/* ---------- sitemap ---------- */
if (hasDomain) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = ["/", ...written, "/privacy.html"];
  fs.writeFileSync(
    path.join(ROOT, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${abs(u)}</loc><lastmod>${today}</lastmod></url>`).join("\n")}\n</urlset>\n`,
  );
  console.log(`sitemap.xml written with ${urls.length} URLs`);
  fs.writeFileSync(path.join(ROOT, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${abs("/sitemap.xml")}\n`);
} else
  console.warn(
    "NOTE: SITE_URL not set, so canonical tags and sitemap.xml were skipped.",
  );
console.log(`Built ${written.length} pages:`, written.join("  "));
for (const w of warnings) console.warn("TODO: " + w);
