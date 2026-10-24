"""Builds assets/Ashland-Product-Catalogue.pdf (A4, colour) from catalogue.html using headless Chromium."""
import functools, http.server, pathlib, threading
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "Ashland-Product-Catalogue.pdf"

handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(ROOT))
handler.log_message = lambda *a, **k: None
server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
threading.Thread(target=server.serve_forever, daemon=True).start()
url = f"http://127.0.0.1:{server.server_address[1]}/catalogue.html"

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1200, "height": 900})
    page.goto(url, wait_until="networkidle")
    page.wait_for_selector(".product")
    broken = page.evaluate("[...document.images].filter(i => !i.complete || i.naturalWidth === 0).map(i => i.getAttribute('src'))")
    if broken:
        raise SystemExit(f"Broken images in catalogue: {broken}")
    page.pdf(path=str(OUT), format="A4", print_background=True, prefer_css_page_size=True)
    browser.close()
server.shutdown()
print(f"Wrote {OUT} ({OUT.stat().st_size // 1024} KB)")