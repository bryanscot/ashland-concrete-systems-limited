# 0002. Static site hosted on Vercel

- **Status:** Accepted, with an open question about the plan (recorded 2026-11-12)
- **Where in the code:** no Vercel settings are stored in the repository (no `vercel.json`); `api/lead.js` is the only server code

## Context
The site is plain files that need no runtime. A free, fast, automatic deployment from GitHub suited the build stage. The preview address is `ashland-concrete-systems-limited.vercel.app`.

## Decision
Host the static files on Vercel, deployed from the `main` branch. Keep the optional lead handler as a Vercel serverless function in `api/`. A Cloudflare Pages copy of the function exists in `functions/api/` in case the host changes.

## Consequences
- Pushing to GitHub publishes the site; rollback is one click ([runbook](../runbook.md)).
- Vercel's free Hobby plan is for personal, non-commercial use, so a business site needs a paid plan or a different host. Open item, TODO(owner).
- Project settings (build settings, domains, environment variables) live in the Vercel dashboard, not in Git, so they must be documented and protected by a second administrator.
- Switching host later is feasible because nothing depends on Vercel-specific features, apart from the function wrapper in `api/lead.js`.