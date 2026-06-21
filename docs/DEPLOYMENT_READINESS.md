# Tokea Deployment Readiness

## Environments

- Development: local Flutter and Next.js with publishable Supabase key.
- Staging: separate Supabase project or isolated schema, staging Daraja shortcode, staging storage buckets.
- Production: production Supabase project, production Daraja, monitoring, backup, and alerting.

## CI/CD

- Flutter analyze/test.
- Next.js typecheck/lint/build.
- Schema diff/advisors before migrations.
- E2E smoke tests for public web pages and core dashboards.
- Manual approval before production deploy.
- Rollback through previous web deployment and previous mobile release.

## Android Release

- Configure package id, app name, versioning, launcher icons, splash screen.
- Store release keystore outside repo.
- Build APK and AAB:
  - `flutter build apk --release`
  - `flutter build appbundle --release`
- Upload AAB to Google Play internal testing first.

## Web Release

- Set `NEXT_PUBLIC_SUPABASE_URL`.
- Set `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Set server-only keys in deployment secret store.
- Run `npm run build` in `web/`.
- Deploy to Vercel/Netlify/Render with CDN enabled.

## Backup And Recovery

- Schedule Supabase database backups.
- Mirror critical storage buckets.
- Record backup jobs in `backup_runs`.
- Test restore process before launch.
