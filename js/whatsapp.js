/* Reusable WhatsApp helpers. Nothing is sent automatically:
   the customer must press Send inside WhatsApp. */
(function () {
  const C = window.ASHLAND_CONFIG;

  function formatDims(p) {
    return p.dims.l + " × " + p.dims.w + " × " + p.dims.h + " mm";
  }
  function productLabel(p) {
    return p.name + " (" + formatDims(p) + ")";
  }
  function whatsappLink(message) {
    return "https://wa.me/" + C.whatsappNumber + "?text=" + encodeURIComponent(message);
  }
  const greeting = "Hello " + C.companyName + ", ";

  function generalMessage() {
    return greeting + "I would like to enquire about your concrete products and request a quotation.";
  }
  function productMessage(p) {
    return greeting + "I am interested in " + productLabel(p) +
      ". Kindly provide your current price, availability, and quotation details.";
  }
  function multiProductMessage(items) {
    // items: [{ product, quantity }]
    const lines = items.map(function (it, i) {
      return (i + 1) + ". " + productLabel(it.product) + (it.quantity ? " — quantity: " + it.quantity : "");
    });
    return greeting + "I would like a quotation for the following products:\n" + lines.join("\n") +
      "\nKindly provide your current prices and availability.";
  }
  function formMessage(d, listItems) {
    const out = [greeting + "I would like to request a quotation.", ""];
    out.push("Name: " + d.name);
    out.push("Phone: " + d.phone);
    if (d.product) out.push("Product of interest: " + d.product);
    if (listItems && listItems.length) {
      out.push("Products on my quote list:");
      listItems.forEach(function (it, i) {
        out.push("  " + (i + 1) + ". " + productLabel(it.product) + (it.quantity ? " — quantity: " + it.quantity : ""));
      });
    }
    if (d.quantity) out.push("Quantity required: " + d.quantity);
    if (d.location) out.push("Project location: " + d.location);
    if (d.message) out.push("Additional details: " + d.message);
    return out.join("\n");
  }

  /* Map helpers: use the verified pin when coordinates exist, otherwise fall back to a text search */
  function hasPin() { const g = C.geo || {}; return typeof g.lat === "number" && typeof g.lng === "number"; }
  function mapLink() {
    if (C.mapShareUrl) return C.mapShareUrl;
    if (hasPin()) return "https://www.google.com/maps/search/?api=1&query=" + C.geo.lat + "," + C.geo.lng;
    return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(C.mapQuery);
  }
  function directionsLink() {
    return hasPin() ? "https://www.google.com/maps/dir/?api=1&destination=" + C.geo.lat + "," + C.geo.lng : "";
  }

  window.AshlandWA = { formatDims, productLabel, whatsappLink, generalMessage, productMessage, multiProductMessage, formMessage, hasPin, mapLink, directionsLink };
})();
