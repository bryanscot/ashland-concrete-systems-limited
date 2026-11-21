# 0005. PDF catalogue printed from a web page by headless Chrome

- **Status:** Accepted, with a known size problem (recorded 2026-11-12)
- **Where in the code:** `catalogue.html`, `tools/make_catalogue_pdf.py`, workflow step "Build PDF"

## Context
Customers and contractors want a catalogue they can download and forward. It had to stay in step with the product data without anyone laying it out by hand.

## Decision
`catalogue.html` builds an A4 colour catalogue from the data files. A Python script opens it in headless Chromium (Playwright) and saves `assets/Ashland-Product-Catalogue.pdf`. The workflow rebuilds it on data or image changes and commits it. The script stops with a message if any image is missing.

## Consequences
- Always current, with selectable text and working WhatsApp links; no manual design work.
- Chromium embeds each photo at full size, so the PDF is currently about 43 MB. Each rebuild adds another copy to Git history; the repository's `.git` folder is about 131 MB. Resizing photos to about 1200 px, or having the PDF page use smaller versions, would fix most of this.
- The CI job needs Python, Playwright and Chromium, which makes it the slowest part of the workflow.