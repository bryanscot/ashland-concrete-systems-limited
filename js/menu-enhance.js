/* Mobile menu extras: tap-outside-to-close and highlighting the current section. */
(function () {
  "use strict";
  var nav = document.getElementById("site-nav");
  var toggle = document.querySelector(".menu-toggle");
  if (!nav || !toggle) return;

  document.addEventListener("click", function (e) {
    if (toggle.getAttribute("aria-expanded") !== "true") return;
    if (nav.contains(e.target) || toggle.contains(e.target)) return;
    toggle.click();
  });

  var links = Array.prototype.slice.call(
    nav.querySelectorAll('ul a[href^="#"]'),
  );
  var targets = links.map(function (a) {
    return { a: a, id: a.getAttribute("href") };
  });
  var ticking = false;

  function update() {
    ticking = false;
    var y = window.scrollY + 140,
      current = null,
      best = -1;
    targets.forEach(function (t) {
      var el = document.querySelector(t.id);
      if (!el) return;
      var top =
        t.id === "#top" ? 0 : el.getBoundingClientRect().top + window.scrollY;
      // nav order differs from page order, so pick the section nearest above the viewport top
      if (top <= y && top > best) {
        best = top;
        current = t;
      }
    });
    links.forEach(function (a) {
      a.removeAttribute("aria-current");
    });
    if (current) current.a.setAttribute("aria-current", "true");
  }

  var settle;
  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
      clearTimeout(settle);
      settle = setTimeout(update, 150); // re-check once scrolling has stopped
    },
    { passive: true },
  );
  window.addEventListener("scrollend", update);
  window.addEventListener("load", update);
  window.addEventListener("resize", update);
  toggle.addEventListener("click", update); // fresh result whenever the menu is opened

  // Highlight a link as soon as it is tapped; scrolling then confirms it
  links.forEach(function (a) {
    a.addEventListener("click", function () {
      links.forEach(function (l) {
        l.removeAttribute("aria-current");
      });
      a.setAttribute("aria-current", "true");
    });
  });
  update();
})();




/* Phone back button closes the mobile menu (instead of leaving the page) */
(function () {
  "use strict";
  var nav = document.getElementById("site-nav");
  var toggle = document.querySelector(".menu-toggle");
  if (!nav || !toggle || !window.history || !history.pushState) return;

  var pendingTarget = null;
  function isOpen() { return toggle.getAttribute("aria-expanded") === "true"; }
  function menuEntry() { return history.state && history.state.menu === true; }

  // Menu opened -> add a history entry. Menu closed by X / outside tap / Esc -> remove that entry.
  new MutationObserver(function () {
    if (isOpen()) {
      if (!menuEntry()) history.pushState({ menu: true }, "", location.href);
    } else if (menuEntry()) {
      history.back();
    }
  }).observe(toggle, { attributes: true, attributeFilter: ["aria-expanded"] });

  // Back button pressed -> close the menu (and finish any pending link jump)
  window.addEventListener("popstate", function () {
    if (isOpen()) toggle.click();
    setTimeout(runPending, 80); // after the browser finishes restoring scroll
  });

  // Tapping a menu link: close via history, then scroll (keeps the history clean, no stray entries)
  nav.addEventListener("click", function (e) {
    var a = e.target.closest('ul a[href^="#"]');
    if (!a || !isOpen()) return;
    var target = document.querySelector(a.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    pendingTarget = target;
    setTimeout(runPending, 400); // safety net if popstate never fires
  }, true);

  function runPending() {
    if (!pendingTarget) return;
    var t = pendingTarget; pendingTarget = null;
    t.scrollIntoView({ behavior: "smooth", block: "start" });
  }
})();