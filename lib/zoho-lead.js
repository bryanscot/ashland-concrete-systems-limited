/* Shared lead handler used by api/lead.js (Vercel) and functions/api/lead.js (Cloudflare Pages).
   Receives a quote enquiry or a careers pre-registration and creates a Lead in Zoho CRM.
   Secrets come from environment variables on the host; nothing secret is ever in the website files.

   Required env:  ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN
   Optional env:  ZOHO_ACCOUNTS_URL (default https://accounts.zoho.com; use .eu/.in/... for your region)
                  SITE_ORIGINS (comma-separated allowed website origins, e.g. https://www.yourdomain.co.ke)
                  ZOHO_LEAD_SOURCE (default "Website"), ZOHO_CAREER_SOURCE (default "Careers")
                  ZOHO_FIELD_MAP (JSON, optional custom fields, e.g. {"product":"Product_of_Interest","quantity":"Quantity_Required","location":"Project_Location"}) */
let cache = { token: "", apiDomain: "", exp: 0 };

const clean = (v, n, keepNewlines) =>
  String(v == null ? "" : v).replace(keepNewlines ? /[\u0000-\u0009\u000b-\u001f]/g : /[\u0000-\u001f]/g, " ").trim().slice(0, n);

async function getToken(env) {
  if (cache.token && Date.now() < cache.exp) return cache;
  const url = (env.ZOHO_ACCOUNTS_URL || "https://accounts.zoho.com") + "/oauth/v2/token?" +
    new URLSearchParams({ refresh_token: env.ZOHO_REFRESH_TOKEN, client_id: env.ZOHO_CLIENT_ID, client_secret: env.ZOHO_CLIENT_SECRET, grant_type: "refresh_token" });
  const j = await (await fetch(url, { method: "POST" })).json();
  if (!j.access_token) throw new Error("Zoho token error: " + (j.error || JSON.stringify(j)));
  cache = { token: j.access_token, apiDomain: j.api_domain || "https://www.zohoapis.com", exp: Date.now() + 50 * 60 * 1000 };
  return cache;
}

function buildLead(b, env) {
  const name = clean(b.name, 80);
  const [first, ...rest] = name.split(/\s+/);
  const lead = { Last_Name: rest.length ? rest.join(" ") : first, Phone: clean(b.phone, 25) };
  if (rest.length) lead.First_Name = first;
  let map = {};
  try { map = env.ZOHO_FIELD_MAP ? JSON.parse(env.ZOHO_FIELD_MAP) : {}; } catch (e) { map = {}; }

  if (b.type === "career") {
    lead.Lead_Source = env.ZOHO_CAREER_SOURCE || "Careers";
    lead.Description = clean([
      "JOB PRE-REGISTRATION",
      "Role: " + clean(b.role, 120) + (b.ref ? " (Ref " + clean(b.ref, 30) + ")" : ""),
      "Experience: " + clean(b.experience, 60),
      b.notes ? "Skills / notes: " + clean(b.notes, 600, true) : ""
    ].filter(Boolean).join("\n"), 1500, true);
  } else {
    lead.Lead_Source = env.ZOHO_LEAD_SOURCE || "Website";
    const lines = [];
    ["product", "quantity", "location"].forEach(function (k) {
      const v = clean(b[k], 120);
      if (!v) return;
      if (map[k]) lead[map[k]] = v; else lines.push({ product: "Product", quantity: "Quantity", location: "Project location" }[k] + ": " + v);
    });
    if (b.message) lines.push("Message: " + clean(b.message, 600, true));
    if (b.items) lines.push("Quote list: " + clean(b.items, 600));
    lead.Description = clean(["WEBSITE QUOTATION ENQUIRY"].concat(lines).join("\n"), 1500, true);
  }
  return lead;
}

/* Returns { status, body } — the host wrappers turn it into a response */
async function handleLead(b, env, origin) {
  if (!env.ZOHO_CLIENT_ID || !env.ZOHO_CLIENT_SECRET || !env.ZOHO_REFRESH_TOKEN) return { status: 503, body: { ok: false, error: "not_configured" } };
  const allowed = (env.SITE_ORIGINS || "").split(",").map(function (s) { return s.trim(); }).filter(Boolean);
  if (allowed.length && allowed.indexOf(origin || "") === -1) return { status: 403, body: { ok: false } };
  if (!b || typeof b !== "object") return { status: 400, body: { ok: false } };
  if (b.website) return { status: 200, body: { ok: true } };            // honeypot filled: pretend success, save nothing
  if (clean(b.name, 80).length < 2 || clean(b.phone, 25).replace(/\D/g, "").length < 9) return { status: 400, body: { ok: false, error: "invalid" } };
  if (b.type === "career" && !clean(b.role, 120)) return { status: 400, body: { ok: false, error: "invalid" } };
  try {
    const t = await getToken(env);
    const r = await fetch(t.apiDomain + "/crm/v8/Leads", {
      method: "POST",
      headers: { Authorization: "Zoho-oauthtoken " + t.token, "Content-Type": "application/json" },
      body: JSON.stringify({ data: [buildLead(b, env)], trigger: ["workflow"] })
    });
    const j = await r.json();
    const item = j.data && j.data[0];
    if (!r.ok || !item || item.status !== "success") {
      console.error("Zoho rejected the lead:", r.status, JSON.stringify(j).slice(0, 400));
      return { status: 502, body: { ok: false } };
    }
    return { status: 200, body: { ok: true } };
  } catch (e) {
    console.error("Lead error:", e.message);
    return { status: 502, body: { ok: false } };
  }
}

module.exports = { handleLead, buildLead };
