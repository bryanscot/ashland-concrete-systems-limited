/* Hero count-up and product-card reveal. Respects "reduce motion". */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;

  /* 1. Hero dimension strip counts up from 0 (final numbers stay in the HTML) */
  document.querySelectorAll(".dim-strip b").forEach(function (el) {
    var end = parseFloat(el.textContent);
    if (isNaN(end)) return;
    var start = null, delay = 450, dur = 1100;
    el.textContent = "0";
    function tick(ts) {
      if (start === null) start = ts;
      var t = Math.min(Math.max((ts - start - delay) / dur, 0), 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(tick); else el.textContent = end;
    }
    requestAnimationFrame(tick);
  });

  /* 2. Product cards fade up as they scroll into view; re-runs after every filter/search */
  var grid = document.getElementById("product-grid");
  if (!grid || !("IntersectionObserver" in window)) return;

  var io = new IntersectionObserver(function (entries) {
    var k = 0;
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var card = entry.target;
      io.unobserve(card);
      card.style.transitionDelay = (k++ * 70) + "ms";
      card.classList.add("is-in");
      card.addEventListener("transitionend", function done(e) {
        if (e.target !== card) return;
        card.classList.remove("will-reveal", "is-in");   // hand control back to hover styles
        card.style.transitionDelay = "";
        card.removeEventListener("transitionend", done);
      });
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

  function prepare() {
    grid.querySelectorAll(".card:not([data-anim])").forEach(function (card) {
      card.setAttribute("data-anim", "1");
      card.classList.add("will-reveal");
      io.observe(card);
    });
  }
  new MutationObserver(prepare).observe(grid, { childList: true });
  prepare();
})();



/* 3. Section reveals: headings and content blocks fade up once as they enter the screen */
(function () {
  "use strict";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!("IntersectionObserver" in window)) return;

  var targets = document.querySelectorAll(
    ".section-head, .about-grid > *, .why-list > li, .gallery > figure, " +
    "#faq h2, #faq details, .quote-intro, #quote-form, .contact-grid > *"
  );

  var io = new IntersectionObserver(function (entries) {
    var k = 0;
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      io.unobserve(el);
      el.style.transitionDelay = (k++ * 80) + "ms";   // siblings appear one after another
      el.classList.add("is-in");
      el.addEventListener("transitionend", function done(e) {
        if (e.target !== el) return;
        el.classList.remove("reveal", "is-in");
        el.style.transitionDelay = "";
        el.removeEventListener("transitionend", done);
      });
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

  targets.forEach(function (el) { el.classList.add("reveal"); io.observe(el); });
})();


/* 7. Header: soft shadow + slightly smaller logo once the page is scrolled */
(function () {
  "use strict";
  var header = document.querySelector(".site-header");
  if (!header) return;
  var ticking = false;
  function update() {
    ticking = false;
    header.classList.toggle("is-scrolled", window.scrollY > 20);
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
})();


/* 5. Quote list feedback: button pop + counter bounce */
(function () {
  "use strict";
  function restart(el, cls) {
    el.classList.remove(cls);
    void el.offsetWidth;            // force reflow so the animation can replay
    el.classList.add(cls);
  }

  // Pop the button that was tapped (works in the product dialog too)
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-add]");
    if (btn) restart(btn, "pop");
  });

  // Bounce the header counter only when the number actually changes
  document.querySelectorAll("[data-list-count]").forEach(function (el) {
    var last = el.textContent;
    new MutationObserver(function () {
      if (el.textContent === last) return;
      last = el.textContent;
      restart(el, "bump");
    }).observe(el, { childList: true, characterData: true, subtree: true });
  });
})();