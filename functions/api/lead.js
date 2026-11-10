/* Cloudflare Pages Function: POST /api/lead (only used if the site is hosted on Cloudflare Pages) */
import { handleLead } from "../../lib/zoho-lead.js";

export async function onRequestPost({ request, env }) {
  let body = null;
  try { body = await request.json(); } catch (e) { /* invalid JSON */ }
  const out = await handleLead(body, env, request.headers.get("Origin"));
  return new Response(JSON.stringify(out.body), { status: out.status, headers: { "Content-Type": "application/json" } });
}
