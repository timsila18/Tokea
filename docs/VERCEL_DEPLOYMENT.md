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
- Production deployment: `https://tokea-ailyrexab-timsila18s-projects.vercel.app`
- Primary custom domain: `https://tokeaevents.co.ke`
- WWW custom domain: `https://www.tokeaevents.co.ke`
- Production aliases:
  - `https://tokeaevents.co.ke`
  - `https://www.tokeaevents.co.ke`
  - `https://tokea-timsila18s-projects.vercel.app`
  - `https://tokea-timsila18-timsila18s-projects.vercel.app`
- Deployment protection is enabled, so unauthenticated direct requests return Vercel Authentication until protection is disabled or a bypass/share link is used.

## DNS Records

The domain is registered with a third-party provider using these current nameservers:

```text
ns1.host-ww.net
ns2.host-ww.net
ns3.host-ww.net
ns4.host-ww.net
```

Add these records at that DNS provider:

```text
Type  Name                  Value
A     @                     76.76.21.21
A     www                   76.76.21.21
```

Alternative: change the domain nameservers to Vercel DNS:

```text
ns1.vercel-dns.com
ns2.vercel-dns.com
```

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
