(function () {
  "use strict";
  var P = window.ASHLAND_PRODUCTS,
    CATS = window.ASHLAND_CATEGORIES,
    WA = window.AshlandWA;
  var $ = function (id) {
    return document.getElementById(id);
  };
  var form = $("calc"),
    sel = $("c-product"),
    out = $("c-result");

  // product list grouped by category
  sel.innerHTML = CATS.filter(function (c) {
    return c.id !== "all";
  })
    .map(function (c) {
      var items = P.filter(function (p) {
        return p.category === c.id;
      });
      return items.length
        ? '<optgroup label="' +
            c.label +
            '">' +
            items
              .map(function (p) {
                return (
                  '<option value="' +
                  p.id +
                  '">' +
                  WA.productLabel(p) +
                  "</option>"
                );
              })
              .join("") +
            "</optgroup>"
        : "";
    })
    .join("");
  var q = new URLSearchParams(location.search).get("product");
  if (
    q &&
    P.some(function (p) {
      return p.id === q;
    })
  )
    sel.value = q;

  function product() {
    return P.find(function (p) {
      return p.id === sel.value;
    });
  }
  function mode(p) {
    return p.category === "blocks"
      ? "wall"
      : p.category === "kerbs"
        ? "run"
        : "area";
  }
  function syncMode() {
    var m = mode(product());
    form.querySelectorAll("[data-mode]").forEach(function (el) {
      el.hidden = el.dataset.mode !== m;
    });
    out.innerHTML = '<p class="muted">Your estimate will appear here.</p>';
  }
  sel.addEventListener("change", syncMode);
  syncMode();

  var n = function (id) {
    var v = parseFloat($(id).value);
    return isNaN(v) ? 0 : v;
  };
  function fmt(x) {
    return x.toLocaleString("en-KE", { maximumFractionDigits: 2 });
  }
  function error(msg) {
    out.innerHTML = '<p class="error">' + msg + "</p>";
    out.focus();
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var p = product(),
      m = mode(p),
      d = p.dims,
      qty,
      unit,
      unitText,
      basisText;
    var allow = Math.min(Math.max(n("c-allow"), 0), 30);
    if (m === "area") {
      qty = n("c-area") > 0 ? n("c-area") : n("c-len") * n("c-wid");
      if (!(qty > 0))
        return error(
          "Please enter the total area, or both length and width, in metres.",
        );
      unit = (d.l / 1000) * (d.w / 1000);
      unitText =
        "each piece covers about " +
        unit.toFixed(4) +
        " m² (" +
        d.l +
        " × " +
        d.w +
        " mm)";
      basisText = fmt(qty) + " m² of paving";
    } else if (m === "wall") {
      qty = n("c-wlen") * n("c-wht") - n("c-open");
      if (!(qty > 0))
        return error(
          "Please enter the wall length and height in metres (openings must be smaller than the wall).",
        );
      unit = (d.l / 1000) * (d.h / 1000);
      unitText =
        "each block covers about " +
        unit.toFixed(4) +
        " m² of wall face (" +
        d.l +
        " × " +
        d.h +
        " mm)";
      basisText = fmt(qty) + " m² of wall";
    } else {
      qty = n("c-run");
      if (!(qty > 0))
        return error("Please enter the kerb run length in metres.");
      unit = d.l / 1000;
      unitText = "each kerb is " + unit + " m long";
      basisText = fmt(qty) + " m of kerb";
    }
    var net = Math.ceil(qty / unit),
      total = Math.ceil((qty / unit) * (1 + allow / 100));
    var msg =
      "Hello " +
      window.ASHLAND_CONFIG.companyName +
      ", I would like a quotation for " +
      WA.productLabel(p) +
      ". My estimate is about " +
      fmt(total) +
      " pieces for " +
      basisText +
      " (including a " +
      allow +
      "% allowance). Kindly provide your current price and availability.";
    out.innerHTML =
      '<p class="big">About <strong>' +
      fmt(total) +
      "</strong> pieces</p>" +
      "<p>" +
      WA.productLabel(p) +
      " for " +
      basisText +
      ".</p>" +
      '<ul class="muted"><li>Exact fit: ' +
      fmt(net) +
      " pieces</li><li>Allowance (" +
      allow +
      "%): " +
      fmt(total - net) +
      " pieces</li><li>" +
      unitText +
      "</li></ul>" +
      '<p class="small muted">Estimate only. Please confirm the final quantity with us.</p>' +
      '<a class="btn btn-wa" target="_blank" rel="noopener" href="' +
      WA.whatsappLink(msg) +
      '">Send this estimate on WhatsApp</a>';
    out.focus();
  });
})();
