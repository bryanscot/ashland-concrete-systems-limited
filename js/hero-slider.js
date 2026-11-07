/* Home-page hero slideshow: crossfade, arrows, dots, swipe, pause. Dimensions come from products.js. */
(function () {
  "use strict";
  var root = document.getElementById("hero-slider");
  if (!root) return;
  var slides = Array.prototype.slice.call(root.querySelectorAll(".hs-slide"));
  if (slides.length < 2) return;

  var stage = root.querySelector(".hs-stage"),
    tag = root.querySelector(".hs-tag"),
    strip = root.querySelector(".dim-strip");
  var dotsBox = root.querySelector(".hs-dots"),
    pauseBtn = root.querySelector(".hs-pause");
  var PRODUCTS = window.cm_PRODUCTS || [];
  var DELAY = 3000,
    current = 0,
    timer = null,
    userPaused = false,
    hovering = false,
    visible = true;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Load the other images after the page has loaded, so the first image stays fast
  function loadRest() {
    slides.forEach(function (s) {
      var im = s.querySelector("img[data-src]");
      if (im) {
        im.src = im.getAttribute("data-src");
        im.removeAttribute("data-src");
      }
    });
  }
  if (document.readyState === "complete") loadRest();
  else window.addEventListener("load", loadRest);

  var dots = slides.map(function (s, k) {
    s.setAttribute("role", "group");
    s.setAttribute("aria-roledescription", "slide");
    s.setAttribute("aria-label", k + 1 + " of " + slides.length);
    var b = document.createElement("button");
    b.type = "button";
    b.className = "hs-dot";
    b.setAttribute(
      "aria-label",
      "Show image " + (k + 1) + " of " + slides.length,
    );
    b.addEventListener("click", function () {
      show(k);
      restart();
    });
    dotsBox.appendChild(b);
    return b;
  });

  function productOf(slide) {
    return PRODUCTS.filter(function (p) {
      return p.id === slide.getAttribute("data-product");
    })[0];
  }

  function show(n, initial) {
    current = (n + slides.length) % slides.length;
    slides.forEach(function (s, k) {
      s.classList.toggle("is-active", k === current);
      s.setAttribute("aria-hidden", k === current ? "false" : "true");
    });
    dots.forEach(function (d, k) {
      d.setAttribute("aria-current", k === current ? "true" : "false");
    });
    if (initial) return; // first slide's tag and numbers are already in the HTML
    var p = productOf(slides[current]);
    if (p) {
      if (tag) {
        tag.href = "/products/" + p.id + "/";
        tag.firstChild.textContent = p.name + " ";
      }
      if (strip) {
        var b = strip.querySelectorAll("b");
        if (b.length === 3) {
          b[0].textContent = p.dims.l;
          b[1].textContent = p.dims.w;
          b[2].textContent = p.dims.h;
        }
        strip.setAttribute("aria-label", p.name + " dimensions");
      }
    }
  }

  function next() {
    show(current + 1);
  }
  function prev() {
    show(current - 1);
  }
  function canPlay() {
    return !reduce && !userPaused && !hovering && visible && !document.hidden;
  }
  function stop() {
    clearInterval(timer);
    timer = null;
    stage.setAttribute("aria-live", "polite");
  }
  function start() {
    stop();
    if (canPlay()) {
      stage.setAttribute("aria-live", "off");
      timer = setInterval(next, DELAY);
    }
  }
  function restart() {
    start();
  }

  root.querySelector(".hs-next").addEventListener("click", function () {
    next();
    restart();
  });
  root.querySelector(".hs-prev").addEventListener("click", function () {
    prev();
    restart();
  });

  if (reduce) {
    pauseBtn.hidden = true;
  }
  pauseBtn.addEventListener("click", function () {
    userPaused = !userPaused;
    pauseBtn.classList.toggle("is-paused", userPaused);
    pauseBtn.setAttribute(
      "aria-label",
      userPaused ? "Play slideshow" : "Pause slideshow",
    );
    start();
  });

  root.addEventListener("mouseenter", function () {
    hovering = true;
    start();
  });
  root.addEventListener("mouseleave", function () {
    hovering = false;
    start();
  });
  root.addEventListener("focusin", function () {
    hovering = true;
    start();
  });
  root.addEventListener("focusout", function () {
    hovering = false;
    start();
  });
  document.addEventListener("visibilitychange", start);
  if ("IntersectionObserver" in window)
    new IntersectionObserver(
      function (e) {
        visible = e[0].isIntersecting;
        start();
      },
      { threshold: 0.25 },
    ).observe(root);

  root.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") {
      next();
      restart();
    } else if (e.key === "ArrowLeft") {
      prev();
      restart();
    }
  });
  var x0 = null; // swipe on touch screens
  stage.addEventListener(
    "touchstart",
    function (e) {
      x0 = e.touches[0].clientX;
    },
    { passive: true },
  );
  stage.addEventListener(
    "touchend",
    function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      x0 = null;
      if (Math.abs(dx) > 40) {
        dx < 0 ? next() : prev();
        restart();
      }
    },
    { passive: true },
  );

  show(0, true);
  start();
})();
