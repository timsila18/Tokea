import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { eventJsonLd, eventMetadata } from '@/lib/seo';
import { demoEvents } from '@/lib/data';
import { ModuleTable } from '@/components/ModuleTable';

type Props = { params: Promise<{ slug: string }> };

function getEvent(slug: string) {
  return demoEvents.find((event) => event.slug === slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = getEvent(slug);
  if (!event) return {};
  return eventMetadata({
    title: event.title,
    description: event.description,
    slug: event.slug,
    startsAt: event.date,
    location: event.location,
  });
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const event = getEvent(slug);
  if (!event) notFound();

  const jsonLd = eventJsonLd({
    title: event.title,
    description: event.description,
    slug: event.slug,
    startsAt: event.date,
    location: event.location,
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="panel hero-panel">
        <div className="hero-content">
          <h1>{event.title}</h1>
          <p>{event.description}</p>
          <div className="hero-actions">
            <Link href="/dashboard/attendee" className="button">Buy Ticket</Link>
            <Link href="/dashboard/attendee" className="button secondary">Add Food + Transport</Link>
          </div>
          <div className="metrics">
            <div className="metric"><strong>{event.price}</strong><span>Ticket Starting Price</span></div>
            <div className="metric"><strong>{event.location}</strong><span>Venue</span></div>
            <div className="metric"><strong>{event.date}</strong><span>Date</span></div>
            <div className="metric"><strong>Realtime</strong><span>Comments, likes, orders</span></div>
          </div>
        </div>
      </section>
      <ModuleTable
        title="Event-Day Add Ons"
        columns={['Service', 'Status', 'Realtime Table']}
        rows={[
          ['Ticketing', 'Ready', 'ticket_orders'],
          ['Foodo Pre-Orders', 'Ready', 'food_orders'],
          ['Triplink Transport', 'Ready', 'transport_bookings'],
          ['Merchandise', 'Ready', 'merchandise_orders'],
        ]}
      />
    </>
  );
}
