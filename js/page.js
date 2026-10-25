/* Shared behaviour for the generated pages: mobile menu, WhatsApp links, year. */
(function () {
  "use strict";
  var C = window.ASHLAND_CONFIG,
    WA = window.AshlandWA;
  if (WA)
    document.querySelectorAll("[data-wa-general]").forEach(function (a) {
      a.href = WA.whatsappLink(WA.generalMessage());
    });
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  var nav = document.getElementById("site-nav"),
    toggle = document.querySelector(".menu-toggle");
  if (!nav || !toggle) return;
  function setMenu(open) {
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("menu-open", open);
  }
  toggle.addEventListener("click", function () {
    setMenu(toggle.getAttribute("aria-expanded") !== "true");
  });
  nav.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      setMenu(false);
    });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("open")) {
      setMenu(false);
      toggle.focus();
    }
  });
  document.addEventListener("click", function (e) {
    if (
      nav.classList.contains("open") &&
      !nav.contains(e.target) &&
      !toggle.contains(e.target)
    )
      setMenu(false);
  });
  window
    .matchMedia("(min-width: 900px)")
    .addEventListener("change", function (e) {
      if (e.matches) setMenu(false);
    });
})();
