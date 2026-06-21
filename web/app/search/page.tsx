import type { Metadata } from 'next';
import Link from 'next/link';
import { demoEvents } from '@/lib/data';
import { ModuleTable } from '@/components/ModuleTable';

export const metadata: Metadata = {
  title: 'Global Search',
  description: 'Search events, organizers, venues, artists, speakers, sponsors, vendors, food vendors, transport providers, and communities.',
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = '' } = await searchParams;
  const query = q.trim().toLowerCase();
  const results = query
    ? demoEvents.filter((event) =>
        [event.title, event.location, event.description, event.price].join(' ').toLowerCase().includes(query),
      )
    : demoEvents;

  return (
    <>
      <div className="topbar">
        <form className="search-form" action="/search">
          <input className="search" name="q" defaultValue={q} placeholder="Search the Tokea ecosystem..." />
          <button className="button" type="submit">Search</button>
        </form>
      </div>
      <section className="section panel">
        <h2>{query ? `Search results for "${q}"` : 'Trending Events'}</h2>
        <div className="search-results">
          {results.map((event) => (
            <Link href={`/events/${event.slug}`} className="search-result" key={event.slug}>
              <strong>{event.title}</strong>
              <span>{event.location} · {event.date} · {event.price}</span>
              <p>{event.description}</p>
            </Link>
          ))}
          {results.length === 0 ? <p>No matching events yet. Try another keyword.</p> : null}
        </div>
      </section>
      <ModuleTable
        title="Search Index Coverage"
        columns={['Entity', 'Table', 'Status']}
        rows={[
          ['Events', 'events', 'Indexed'],
          ['Organizers', 'organizer_profiles', 'Indexed'],
          ['Venues', 'venue_profiles', 'Indexed'],
          ['Sponsors', 'sponsors', 'Indexed'],
          ['Vendors', 'vendors', 'Indexed'],
          ['Food Vendors', 'food_vendors', 'Indexed'],
          ['Transport Providers', 'transport_providers', 'Indexed'],
          ['Communities', 'event_communities', 'Indexed'],
        ]}
      />
    </>
  );
}
