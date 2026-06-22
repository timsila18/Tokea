'use client';

import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, MapPin, Search, SlidersHorizontal, Users } from 'lucide-react';
import { demoEvents } from '@/lib/data';

const categories = ['All', 'Music', 'Gospel', 'Comedy', 'Technology', 'Festivals', 'Conferences', 'Nightlife', 'Family', 'Campus'];
const posters = [
  'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1527224857830-43a7acc85260?auto=format&fit=crop&w=1000&q=85',
];

function categoryFor(slug: string) {
  if (slug.includes('gospel')) return 'Gospel';
  if (slug.includes('comedy')) return 'Comedy';
  if (slug.includes('tech')) return 'Technology';
  if (slug.includes('festival')) return 'Festivals';
  return 'Music';
}

export function DiscoverExperience({ initialQuery }: { initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState('All');
  const [quickFilter, setQuickFilter] = useState('Popular');
  const [saved, setSaved] = useState<string[]>([]);
  const visibleEvents = useMemo(() => demoEvents.filter((event) => {
    const matchesQuery = [event.title, event.location, event.description, categoryFor(event.slug)].join(' ').toLowerCase().includes(query.trim().toLowerCase());
    return matchesQuery && (category === 'All' || categoryFor(event.slug) === category);
  }), [category, query]);

  function search(event: FormEvent<HTMLFormElement>) { event.preventDefault(); }
  function toggleSave(slug: string) { setSaved((current) => current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug]); }

  return <div className="discover-experience">
    <header className="discover-header"><div><h1>Discover what is next.</h1><p>Events worth talking about, all across Kenya.</p></div><Link href="/reels" className="button secondary">Watch reels</Link></header>
    <form className="discover-search" onSubmit={search}><Search size={20} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search events, artists, venues, or places..." /><button className="button" type="submit">Search</button></form>
    <section className="discover-controls"><div className="discover-category-row">{categories.map((item) => <button className={category === item ? 'active' : ''} key={item} onClick={() => setCategory(item)} type="button">{item}</button>)}</div><div className="discover-quick-row"><SlidersHorizontal size={16} />{['Popular', 'This weekend', 'Nearby', 'Free events'].map((item) => <button className={quickFilter === item ? 'active' : ''} key={item} onClick={() => setQuickFilter(item)} type="button">{item}</button>)}</div></section>
    <section className="discover-results"><div className="attendee-section-head"><div><h2>{query ? 'Search results' : quickFilter}</h2><p>{visibleEvents.length} events to explore</p></div><span className="discover-location"><MapPin size={15} /> Nairobi</span></div><div className="discover-event-grid">{visibleEvents.map((event, index) => <article className="discover-event-card" key={event.slug}><Link className="discover-event-media" href={`/events/${event.slug}`} style={{ backgroundImage: `url(${posters[index % posters.length]})` }}><span>{categoryFor(event.slug)}</span><strong>{event.date}</strong></Link><div className="discover-event-copy"><Link href={`/events/${event.slug}`}><h3>{event.title}</h3></Link><p><MapPin size={14} /> {event.location}</p><p><Users size={14} /> {390 + index * 107} going</p><div><strong>{event.price}</strong><button className={saved.includes(event.slug) ? 'saved' : ''} onClick={() => toggleSave(event.slug)} type="button">{saved.includes(event.slug) ? 'Saved' : 'Save'}</button></div><Link href={`/events/${event.slug}`} className="buy-ticket"><CalendarDays size={15} /> View event</Link></div></article>)}</div>{visibleEvents.length === 0 && <div className="attendee-empty"><Search size={26} /><strong>No events match that search</strong><p>Try a venue, artist, category, or a broader search.</p></div>}</section>
  </div>;
}
