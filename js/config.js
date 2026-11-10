/* Company details — edit here; the whole site reads from this file. */
window.ASHLAND_CONFIG = {
  companyName: "Ashland Concrete Systems Limited",
  phoneDisplay: "0769 872 363",
  phoneTel: "+254769872363", // used for tel: links
  whatsappNumber: "254769872363", // international format, digits only, no "+"
  locationLine: "Murang'a Industrial Park, Makenji, Thika, Kenya",
  postalLine: "P.O. Box 7256, Thika, Kenya",
  postalCode: "01000",
  addressLocality: "Murang'a", // used in structured data; keep in step with your postal/physical address wording
  mapQuery: "Murang'a Industrial Park, Makenji, Thika, Kenya", // used only until a verified pin is set below

  /* --- Production domain: set once the real domain is live, e.g. "https://www.yourdomain.co.ke" (no trailing slash).
         Canonical tags, social-sharing tags, structured data, sitemap.xml and robots.txt all follow this. --- */
  siteUrl: "",

  /* --- Verified yard pin (Murang'a Industrial Park, Makenji). Fill these from Google Maps:
         open the gate location, press and hold to drop a pin, copy the two numbers (e.g. -0.7123, 37.1456). --- */
  geo: { lat: null, lng: null },
  mapShareUrl: "", // optional: the Google Maps "Share" link of the same pin
  mapEmbedUrl: "", // optional: Google Maps > Share > Embed a map > copy the src="..." address only

  /* --- Areas served (used in structured data). Taken from the PM brief: delete any you do not actually serve. --- */
  serviceAreas: ["Murang'a", "Thika", "Kenol", "Nairobi"],

  /* --- About page proof points. Only non-empty items are published, so fill in ONLY what you can back up with
         documents (e.g. a KEBS permit number, laboratory strength results). Leave "" to hide. --- */
  about: {
    equipment: "Production uses hydraulic and vibration block-making machines with batching and pan-mixing equipment.",
    standards: "", // e.g. "Products manufactured to KS ... (KEBS permit no. ...)" — only with proof
    strength: "", // e.g. "Compressive strength: ... MPa (test report ...)" — only with proof
    reach: "Supplying customers across Central Kenya and Nairobi."
  },

  /* --- Careers --- */
  careers: {
    applicationDeadline: "", // e.g. "30 November 2026" — shown only when filled
    interviewInfo: "", // e.g. "Tuesdays, 9:00 am to 12:00 noon at the factory gate office" — shown only when filled
    onlinePreRegistration: true // true = try the online form first (needs leadCapture); false = WhatsApp only
  },

  /* --- Lead capture backend (/api/lead -> Zoho CRM). Keep false until the server settings in README are done,
         because switching it on changes the wording about how details are stored. --- */
  leadCapture: false
};
