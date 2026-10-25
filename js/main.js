(function () {
  "use strict";
  const C = window.ASHLAND_CONFIG, P = window.ASHLAND_PRODUCTS, CATS = window.ASHLAND_CATEGORIES, WA = window.AshlandWA;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const byId = id => P.find(p => p.id === id);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- General links ---------- */
  $$("[data-wa-general]").forEach(a => (a.href = WA.whatsappLink(WA.generalMessage())));
  $("#map-link").href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(C.mapQuery);
  $("#year").textContent = new Date().getFullYear();

  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.hidden = false;
    clearTimeout(toast.t); toast.t = setTimeout(() => (t.hidden = true), 2600);
  }
  function copyText(text, okMsg) {
    const done = () => toast(okMsg);
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text, done));
    else fallbackCopy(text, done);
  }
  function fallbackCopy(text, done) {
    const ta = document.createElement("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); done(); } catch (e) { toast("Copy not available — please select the text manually."); }
    ta.remove();
  }
  $("#copy-address").addEventListener("click", () => copyText(C.companyName + ", " + C.locationLine + ", " + C.postalLine, "Address copied"));

  /* ---------- Mobile menu ---------- */
  const toggle = $(".menu-toggle"), nav = $("#site-nav");
  function setMenu(open) {
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("menu-open", open);
  }
  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  $$("a", nav).forEach(a => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", e => { if (e.key === "Escape" && nav.classList.contains("open")) { setMenu(false); toggle.focus(); } });
  window.matchMedia("(min-width: 900px)").addEventListener("change", e => { if (e.matches) setMenu(false); });

  /* ---------- Quote list ---------- */
  let list = [];
  try { list = JSON.parse(sessionStorage.getItem("ashland-list") || "[]").filter(i => byId(i.id)); } catch (e) { list = []; }
  const saveList = () => { try { sessionStorage.setItem("ashland-list", JSON.stringify(list)); } catch (e) { /* storage unavailable */ } };
  const listItems = () => list.map(i => ({ product: byId(i.id), quantity: i.quantity }));
  const inList = id => list.some(i => i.id === id);

  function updateListUI() {
    $$("[data-list-count]").forEach(n => (n.textContent = list.length));
    $$("[data-add]").forEach(b => {
      const on = inList(b.dataset.add);
      b.textContent = on ? "✓ In quote list" : "Add to quote list";
      b.setAttribute("aria-pressed", String(on));
    });
    const notice = $("#list-notice");
    notice.hidden = !list.length;
    if (list.length) notice.textContent = list.length + " product" + (list.length > 1 ? "s" : "") + " from your quote list will be included in the message.";
  }
  function toggleList(id) {
    if (inList(id)) list = list.filter(i => i.id !== id); else list.push({ id, quantity: "" });
    saveList(); updateListUI(); renderListDialog();
  }

  const listDlg = $("#list-dialog");
  function renderListDialog() {
    const body = $("#list-body");
    if (!list.length) {
      body.innerHTML = '<p class="muted">Your list is empty. Use “Add to quote list” on any product to build a multi-product enquiry.</p>';
      return;
    }
    body.innerHTML = '<ul class="list-items">' + list.map(i => {
      const p = byId(i.id);
      return '<li><div><strong>' + esc(p.name) + '</strong><span>' + esc(WA.formatDims(p)) + '</span></div>' +
        '<label class="sr-only" for="q-' + p.id + '">Quantity for ' + esc(p.name) + '</label>' +
        '<input id="q-' + p.id + '" data-qty="' + p.id + '" type="text" placeholder="Qty" value="' + esc(i.quantity) + '">' +
        '<button type="button" class="link-btn" data-remove="' + p.id + '" aria-label="Remove ' + esc(p.name) + '">Remove</button></li>';
    }).join("") + '</ul>' +
      '<div class="dlg-actions"><a class="btn btn-wa" id="send-list" href="#" target="_blank" rel="noopener">Send list on WhatsApp</a>' +
      '<a class="btn btn-ghost-dark" href="#quote" data-close>Use the quote form instead</a></div>' +
      '<p class="muted small">WhatsApp opens with your message ready. You must press Send there to complete the enquiry.</p>';
    refreshSendLink();
  }
  function refreshSendLink() {
    const a = $("#send-list"); if (a) a.href = WA.whatsappLink(WA.multiProductMessage(listItems()));
  }
  listDlg.addEventListener("input", e => {
    const q = e.target.closest("[data-qty]"); if (!q) return;
    const item = list.find(i => i.id === q.dataset.qty); if (item) { item.quantity = q.value.trim(); saveList(); refreshSendLink(); }
  });
  listDlg.addEventListener("click", e => {
    const r = e.target.closest("[data-remove]");
    if (r) { toggleList(r.dataset.remove); }
  });
  $$("[data-open-list]").forEach(b => b.addEventListener("click", () => { renderListDialog(); listDlg.showModal(); }));

  /* Shared dialog behaviour: close buttons, backdrop click */
  function wireDialog(d) {
    d.addEventListener("click", e => {
      if (e.target === d || e.target.closest("[data-close]")) d.close();
    });
  }
  wireDialog(listDlg); wireDialog($("#product-dialog"));

  /* ---------- Catalogue ---------- */
  const grid = $("#product-grid"), filtersEl = $("#filters"), search = $("#product-search");
  let activeCat = "all";

  filtersEl.innerHTML = CATS.map(c => '<button type="button" class="chip" data-cat="' + c.id + '" aria-pressed="' + (c.id === "all") + '">' + esc(c.label) + '</button>').join("");

  function cardHTML(p) {
    const d = p.dims;
    return '<article class="card" data-id="' + p.id + '">' +
      '<button class="card-media" type="button" data-details="' + p.id + '" aria-label="View details for ' + esc(p.name) + '">' +
      '<img src="' + p.image + '" alt="' + esc(p.alt) + '" loading="lazy" width="600" height="450"></button>' +
      '<div class="dims" role="group" aria-label="Dimensions in millimetres">' +
      '<span><b>' + d.l + '</b>Length</span><span><b>' + d.w + '</b>Width</span><span><b>' + d.h + '</b>Height <i>mm</i></span></div>' +
      '<div class="card-body"><h3><a class="card-link" href="/products/' + p.id + '/">' + esc(p.name) + '</a></h3><p>' + esc(p.description) + '</p>' +
      '<div class="card-actions">' +
      '<a class="btn btn-wa" target="_blank" rel="noopener" href="' + WA.whatsappLink(WA.productMessage(p)) + '">Enquire on WhatsApp</a>' +
      '<button class="btn btn-ghost-dark" type="button" data-details="' + p.id + '">Details</button>' +
      '<button class="btn btn-ghost-dark" type="button" data-add="' + p.id + '" aria-pressed="false">Add to quote list</button>' +
      '</div></div></article>';
  }

  function render() {
    const q = search.value.trim().toLowerCase();
    const shown = P.filter(p => {
      if (activeCat !== "all" && p.category !== activeCat) return false;
      if (!q) return true;
      const hay = (p.name + " " + p.description + " " + WA.formatDims(p) + " " + p.dims.l + " " + p.dims.w + " " + p.dims.h).toLowerCase();
      return q.split(/\s+/).every(t => hay.includes(t));
    });
    grid.innerHTML = shown.map(cardHTML).join("");
    $("#empty-state").hidden = shown.length > 0;
    $("#result-count").textContent = shown.length ? "Showing " + shown.length + " of " + P.length + " products" : "";
    updateListUI();
  }
  function setCat(id) {
    activeCat = id;
    $$(".chip", filtersEl).forEach(c => c.setAttribute("aria-pressed", String(c.dataset.cat === id)));
    render();
  }
  filtersEl.addEventListener("click", e => { const c = e.target.closest("[data-cat]"); if (c) setCat(c.dataset.cat); });
  search.addEventListener("input", render);
  $("#clear-filters").addEventListener("click", () => { search.value = ""; setCat("all"); });
  $$("[data-footer-cat]").forEach(a => a.addEventListener("click", () => { search.value = ""; setCat(a.dataset.footerCat); }));

  grid.addEventListener("click", e => {
    const det = e.target.closest("[data-details]"); if (det) return openProduct(det.dataset.details);
    const add = e.target.closest("[data-add]"); if (add) toggleList(add.dataset.add);
  });

  /* ---------- Product dialog ---------- */
  const pDlg = $("#product-dialog");
  function openProduct(id) {
    const p = byId(id), d = p.dims;
    pDlg.innerHTML =
      '<div class="dlg-head"><h2 id="pd-title">' +
      esc(p.name) +
      '</h2><button class="dlg-close" type="button" data-close aria-label="Close details">×</button></div>' +
      '<div class="pd-grid"><div class="pd-images">' +
      '<img src="' +
      p.image +
      '" alt="' +
      esc(p.alt) +
      '">' +
      '<img src="' +
      p.inUseImage +
      '" alt="Illustrative image of ' +
      esc(p.name) +
      ' in use" loading="lazy">' +
      '</div><div class="pd-info"><p>' +
      esc(p.description) +
      "</p>" +
      '<table><caption class="sr-only">Dimensions of ' +
      esc(p.name) +
      "</caption><tbody>" +
      '<tr><th scope="row">Length</th><td>' +
      d.l +
      ' mm</td></tr><tr><th scope="row">Width</th><td>' +
      d.w +
      ' mm</td></tr><tr><th scope="row">Height</th><td>' +
      d.h +
      " mm</td></tr></tbody></table>" +
      '<p class="muted small">' +
      esc(p.shownIn) +
      " Images are illustrative. Please confirm this is the right product for your project when you enquire.</p>" +
      '<a class="btn btn-primary btn-block pd-more" href="/products/' +
      p.id +
      '/">View full product page <span aria-hidden="true">→</span></a>' +
      '<div class="dlg-actions"><a class="btn btn-wa" target="_blank" rel="noopener" href="' +
      WA.whatsappLink(WA.productMessage(p)) +
      '">Enquire on WhatsApp</a>' +
      '<button class="btn btn-ghost-dark" type="button" data-add="' +
      p.id +
      '" aria-pressed="false">Add to quote list</button></div></div></div>';
    pDlg.showModal(); updateListUI();
  }
  pDlg.addEventListener("click", e => { const add = e.target.closest("[data-add]"); if (add) toggleList(add.dataset.add); });

  /* ---------- Quote form ---------- */
  const form = $("#quote-form"), sel = $("#f-product"), result = $("#form-result");
  sel.innerHTML = '<option value="">Select a product (optional)</option>' +
    P.map(p => '<option value="' + p.id + '">' + esc(WA.productLabel(p)) + '</option>').join("") +
    '<option value="__multi">Multiple products</option><option value="__unsure">Not sure — please advise</option>';

  function fieldError(id, msg) {
    const el = $("#e-" + id), input = $("#f-" + id);
    el.textContent = msg || ""; el.hidden = !msg;
    input.setAttribute("aria-invalid", msg ? "true" : "false");
  }
  function validate(focusFirst) {
    let ok = true, first = null;
    const name = form.name.value.trim(), phone = form.phone.value.trim();
    const phoneDigits = phone.replace(/\D/g, "");
    if (name.length < 2) { fieldError("name", "Please enter your full name."); ok = false; first = first || form.name; } else fieldError("name");
    if (!/^[+\d\s()-]+$/.test(phone) || phoneDigits.length < 9 || phoneDigits.length > 15) {
      fieldError("phone", "Please enter a valid phone number, e.g. 0712 345 678."); ok = false; first = first || form.phone;
    } else fieldError("phone");
    if (first && focusFirst) first.focus();
    return ok;
  }
  form.addEventListener("submit", e => {
    e.preventDefault();
    if (!validate(true)) return;
    let productText = "";
    if (sel.value === "__multi") productText = "Multiple products";
    else if (sel.value === "__unsure") productText = "Not sure — please advise";
    else if (sel.value) productText = WA.productLabel(byId(sel.value));
    const msg = WA.formMessage({
      name: form.name.value.trim(), phone: form.phone.value.trim(), product: productText,
      quantity: form.quantity.value.trim(), location: form.location.value.trim(), message: form.message.value.trim()
    }, listItems());
    const link = WA.whatsappLink(msg);
    result.hidden = false;
    result.innerHTML = '<p><strong>Your message is ready — it has not been sent yet.</strong></p>' +
      '<p>WhatsApp should open in a new tab. Press <em>Send</em> there to complete your enquiry.</p>' +
      '<p>If nothing opened, use the button below, or copy the message and send it to ' + esc(C.phoneDisplay) + ' on WhatsApp.</p>' +
      '<pre class="msg-preview">' + esc(msg) + '</pre>' +
      '<div class="dlg-actions"><a class="btn btn-wa" id="open-wa" target="_blank" rel="noopener" href="' + link + '">Open WhatsApp</a>' +
      '<button class="btn btn-ghost-dark" type="button" id="copy-msg">Copy message</button>' +
      '<a class="btn btn-ghost-dark" href="tel:' + C.phoneTel + '">Call instead</a></div>';
    $("#copy-msg").addEventListener("click", () => copyText(msg, "Message copied"));
    window.open(link, "_blank", "noopener");
    result.focus();
  });
  ["name", "phone"].forEach(k => form[k].addEventListener("input", () => { if (form[k].getAttribute("aria-invalid") === "true") validate(false); }));

  /* Product "quote" shortcut: selecting is handled by list; also preselect via hash like #quote?product=cabro-60 */
  const m = location.hash.match(/product=([\w-]+)/);
  if (m && byId(m[1])) sel.value = m[1];

  render();
})();
