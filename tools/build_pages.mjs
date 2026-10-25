// Generates crawlable pages from js/products.js: category pages, one page per product, FAQ, calculator, sitemap.
// Run:  node tools/build_pages.mjs     (also runs automatically in the GitHub workflow)
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// Set your live domain here (no trailing slash) once you own it, e.g. "https://www.ashlandconcrete.co.ke"
const SITE_URL = process.env.SITE_URL || "https://YOUR-DOMAIN";
const hasDomain = !SITE_URL.includes("YOUR-DOMAIN");

/* ---------- load site data ---------- */
const ctx = vm.createContext({ window: {} });
for (const f of ["js/config.js", "js/products.js"])
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), "utf8"), ctx);
const C = ctx.window.ASHLAND_CONFIG,
  P = ctx.window.ASHLAND_PRODUCTS,
  CATLIST = ctx.window.ASHLAND_CATEGORIES;

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
  ...catIds.map((id) => [catInfo(id).nav, catUrl(id)]),
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
    <div><h2>Company</h2><ul><li><a href="/#about">About Us</a></li><li><a href="/#contact">Contact</a></li><li><a href="/privacy.html">Privacy notice</a></li><li><a href="/assets/Ashland-Product-Catalogue.pdf" download="Ashland-Product-Catalogue.pdf">Product catalogue (PDF)</a></li></ul></div>
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
    "No. The form prepares a message and opens WhatsApp. You must press Send in WhatsApp to complete your enquiry. This website does not store your details.",
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

/* ---------- sitemap ---------- */
if (hasDomain) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = ["/", ...written, "/privacy.html"];
  fs.writeFileSync(
    path.join(ROOT, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${abs(u)}</loc><lastmod>${today}</lastmod></url>`).join("\n")}\n</urlset>\n`,
  );
  console.log(`sitemap.xml written with ${urls.length} URLs`);
} else
  console.warn(
    "NOTE: SITE_URL not set, so canonical tags and sitemap.xml were skipped.",
  );
console.log(`Built ${written.length} pages:`, written.join("  "));
