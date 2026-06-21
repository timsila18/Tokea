# Tokea Security Hardening

## Secrets

- Never commit `.env`, service-role keys, signing keys, keystores, Daraja credentials, SMS credentials, or SMTP credentials.
- Rotate the Supabase DB password and secret key that were shared in chat.
- Use only publishable Supabase keys in Flutter and browser code.
- Store server-only keys in deployment secrets.

## Supabase

- RLS is enabled for all public tables in `supabase/schema.sql`.
- Authorization is stored in `public.users` / `public.profiles`, not user-editable metadata.
- Critical workflows write to `audit_logs`.
- Suspicious activity belongs in `security_events`.
- Payouts, verification, platform settings, and security events are super-admin gated.

## Ticket Fraud Controls

- QR records use unique hashes.
- Ticket check-ins enforce unique `ticket_holder_id`.
- Transfer history invalidates old ownership paths through status changes.
- Refunds and payouts require manager/admin policies and audit records.

## API Routes

- Validate all incoming payloads with `zod`.
- Use server-only Supabase clients for privileged work.
- Add provider webhooks for Daraja callbacks, email/SMS status, push status, and monitoring events.
- Enforce rate limiting through `rate_limit_events` and deployment-layer controls.

## File Uploads

- Validate MIME type, file size, extension, and ownership before upload.
- Store media metadata in `media_assets`.
- Route moderation through `content_reports` and `moderation_status`.
