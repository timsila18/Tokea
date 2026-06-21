# Tokea QA Checklist

## Mobile

- Registration: attendee, organizer, vendor, event staff.
- Login persistence across app restarts.
- Event creation wizard: draft and publish.
- Feed, reels, discover, profile, notifications.
- Ticket wallet, transfer, refund, offline check-in queue.
- Organizer command center, operations, workforce, incident, emergency, Foodo, Triplink.

## Web

- Public homepage loads.
- Event SEO page loads at `/events/nairobi-jazz-festival-2027`.
- Organizer, venue, community, reels, and search pages load.
- Attendee, organizer, vendor, sponsor, staff, and admin dashboards load.
- Realtime listeners subscribe without client errors.
- API validation rejects malformed checkout and notification payloads.

## Supabase

- Apply schema successfully.
- Verify RLS for attendee, organizer, vendor, sponsor, staff, volunteer, admin.
- Verify realtime for ticket orders, food orders, transport bookings, community posts, workspace messages, notifications.
- Verify audit triggers for events, orders, refunds, transfers, payouts, verification, settings.
- Verify global search rows populate for event writes.

## End-To-End Journeys

- Attendee: discover event, buy ticket, add food, add transport, open wallet.
- Organizer: create event, publish event, create ticket types, monitor sales, approve vendor, assign staff.
- Vendor: apply, receive approval, receive booking, view finance.
- Sponsor: match event, apply, negotiate, contract.
- Staff: assignment, shift, GPS attendance, incident reporting.
- Admin: review verification, freeze payout, moderate report, inspect audit trail.
