/* "Products" menu dropdown: hover/focus on desktop, expandable list in the mobile menu.
   Built from js/products.js, so new products appear automatically. */
(function () {
  "use strict";
  var P = window.ASHLAND_PRODUCTS,
    CATS = window.ASHLAND_CATEGORIES;
  var nav = document.getElementById("site-nav");
  if (!nav || !P || !CATS) return;
  var link = nav.querySelector('ul > li > a[href$="#products"]');
  if (!link) return;
  var li = link.parentElement;

  var SLUG = {
    paving: "cabro-pavers",
    blocks: "hollow-blocks",
    kerbs: "kerb-stones",
  }; // must match tools/build_pages.mjs
  var onHome =
    location.pathname === "/" || /\/index\.html$/.test(location.pathname);
  var allHref = onHome ? "#products" : "/#products";
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[c];
    });
  };

  var cols = CATS.filter(function (c) {
    return c.id !== "all";
  })
    .map(function (c) {
      var items = P.filter(function (p) {
        return p.category === c.id;
      });
      if (!items.length) return "";
      return (
        '<div class="dd-col"><a class="dd-head" href="/' +
        (SLUG[c.id] || c.id) +
        '/">' +
        esc(c.label) +
        ' <span aria-hidden="true">→</span></a>' +
        items
          .map(function (p) {
            return (
              '<a class="dd-item" href="/products/' +
              p.id +
              '/"><span class="dd-name">' +
              esc(p.name) +
              '</span><span class="dd-dims">' +
              p.dims.l +
              " × " +
              p.dims.w +
              " × " +
              p.dims.h +
              " mm</span></a>"
            );
          })
          .join("") +
        "</div>"
      );
    })
    .join("");

  li.classList.add("has-dropdown");
  li.insertAdjacentHTML(
    "beforeend",
    '<button class="dd-toggle" type="button" aria-expanded="false" aria-controls="dd-panel" aria-label="Show product list"></button>' +
      '<div class="dd-panel" id="dd-panel"><div class="dd-inner"><div class="dd-cols">' +
      cols +
      "</div>" +
      '<div class="dd-foot"><a href="' +
      allHref +
      '">View all products</a><a href="/quantity-calculator/">Quantity calculator</a>' +
      '<a href="/assets/Ashland-Product-Catalogue.pdf" download="Ashland-Product-Catalogue.pdf">Download catalogue (PDF)</a></div></div></div>',
  );

  var btn = li.querySelector(".dd-toggle");
  function setOpen(open) {
    li.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute(
      "aria-label",
      open ? "Hide product list" : "Show product list",
    );
  }
  btn.addEventListener("click", function (e) {
    e.stopPropagation();
    li.classList.remove("dd-esc");
    setOpen(!li.classList.contains("open"));
  });

  // Esc closes the dropdown (and keeps it closed until the pointer or focus leaves)
  li.addEventListener("keydown", function (e) {
    if (
      e.key !== "Escape" ||
      (!li.classList.contains("open") && !li.matches(":hover, :focus-within"))
    )
      return;
    if (nav.classList.contains("open") && li.classList.contains("open")) {
      e.stopPropagation();
      setOpen(false);
      btn.focus();
      return;
    }
    li.classList.add("dd-esc");
    setOpen(false);
    link.focus();
  });
  ["mouseleave", "focusout"].forEach(function (ev) {
    li.addEventListener(ev, function () {
      setTimeout(function () {
        if (!li.matches(":hover, :focus-within")) li.classList.remove("dd-esc");
      }, 0);
    });
  });
  document.addEventListener("click", function (e) {
    if (!li.contains(e.target)) setOpen(false);
  });

  // Mobile: collapse the list whenever the menu closes
  new MutationObserver(function () {
    if (!nav.classList.contains("open")) setOpen(false);
  }).observe(nav, { attributes: true, attributeFilter: ["class"] });
  // Mobile: tapping any link in the list closes the menu (needed for same-page links such as "View all products")
  li.querySelector(".dd-panel").addEventListener("click", function (e) {
    var a = e.target.closest("a");
    var t = document.querySelector(".menu-toggle");
    if (a && nav.classList.contains("open") && t) t.click();
  });
})();
