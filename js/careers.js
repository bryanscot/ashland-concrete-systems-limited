/* Careers page: pre-registration form. Uses /api/lead when lead capture is switched on, otherwise (or if it fails) WhatsApp. */
(function () {
  "use strict";
  var C = window.ASHLAND_CONFIG, WA = window.AshlandWA;
  var form = document.getElementById("career-form");
  if (!form) return;
  var result = document.getElementById("career-result"), sel = document.getElementById("cf-role");
  var online = !!(C.leadCapture && (!C.careers || C.careers.onlinePreRegistration !== false));
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };

  function pickRole(ref) {
    if (!ref) return;
    for (var i = 0; i < sel.options.length; i++) if (sel.options[i].value === ref) { sel.selectedIndex = i; return; }
  }
  // Preselect from ?role=REF or from a "Pre-register for this role" button
  pickRole(new URLSearchParams(location.search).get("role"));
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-apply-role]");
    if (!b) return;
    pickRole(b.getAttribute("data-apply-role"));
    var target = document.getElementById("pre-register");
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: "smooth", block: "start" }); setTimeout(function () { form.querySelector("#cf-name").focus({ preventScroll: true }); }, 500); }
  });

  function err(id, msg) {
    var el = document.getElementById("e-" + id), input = document.getElementById("cf-" + id);
    el.textContent = msg || ""; el.hidden = !msg;
    if (input) input.setAttribute("aria-invalid", msg ? "true" : "false");
    return !msg;
  }
  function validate(focus) {
    var ok = true, first = null;
    function check(cond, id, msg) { var v = err(id, cond ? "" : msg); if (!v && !first) first = document.getElementById("cf-" + id); ok = ok && v; }
    var digits = form.phone.value.replace(/\D/g, "");
    check(form.name.value.trim().length >= 2, "name", "Please enter your full name.");
    check(/^[+\d\s()-]+$/.test(form.phone.value.trim()) && digits.length >= 9 && digits.length <= 15, "phone", "Please enter a valid phone number, e.g. 0712 345 678.");
    check(!!sel.value, "role", "Please choose a vacancy.");
    check(form.consent.checked, "consent", "Please tick the box to agree.");
    if (first && focus) first.focus();
    return ok;
  }

  function data() {
    var opt = sel.options[sel.selectedIndex];
    return { type: "career", name: form.name.value.trim(), phone: form.phone.value.trim(), ref: sel.value, role: opt.getAttribute("data-title") || opt.text,
      experience: form.experience.value, notes: form.notes.value.trim(), website: form.website ? form.website.value : "" };
  }
  function message(d) {
    var lines = ["Hello " + C.companyName + ", I would like to pre-register my interest in this vacancy:", "",
      "Position: " + d.role + " (Ref " + d.ref + ")", "Name: " + d.name, "Phone: " + d.phone];
    if (d.experience) lines.push("Experience: " + d.experience);
    if (d.notes) lines.push("Skills / notes: " + d.notes);
    return lines.join("\n");
  }
  function docs() { var el = document.getElementById("docs-list"); return el ? '<h3>When invited, bring:</h3><ul>' + el.innerHTML + "</ul>" : ""; }
  function show(html) { result.hidden = false; result.innerHTML = html; result.focus(); }
  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).catch(function () {});
  }
  function waPanel(d, intro) {
    var msg = message(d);
    show(intro + '<pre class="msg-preview">' + esc(msg) + '</pre><div class="dlg-actions">' +
      '<a class="btn btn-wa" target="_blank" rel="noopener" href="' + WA.whatsappLink(msg) + '">Open WhatsApp</a>' +
      '<button class="btn btn-ghost-dark" type="button" id="copy-career">Copy message</button>' +
      '<a class="btn btn-ghost-dark" href="tel:' + C.phoneTel + '">Call ' + esc(C.phoneDisplay) + '</a></div>' + docs());
    document.getElementById("copy-career").addEventListener("click", function () { copy(msg); this.textContent = "Copied"; });
    return msg;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validate(true)) return;
    var d = data();
    if (d.website) { show("<p><strong>Thank you.</strong></p>"); return; }   // honeypot filled: do nothing
    var btn = form.querySelector("button[type=submit]");

    if (!online) {                                                              // WhatsApp-only mode
      var msg = waPanel(d, "<p><strong>Your message is ready — it has not been sent yet.</strong></p><p>WhatsApp should open in a new tab. Press <em>Send</em> there to complete your pre-registration.</p>");
      window.open(WA.whatsappLink(msg), "_blank", "noopener");
      return;
    }
    btn.disabled = true; btn.textContent = "Sending…";
    var ctl = window.AbortController ? new AbortController() : null, timer = setTimeout(function () { if (ctl) ctl.abort(); }, 8000);
    fetch("/api/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d), signal: ctl ? ctl.signal : undefined })
      .then(function (r) { return r.json().then(function (j) { return r.ok && j.ok; }); })
      .catch(function () { return false; })
      .then(function (ok) {
        clearTimeout(timer); btn.disabled = false; btn.textContent = "Submit pre-registration";
        if (ok) {
          var info = C.careers && C.careers.interviewInfo ? "<p><strong>Interviews:</strong> " + esc(C.careers.interviewInfo) + "</p>" : "<p>Only shortlisted candidates will be contacted and invited for interview.</p>";
          show("<p><strong>Thank you, " + esc(d.name.split(" ")[0]) + ". Your pre-registration for " + esc(d.role) + " has been received.</strong></p>" + info +
            "<p>This does not replace the on-site process below.</p>" + docs());
          form.reset(); pickRole(d.ref);
        } else {
          waPanel(d, "<p><strong>We could not submit your details online.</strong></p><p>Please send them to us on WhatsApp instead. Nothing has been sent yet.</p>");
        }
      });
  });
  ["name", "phone"].forEach(function (k) { form[k].addEventListener("input", function () { if (form[k].getAttribute("aria-invalid") === "true") validate(false); }); });
})();
