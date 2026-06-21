# Tokea

Premium Kenyan event discovery, event management, and ticketing foundation.

Tagline: **Don't Hear About It. Tokea.**

## Bit 1 Included

- Flutter mobile app foundation, Android-first.
- Luxury Tokea theme system.
- Supabase client initialization.
- Custom phone number + password auth flow.
- Role-aware signup for attendee, organizer, vendor, and event staff.
- Persistent Supabase session handling.
- Bottom navigation shell: Home, Discover, Create, Tickets, Profile.
- Feed, discover, notifications, and profile foundations.
- Supabase PostgreSQL schema with RLS policy foundation.

## Bit 2 Included

- Premium five-step event creation wizard.
- Social event feed foundation with carousel-style media, social actions, counts, and ticket CTA placeholder.
- Dedicated Reels tab with vertical short-form event video experience.
- Event community screen foundation and automatic database community/channel creation.
- Organizer profile, venue profile, reviews, notifications, and moderation foundations.
- Follow, save, interest, nested comments, reels, reviews, venue, community, and recommendation schema.
- Supabase Realtime publication coverage for social interactions, communities, follows, reels, and notifications.

## Bit 3 Included

- Ticket wallet with upcoming, transferred, cancelled, and refund foundations.
- Under-60-second purchase flow architecture: ticket selection, quantity, promo code, M-Pesa, confirmation, QR ticket.
- Organizer ticket sales dashboard foundation with available, sold, revenue, pending, check-in, and attendance metrics.
- Production M-Pesa Daraja data architecture for STK Push, Paybill, Till, and future card payments.
- QR ticket security foundation with unique ticket ownership, hashed QR nonce records, status lifecycle, and double check-in protection.
- Promo code, affiliate promoter, transfer, refund, waitlist, event capacity, payout, and organizer verification schema.
- Check-in mode with QR/search/manual entry foundation and offline queue storage for low-connectivity Kenyan event venues.
- Realtime publication coverage for sales, payments, wallet, check-ins, refunds, transfers, waitlists, and payouts.

## Bit 4 Included

- Organizer Command Center for today's events, upcoming events, revenue, check-ins, growth, communities, tasks, sponsors, vendors, staff, food, and transport.
- Event Operations Workspace with Overview, Tickets, Attendees, Community, Sponsors, Vendors, Food, Transport, Staff, Tasks, Analytics, Finance, and Settings tabs.
- Task management schema with assignees, priority, due dates, status, completion, notes, attachments, and comments.
- Tokea AI Event Manager foundation for budget, task, pricing, marketing, vendor, sponsor, transport, food, risk, and revenue planning.
- Sponsor marketplace, matching, applications, contracts, payments, deliverables, and brand assets foundation.
- Vendor marketplace, bookings, reviews, performance tracking, pricing, ratings, and quotation workflow foundation.
- Finance, budgeting, expenses, profit, analytics, organizer teams, permissions, and document management foundations.
- Realtime publication coverage for tasks, sponsors, vendors, budgets, teams, documents, analytics, and notifications.

## Bit 5 Included

- Solco-style event workspaces that are automatically created for every event.
- Default workspace channels: General, Announcements, Operations, Ticketing, Security, VIP, Sponsors, Vendors, Food Vendors, Transport, Media, Emergency, Lost & Found, Support, Staff, and Volunteers.
- Realtime chat foundation with one-to-one messages, channel messages, files, photos, videos, voice notes, pinned messages, reactions, typing indicators, and read receipts.
- Built-in meeting foundation with video/audio meeting records, screen sharing flags, recordings, captions, notes, attendance, raise hand, and in-meeting chat support.
- Event Operations Command Center for event status, sales, attendance, workforce, vendors, sponsors, food, transport, incidents, tasks, weather placeholder, and emergency alerts.
- SolvaHR-style workforce module for staff pools, volunteer portal, recruitment, assignments, shifts, GPS attendance, org charts, approvals, performance, certificates, and analytics.
- Incident management and emergency response foundations with realtime alert distribution.
- Secure storage buckets and RLS policies for workspace files, workforce documents, incident media, and certificates.

## Bit 6 Included

- Foodo event services module with food vendor profiles, applications, stall management, menus, pre-orders, QR redemption, order status, and food analytics foundation.
- Triplink transport module with provider profiles, event routes, pickup/drop-off schedules, transport booking, boarding QR passes, passenger manifests, and vehicle tracking foundation.
- Attendee Experience Hub for ticket, food, transport, updates, maps, emergency contacts, event schedule, coupons, rewards, and wallet passes.
- Event maps and timeline foundations for entrances, exits, VIP areas, vendors, transport zones, medical areas, stages, parking, and departure times.
- Rewards, referrals, merchandise sales, merchandise QR collection, vendor finance, logistics operations, and health/safety modules.
- RLS, storage buckets, wallet/reward triggers, and realtime publication coverage for food, transport, maps, schedules, wallet items, rewards, referrals, merch, logistics, and compliance.

## Final Phase Included

- Next.js web platform foundation in `web/` using the same Supabase backend and realtime tables as Flutter.
- SEO public routes for events, organizers, venues, communities, reels, and global search.
- Web dashboards for attendee, organizer, vendor, sponsor, staff/volunteer, and super admin.
- Schema.org event markup, Open Graph, Twitter cards, canonical URLs, and search-friendly route structure.
- Centralized audit trail, notification engine, analytics warehouse foundation, global search index, security events, rate-limit records, platform settings, media assets, and backup run tables.
- Secure Next.js API route foundations with validation for checkout, notifications, and audit writes.
- Security headers middleware, upload validation helper, CI workflow, QA checklist, deployment readiness, app store readiness, and final audit documentation.

## Not Included Yet

- Live ticket checkout charging.
- Live M-Pesa Daraja API processing.
- Final Next.js web platform.
- Production hardening and launch infrastructure.
- Solco, Foodo, Triplink.

## Setup

1. Copy `.env.example` to `.env`.
2. Add your Supabase URL and public anon/publishable key.
3. Run `flutter pub get`.
4. Apply `supabase/schema.sql` in your Supabase SQL editor.
5. For web: `cd web`, copy `.env.example` to `.env.local`, then run `npm install` and `npm run dev`.

Supabase email confirmation and OTP flows should remain disabled for this product flow.
