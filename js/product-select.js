/* Custom product dropdown. Mirrors the hidden <select id="f-product">,
   so the rest of the site keeps reading sel.value as before. */
(function () {
  "use strict";
  const sel = document.getElementById("f-product");
  const btn = document.getElementById("f-product-btn");
  const list = document.getElementById("product-listbox");
  const combo = document.getElementById("product-combo");
  if (!sel || !btn || !list || !combo) return;

  const opts = Array.from(sel.options);
  const label = btn.querySelector(".combo-label");
  let active = 0;

  // Build the options: product name on one line, dimensions on the next
  opts.forEach(function (o, i) {
    const li = document.createElement("li");
    li.setAttribute("role", "option");
    li.id = "opt-" + i;
    li.setAttribute("aria-selected", "false");
    const m = o.text.match(/^(.*?) \((.*)\)$/);
    const name = document.createElement("span");
    name.className = "opt-name";
    name.textContent = m ? m[1] : o.text;
    li.appendChild(name);
    if (m) {
      const dims = document.createElement("span");
      dims.className = "opt-dims";
      dims.textContent = m[2];
      li.appendChild(dims);
    }
    li.addEventListener("click", function () {
      choose(i);
    });
    list.appendChild(li);
  });
  const items = Array.from(list.children);

  function selectedIndex() {
    const i = opts.findIndex(function (o) {
      return o.value === sel.value;
    });
    return i < 0 ? 0 : i;
  }
  function sync() {
    const i = selectedIndex();
    label.textContent = opts[i].text;
    btn.classList.toggle("has-value", sel.value !== "");
    items.forEach(function (li, j) {
      li.setAttribute("aria-selected", String(j === i));
    });
  }
  function setActive(i) {
    active = Math.max(0, Math.min(items.length - 1, i));
    items.forEach(function (li, j) {
      li.classList.toggle("is-active", j === active);
    });
    btn.setAttribute("aria-activedescendant", items[active].id);
    items[active].scrollIntoView({ block: "nearest" });
  }
  function isOpen() {
    return btn.getAttribute("aria-expanded") === "true";
  }
  function open() {
    list.hidden = false;
    btn.setAttribute("aria-expanded", "true");
    setActive(selectedIndex());
  }
  function close() {
    list.hidden = true;
    btn.setAttribute("aria-expanded", "false");
    btn.removeAttribute("aria-activedescendant");
  }
  function choose(i) {
    sel.value = opts[i].value;
    sel.dispatchEvent(new Event("change", { bubbles: true }));
    sync();
    close();
    btn.focus();
  }

  btn.addEventListener("click", function () {
    isOpen() ? close() : open();
  });
  btn.addEventListener("keydown", function (e) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        isOpen() ? setActive(active + 1) : open();
        break;
      case "ArrowUp":
        e.preventDefault();
        isOpen() ? setActive(active - 1) : open();
        break;
      case "Home":
        if (isOpen()) {
          e.preventDefault();
          setActive(0);
        }
        break;
      case "End":
        if (isOpen()) {
          e.preventDefault();
          setActive(items.length - 1);
        }
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        isOpen() ? choose(active) : open();
        break;
      case "Escape":
        if (isOpen()) {
          e.preventDefault();
          close();
        }
        break;
      case "Tab":
        if (isOpen()) close();
        break;
    }
  });
  document.addEventListener("click", function (e) {
    if (!combo.contains(e.target)) close();
  });

  sync(); // picks up any preselected product, e.g. from the URL hash
})();
