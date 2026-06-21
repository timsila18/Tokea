import Link from 'next/link';
import { Bell, Search, ShieldCheck } from 'lucide-react';
import { AdminMetrics } from '@/components/AdminMetrics';
import { EventCard } from '@/components/EventCard';
import { RealtimePulse } from '@/components/RealtimePulse';
import { demoEvents, realtimeTables } from '@/lib/data';

export default function HomePage() {
  return (
    <>
      <div className="topbar">
        <input className="search" placeholder="Search events, organizers, venues, sponsors, vendors, food, transport..." />
        <Link className="button" href="/admin"><ShieldCheck size={18} /> Admin Portal</Link>
      </div>

      <section className="hero-grid">
        <div className="panel hero-panel">
          <div className="hero-content">
            <h1>Discover, sell, operate, and experience events across Africa.</h1>
            <p>
              Tokea brings event discovery, ticketing, M-Pesa architecture, QR access, Foodo, Triplink,
              Solco workspaces, workforce operations, analytics, and admin controls into one realtime platform.
            </p>
            <div className="hero-actions">
              <Link className="button" href="/events/nairobi-jazz-festival-2027">Explore Event</Link>
              <Link className="button secondary" href="/dashboard/organizer">Organizer Dashboard</Link>
            </div>
            <AdminMetrics />
          </div>
        </div>

        <aside className="panel rail">
          <div className="row">
            <h2>Realtime Sync</h2>
            <Bell color="#D4AF37" />
          </div>
          {realtimeTables.slice(0, 5).map((table) => (
            <RealtimePulse key={table} table={table} />
          ))}
        </aside>
      </section>

      <section className="section">
        <div className="row">
          <h2>SEO Event Discovery</h2>
          <Link className="button secondary" href="/search"><Search size={16} /> Global Search</Link>
        </div>
        <div className="grid">
          {demoEvents.map((event) => (
            <EventCard key={event.slug} event={event} />
          ))}
        </div>
      </section>
    </>
  );
}
