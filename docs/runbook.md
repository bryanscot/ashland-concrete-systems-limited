# Runbook

For whoever keeps the site running. No passwords or secrets belong in this file.

## 1. How the system fits together

```
GitHub repository (main)  --push-->  GitHub Actions (rebuild pages + PDF, commit back)
        |                                         |
        +------------------ Vercel (publishes main) <---------+
                                |
                         Visitors (browser)  -->  WhatsApp (wa.me)
                                |
                  optional: POST /api/lead  -->  Zoho CRM (off by default)
```

There is no database and no server of ours. WhatsApp links work even when the website is down.

## 2. Vercel project

| Item | Value |
|---|---|
| Project / preview address | `ashland-concrete-systems-limited` / https://ashland-concrete-systems-limited.vercel.app |
| Type | Static files, plus one optional serverless function (`api/lead.js`) |
| Build settings | Typically Framework "Other", no build command, output = project root. TODO(owner): confirm under Settings > Build & Development |
| Production branch | `main` (TODO(owner): confirm under Settings > Git) |
| Plan | TODO(owner): confirm. Vercel's free Hobby plan is limited to personal, non-commercial use; a business site needs a paid plan or another host |
| Environment variables | Only needed when lead capture is switched on (section 7). Names only, values live in Vercel |

## 3. Deploying

1. Push to `main` (or use the GitHub web editor, see [content-guide.md](content-guide.md)).
2. If product, company, vacancy, image or tool files changed, the workflow **Build catalogue PDF and pages** runs (GitHub > Actions) and commits regenerated files. A second deployment follows that commit.
3. Vercel > Project > Deployments: the newest deployment should show **Ready**.
4. Check the live site: home page loads, `/products/uni-80/`, `/careers/`, the PDF download, one WhatsApp button.
5. Before your next push run `git pull`.

If the workflow fails (red cross in Actions): open the failed step. A missing image path in `js/products.js` is the usual cause; the message names the file.

## 4. Rollback

**Fastest (Vercel):** Project > Deployments > find the last good **production** deployment > menu > **Instant Rollback**. The menu wording can change; on the Hobby plan Vercel may only allow rolling back to the previous production deployment. After a rollback, new pushes do not go live until you undo the rollback or promote a new deployment (Vercel shows a banner).

**Permanent fix (Git):** find the bad commit under GitHub > Commits, click **Revert**, and merge. The workflow rebuilds the generated files and Vercel redeploys. Run `git pull` afterwards.

## 5. Domain, DNS and SSL

No custom domain is attached yet (TODO(owner)). When it is, copy the exact values Vercel shows under Project > Settings > Domains for each domain, instead of typing them from memory. Typical records:

| Type | Name | Value | Purpose |
|---|---|---|---|
| A | `@` (apex, e.g. `example.co.ke`) | The IP address shown on the Vercel domain card (historically `76.76.21.21`) | Points the bare domain at the site |
| CNAME | `www` | The target shown on the Vercel domain card (historically `cname.vercel-dns.com`) | Points `www` at the site |
| TXT | `@` | Value given by Google Search Console | Proves you own the domain to Google |
| MX, TXT (SPF, DKIM, DMARC) | `@` and provider names | From your email provider | Business email. TODO(owner): choose a provider |
| CAA (optional) | `@` | Only if your registrar/security policy needs it | Restricts who may issue certificates; if used it must allow Vercel's certificate authority |

Remove old A, AAAA or CNAME records for the same name that point elsewhere. Alternatively you can delegate the whole domain to Vercel's nameservers, shown on the same page.

**SSL:** Vercel issues and renews the certificate automatically once DNS points at it. Certificate errors usually mean stale DNS records or DNS that has not finished updating; wait, then check records, then remove and re-add the domain in Vercel.

Choose one main address (`www` or the bare domain) and set the other to redirect to it in Vercel > Domains.

## 6. If something goes wrong

**Site is down or showing errors**
1. Is it just you? Try another network and device. WhatsApp and phone still work for customers.
2. Check Vercel's status page and Vercel > Deployments for a failed or errored latest deployment.
3. If a deployment broke it: roll back (section 4).
4. If the page shows a domain error: check DNS records and that the domain has not expired (below).
5. Check GitHub > Actions for a red workflow that blocked updated files.

**Domain expired or about to**
1. Log in to the registrar (TODO(owner)) and renew immediately. Renewal rules and any grace period depend on the registrar and the registry, so contact the registrar if it has already lapsed.
2. Turn on auto-renew, keep a valid payment method, and make sure the registrar contact email is a mailbox the company controls.
3. Calendar reminders at 60, 30 and 7 days before expiry.
4. Until the domain works again, share the `vercel.app` preview address and the WhatsApp number.

## 7. Lead capture settings (optional, off by default)

Switching on needs these names set as Vercel environment variables, then `leadCapture: true` in `js/config.js`: `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN` (required), `ZOHO_ACCOUNTS_URL`, `SITE_ORIGINS`, `ZOHO_LEAD_SOURCE`, `ZOHO_CAREER_SOURCE`, `ZOHO_FIELD_MAP` (optional). Details are in `lib/zoho-lead.js` and [decisions/0006](decisions/0006-optional-zoho-lead-capture.md). Never store the values in the repository.

## 8. Accounts that should exist

Each should use a company-controlled email address, two-factor authentication, and at least two administrators.

| Account | Purpose | Owner |
|---|---|---|
| GitHub (repository `bryanscot/ashland-concrete-systems-limited`) | Source code, workflow | TODO(owner) (currently a personal account: move to a company organisation) |
| Vercel | Hosting and deployments | TODO(owner) |
| Domain registrar | Domain registration and renewal | TODO(owner) |
| DNS provider (if different from the registrar) | DNS records | TODO(owner) |
| Business email provider | Company email addresses | TODO(owner) |
| Google Search Console | Search performance, sitemap | TODO(owner) |
| Bing Webmaster Tools | Bing search performance, sitemap | TODO(owner) |
| Google Business Profile | Google Maps and local search listing | TODO(owner) |
| Analytics (none is installed yet) | Visits and enquiries | TODO(owner) |
| WhatsApp / WhatsApp Business number | Receives all quotation messages | TODO(owner) |
| Zoho CRM (only if lead capture is enabled) | Lead records | TODO(owner) |

## 9. Routine checks

Monthly: [seo-launch-checklist.md](seo-launch-checklist.md), section "Monthly maintenance".