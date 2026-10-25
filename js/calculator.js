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

      // Custom dropdown (replaces the phone's plain native picker). The real <select> stays hidden underneath.
  function makeCombo(select) {
    var combo = document.createElement("div"); combo.className = "combo";
    select.parentNode.insertBefore(combo, select);
    var btn = document.createElement("button");
    btn.type = "button"; btn.className = "combo-btn"; btn.id = select.id + "-btn";
    btn.setAttribute("role", "combobox"); btn.setAttribute("aria-haspopup", "listbox");
    btn.setAttribute("aria-expanded", "false"); btn.setAttribute("aria-controls", select.id + "-list");
    var label = document.createElement("span"); label.className = "combo-label"; btn.appendChild(label);
    var list = document.createElement("ul"); list.className = "combo-list"; list.id = select.id + "-list";
    list.setAttribute("role", "listbox"); list.hidden = true;
    combo.appendChild(btn); combo.appendChild(list); combo.appendChild(select);
    select.hidden = true; select.setAttribute("aria-hidden", "true"); select.tabIndex = -1;
    var lab = document.querySelector('label[for="' + select.id + '"]'); if (lab) lab.setAttribute("for", btn.id);

    var items = [], active = 0;
    function addOption(o) {
      var li = document.createElement("li"); li.setAttribute("role", "option");
      li.id = select.id + "-opt-" + items.length; li.setAttribute("aria-selected", "false");
      var m = o.text.match(/^(.*?) \((.*)\)$/);
      var name = document.createElement("span"); name.className = "opt-name"; name.textContent = m ? m[1] : o.text; li.appendChild(name);
      if (m) { var dm = document.createElement("span"); dm.className = "opt-dims"; dm.textContent = m[2]; li.appendChild(dm); }
      var idx = items.length;
      li.addEventListener("click", function () { choose(idx); });
      list.appendChild(li); items.push({ li: li, value: o.value, text: o.text });
    }
    Array.prototype.forEach.call(select.children, function (node) {
      if (node.tagName === "OPTGROUP") {
        var g = document.createElement("li"); g.className = "opt-group"; g.setAttribute("role", "presentation"); g.textContent = node.label; list.appendChild(g);
        Array.prototype.forEach.call(node.children, addOption);
      } else addOption(node);
    });

    function current() { var i = items.findIndex(function (it) { return it.value === select.value; }); return i < 0 ? 0 : i; }
    function sync() {
      var i = current(); label.textContent = items[i].text; btn.classList.add("has-value");
      items.forEach(function (it, j) { it.li.setAttribute("aria-selected", String(j === i)); });
    }
    function setActive(i) {
      active = Math.max(0, Math.min(items.length - 1, i));
      items.forEach(function (it, j) { it.li.classList.toggle("is-active", j === active); });
      btn.setAttribute("aria-activedescendant", items[active].li.id);
      items[active].li.scrollIntoView({ block: "nearest" });
    }
    function isOpen() { return btn.getAttribute("aria-expanded") === "true"; }
    function open() { list.hidden = false; btn.setAttribute("aria-expanded", "true"); setActive(current()); }
    function close() { list.hidden = true; btn.setAttribute("aria-expanded", "false"); btn.removeAttribute("aria-activedescendant"); }
    function choose(i) {
      select.value = items[i].value; select.dispatchEvent(new Event("change", { bubbles: true }));
      sync(); close(); btn.focus();
    }
    btn.addEventListener("click", function () { isOpen() ? close() : open(); });
    btn.addEventListener("keydown", function (e) {
      switch (e.key) {
        case "ArrowDown": e.preventDefault(); isOpen() ? setActive(active + 1) : open(); break;
        case "ArrowUp": e.preventDefault(); isOpen() ? setActive(active - 1) : open(); break;
        case "Home": if (isOpen()) { e.preventDefault(); setActive(0); } break;
        case "End": if (isOpen()) { e.preventDefault(); setActive(items.length - 1); } break;
        case "Enter": case " ": e.preventDefault(); isOpen() ? choose(active) : open(); break;
        case "Escape": if (isOpen()) { e.preventDefault(); close(); } break;
        case "Tab": if (isOpen()) close(); break;
      }
    });
    document.addEventListener("click", function (e) { if (!combo.contains(e.target)) close(); });
    select.addEventListener("change", sync);
    sync();
  }

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

      makeCombo(sel);

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
