# Deploying app.ekmgc.de — Quick Scan MVP

This app is intentionally a **static site with zero build step**. You can
deploy it anywhere that can serve files. Pick the option that matches your
current hosting for `ekmgc.de`. Recommended path: **Vercel** (30 minutes end
to end).

---

## What's in the build

```
app.ekmgc.de/
├── index.html               # Single-page app entry
├── style.css                # Brand system (navy + orange + cyan)
├── DEPLOY.md                # This file
├── vendor/
│   └── jspdf.umd.min.js     # Vendored jsPDF (no CDN dependency)
└── js/
    ├── questions.js         # 15-question bank
    ├── scoring.js           # Tier/score engine
    ├── pdf.js               # Client-side PDF generator
    ├── analytics.js         # Plausible + UTM helper
    └── app.js               # UI controller
```

No backend. No database. No build. Uploading the folder = shipping.

---

## Option 1 — Vercel (recommended)

**Why:** free, instant CDN, automatic HTTPS, one-command deploys, and DACH
edge locations. Supports custom subdomains out of the box.

### First-time setup

```bash
# One-off: install Vercel CLI
npm i -g vercel

# From the app directory
cd /Users/elshanmusayev/Documents/Claude/Projects/ekmgc-site/app.ekmgc.de
vercel
# Follow the prompts:
#   - Scope: your personal account (or EKM team)
#   - Link to existing project? No
#   - Project name: app-ekmgc-de
#   - Directory: ./ (current)
#   - Build command: (none — press Enter)
#   - Output directory: ./ (press Enter)
```

First deploy gives you a preview URL like `app-ekmgc-de-xyz.vercel.app`.

### Subsequent deploys

```bash
vercel --prod
```

### Wire the custom domain

1. In Vercel dashboard → project → **Settings → Domains → Add** → `app.ekmgc.de`.
2. Vercel will show DNS records to add. At your DNS registrar (EuroDNS based on memory):
   - **CNAME:** `app` → `cname.vercel-dns.com`
3. HTTPS certificate issues automatically in ~1 minute once DNS resolves.
4. Verify with `dig app.ekmgc.de +short`.

### Git integration (nice to have)

Push `ekmgc-site/app.ekmgc.de/` to the existing `ElshanM74/ekmgc-site` repo on
GitHub, then link the repo in Vercel. Every push to `main` auto-deploys.

---

## Option 2 — Netlify

```bash
# Install once
npm i -g netlify-cli

# Deploy
cd /Users/elshanmusayev/Documents/Claude/Projects/ekmgc-site/app.ekmgc.de
netlify deploy --prod --dir .
```

Custom domain + HTTPS works the same way as Vercel. Netlify free tier is
generous and doesn't require a credit card.

---

## Option 3 — GitHub Pages

The existing `ekmgc-site` repo is already on GitHub. To add the app as a
subfolder under the same domain (ekmgc.de/app/ instead of app.ekmgc.de):

1. Move `app.ekmgc.de/` content into `ekmgc.de/app/` (as a subdirectory).
2. Enable GitHub Pages on the repo: Settings → Pages → source: `main` branch, root.
3. Add a `CNAME` file with `ekmgc.de` inside.

**Trade-off:** no separate `app.` subdomain, and GitHub Pages has no build-time
env var support. Fine for the MVP but limits future upgrades.

---

## Option 4 — Same Hetzner server as the LinkedIn bot

If you want everything on `91.99.223.134` (the same server that hosts
partnerscope.eu based on memory), use nginx as a static server:

```nginx
# /etc/nginx/sites-available/app.ekmgc.de
server {
    listen 443 ssl http2;
    server_name app.ekmgc.de;

    root /var/www/app.ekmgc.de;
    index index.html;

    # Aggressive caching for static assets
    location ~* \.(js|css|png|jpg|svg|woff2?)$ {
        expires 7d;
        add_header Cache-Control "public, immutable";
    }

    location / {
        try_files $uri $uri/ /index.html;
    }

    # SSL managed by certbot
    ssl_certificate     /etc/letsencrypt/live/app.ekmgc.de/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.ekmgc.de/privkey.pem;
}

server {
    listen 80;
    server_name app.ekmgc.de;
    return 301 https://$host$request_uri;
}
```

Then:

```bash
# First-time
rsync -avz --delete app.ekmgc.de/ root@91.99.223.134:/var/www/app.ekmgc.de/
ssh root@91.99.223.134 '
  ln -sf /etc/nginx/sites-available/app.ekmgc.de /etc/nginx/sites-enabled/ &&
  certbot --nginx -d app.ekmgc.de --non-interactive --agree-tos -m elshan.musayev@ekmgc.de &&
  nginx -t && systemctl reload nginx
'
```

---

## Analytics setup — Plausible

The app is already wired to Plausible (see `index.html` `<script data-domain="app.ekmgc.de">`). To make it actually report data:

1. Sign up at [plausible.io](https://plausible.io) (EU-hosted, GDPR-friendly, ~EUR 9/mo).
2. Add `app.ekmgc.de` as a new site.
3. Also add `ekmgc.de` as a second site and drop the same `<script>` snippet in
   `ekmgc-site/ekmgc.de/index.html` just before `</head>`.
4. In Plausible → Settings → Goals, add these custom events (they're already
   fired by our `analytics.js`):
   - `scan_pageview`
   - `scan_started`
   - `scan_answered`
   - `scan_completed`
   - `pdf_downloaded`
   - `email_captured`
5. Your weekly dashboard now shows the full funnel:
   `impressions → clicks → scan started → completed → email captured → call booked`.

### UTM conventions for LinkedIn posts

Every LinkedIn post that links to `app.ekmgc.de` should append UTM parameters so
Plausible can attribute conversions to the right post:

```
https://app.ekmgc.de?utm_source=linkedin&utm_medium=organic&utm_campaign=ai_act_2026&utm_content=post_042
```

Swap `post_042` per post. The analytics helper saves these to `sessionStorage`
and passes them to every event — so "Bronislava triggered an email capture
from post #43" is visible on the dashboard.

---

## Email capture — wiring the form

By default, the email form downloads the PDF without server-side capture. To
actually receive the emails:

### Option A — Formspree (5 minutes, free up to 50/mo)

1. Sign up at [formspree.io](https://formspree.io).
2. Create a new form with destination `elshan.musayev@ekmgc.de`.
3. Copy the endpoint URL (looks like `https://formspree.io/f/xxxxxxxx`).
4. In `index.html`, add this `<script>` right before the `./js/pdf.js` load:

```html
<script>window.EKM_CAPTURE_ENDPOINT = 'https://formspree.io/f/xxxxxxxx';</script>
```

That's it. The form now double-fires: sends the email + scoring result to
Formspree, AND downloads the PDF in the user's browser.

### Option B — Tally or Web3Forms — same pattern.

### Option C — Custom endpoint

Point `window.EKM_CAPTURE_ENDPOINT` at any URL that accepts
`POST { email, company, tier, score, triggered_categories, gpai, submitted_at, source }`.
Could be a Cloudflare Worker, a Vercel serverless function, a Google Apps Script
webhook, or a tiny Node endpoint on `91.99.223.134`.

---

## SEO + Open Graph

The app already ships with:

- `<title>` and `<meta description>`
- `og:title`, `og:description`, `og:image`, `og:url`
- Favicon inline SVG

To improve OG preview image, drop a 1200×630 PNG at `ekmgc.de/assets/og.png`
(the current `index.html` references it). Suggested subject: the BOARD cheat
sheet cover page.

---

## Monitoring the live app

- **Plausible** → daily funnel dashboard
- **Vercel** → deploy history, instant rollback
- **Browser console checks** on first deploy: `window.EKM_BuildPdf` must be a
  function. If not, jsPDF is broken.
- **Synthetic check** — add a free UptimeRobot ping on `https://app.ekmgc.de/`
  every 5 minutes with alert to your email if 3 consecutive fails.

---

## What NOT to deploy to app.ekmgc.de

- `DEPLOY.md` — this file. Add to `.vercelignore`:

  ```
  # .vercelignore (in repo root)
  DEPLOY.md
  *.md
  ```
  Actually — keep it. It's harmless and sometimes useful for yourself.

- The `linkedin-x-agent/` bot. That's a separate Node app with its own PM2
  process. Its .env contains the Telegram + LinkedIn tokens and must never
  touch the public static host.

---

## Checklist before you go live

- [ ] `vendor/jspdf.umd.min.js` present (357 KB)
- [ ] `index.html` references `./vendor/jspdf.umd.min.js` (not a CDN URL)
- [ ] Plausible script `data-domain="app.ekmgc.de"` matches the domain you registered
- [ ] If using email capture: `window.EKM_CAPTURE_ENDPOINT` set before `app.js`
- [ ] DNS `app.ekmgc.de` CNAME points to hosting provider
- [ ] HTTPS certificate issued
- [ ] Open `https://app.ekmgc.de/` in 3 browsers (Chrome, Safari, mobile Safari); complete the scan end-to-end; confirm PDF downloads
- [ ] Update LinkedIn bio link to `https://app.ekmgc.de/?utm_source=linkedin_bio`
- [ ] Update the 85 content-pack posts to replace bare `app.ekmgc.de` with UTM-tagged versions (optional but high-value)
