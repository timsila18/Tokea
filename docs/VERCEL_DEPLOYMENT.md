# Tokea Vercel Deployment

Deploy the web platform from `web/` as a Next.js project.

## Required Vercel Environment Variables

Set these in the Vercel dashboard or CLI. Keep server secrets write-only and never commit them.

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_SITE_URL
SUPABASE_SERVICE_ROLE_KEY
```

Use a freshly rotated Supabase service role key for `SUPABASE_SERVICE_ROLE_KEY`. If any database password or secret key has been pasted into chat, rotate it before production.

## CLI Flow

```powershell
cd web
npx vercel link --yes
npx vercel env add NEXT_PUBLIC_SUPABASE_URL production
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
npx vercel env add NEXT_PUBLIC_SITE_URL production
npx vercel env add SUPABASE_SERVICE_ROLE_KEY production --sensitive
npx vercel deploy --prod --yes
```

## Current Deployment

- Project: `timsila18s-projects/tokea`
- Production deployment: `https://tokea-phmkjsbd4-timsila18s-projects.vercel.app`
- Production aliases:
  - `https://tokea-timsila18s-projects.vercel.app`
  - `https://tokea-timsila18-timsila18s-projects.vercel.app`
- Deployment protection is enabled, so unauthenticated direct requests return Vercel Authentication until protection is disabled or a bypass/share link is used.

## Security Baseline

- Vercel serves the app over HTTPS with HSTS enabled by `web/vercel.json`.
- CSP blocks framing, object embeds, third-party script execution, and non-Supabase network calls.
- API routes reject non-JSON mutation requests in middleware.
- Privileged notification and audit writes require an authenticated `super_admin` profile before the service role client is created.
- Checkout placeholder route requires a signed-in user even before payments are enabled.

## Recommended Vercel Firewall Rules

Enable these in the Vercel dashboard after linking the project:

- Bot Protection: challenge.
- AI bot blocking: deny.
- API rate limit: `/api/*`, fixed window, 100 requests/minute/IP, deny.
- Login/auth route rate limit when web auth routes are added: 10 POST requests/minute/IP, challenge.
- OWASP CRS if the project is on a plan that supports managed rules.
