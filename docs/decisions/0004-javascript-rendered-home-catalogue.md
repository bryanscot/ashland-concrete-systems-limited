# 0004. Home-page catalogue rendered by JavaScript

- **Status:** Accepted (recorded 2026-11-12)
- **Where in the code:** `js/main.js` (`render`, `cardHTML`, filters, search), `index.html` (`#product-grid`, `#filters`)

## Context
The home page needs instant filtering, search, a details pop-up and a quote list, driven by the same data file as everything else.

## Decision
The browser builds the product cards on the home page from `js/products.js`. Crawlable HTML versions of every product and category exist as generated pages (decision 0003), linked from the footer, the Products dropdown and the cards.

## Consequences
- The home page's product cards are not in its HTML source. Search engines usually run JavaScript, but the generated category and product pages are the reliable route for search.
- Without JavaScript the catalogue area shows only a message with the phone and WhatsApp links.
- Card markup exists twice (`cardHTML` in `js/main.js`, `card()` in the generator) and must be kept visually consistent.
- No framework is needed, and the data file stays the single source of truth for product facts.