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
