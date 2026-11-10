/* Vercel Serverless Function: POST /api/lead */
const { handleLead } = require("../lib/zoho-lead.js");

module.exports = async (req, res) => {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ ok: false }); }
  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = null; } }
  const out = await handleLead(body, process.env, req.headers.origin);
  return res.status(out.status).json(out.body);
};
