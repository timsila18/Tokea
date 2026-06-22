'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Bookmark, CalendarDays, Heart, MapPin, Play, Ticket, Users } from 'lucide-react';
import { demoEvents } from '@/lib/data';

const posters = [
  'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1000&q=82',
  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1000&q=82',
  'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=1000&q=82',
  'https://images.unsplash.com/photo-1527224857830-715c6b8c7f88?auto=format&fit=crop&w=1000&q=82',
];

const feedSections = [
  ['Recommended For You', 'Picked from your saved events and interests'],
  ['Trending In Kenya', 'Events people are talking about'],
  ['This Weekend', 'Plans worth leaving the house for'],
] as const;

export function AttendeeHome() {
  const [saved, setSaved] = useState<string[]>(['blankets-and-wine-nairobi']);
  const [going, setGoing] = useState<string[]>([]);
  const recommended = useMemo(() => demoEvents.slice(0, 4), []);

  function toggle(list: string[], setter: (value: string[]) => void, slug: string) {
    setter(list.includes(slug) ? list.filter((item) => item !== slug) : [...list, slug]);
  }

  return <div className="attendee-home"><header className="attendee-header"><div><p className="section-kicker">Tokea for you</p><h1>Find your next story.</h1><p>Events, people, food, and routes that make getting out feel effortless.</p></div><Link href="/search" className="button">Explore events</Link></header><section className="attendee-wallet"><div><span>EVENT-DAY WALLET</span><strong>2 active passes</strong><p>Your ticket, Foodo, and Triplink passes stay together when the day arrives.</p></div><Link href="/dashboard/attendee/tickets" className="button secondary"><Ticket size={16} />Open wallet</Link></section>{feedSections.map(([title, description], index) => <section className="attendee-feed-section" key={title}><div className="attendee-section-head"><div><h2>{title}</h2><p>{description}</p></div><Link href="/search" className="text-link">See all</Link></div><div className="attendee-event-rail">{recommended.slice(index, index + 3).map((event, eventIndex) => <article className="attendee-event-card" key={`${title}-${event.slug}`}><Link href={`/events/${event.slug}`} className="attendee-poster" style={{ backgroundImage: `url(${posters[(eventIndex + index) % posters.length]})` }}><span>{event.date}</span><strong>{event.title}</strong></Link><div className="attendee-event-body"><div className="attendee-event-meta"><span><MapPin size={14} />{event.location}</span><span><Users size={14} />{420 + eventIndex * 137} going</span></div><p>{event.price}</p><div className="attendee-event-actions"><button className={going.includes(event.slug) ? 'active' : ''} type="button" onClick={() => toggle(going, setGoing, event.slug)}><Heart size={15} fill={going.includes(event.slug) ? 'currentColor' : 'none'} />{going.includes(event.slug) ? 'Going' : 'Interested'}</button><button className={saved.includes(event.slug) ? 'active' : ''} type="button" onClick={() => toggle(saved, setSaved, event.slug)} aria-label={`Save ${event.title}`}><Bookmark size={16} fill={saved.includes(event.slug) ? 'currentColor' : 'none'} /></button><Link href={`/events/${event.slug}`} className="buy-ticket">Buy ticket</Link></div></div></article>)}</div></section>)}<section className="attendee-discovery-grid"><Link href="/reels" className="attendee-reel"><Play size={24} fill="currentColor" /><div><span>EVENT REELS</span><strong>Watch what is building across Kenya</strong></div></Link><Link href="/communities/blankets-and-wine-nairobi" className="attendee-community-card"><Users size={22} /><div><span>COMMUNITIES</span><strong>Join conversations before you arrive</strong></div></Link></section></div>;
}
