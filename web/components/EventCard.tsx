import Link from 'next/link';
import { Calendar, MapPin, Ticket } from 'lucide-react';

export function EventCard({ event }: { event: { slug: string; title: string; location: string; date: string; price: string; description: string } }) {
  return (
    <article className="panel event-card">
      <div className="poster"><Ticket size={46} /></div>
      <div className="row">
        <h3>{event.title}</h3>
        <span className="status good">Live</span>
      </div>
      <p>{event.description}</p>
      <div className="row muted">
        <span><MapPin size={14} /> {event.location}</span>
        <span><Calendar size={14} /> {event.date}</span>
      </div>
      <div className="row" style={{ marginTop: 14 }}>
        <strong>{event.price}</strong>
        <Link className="button secondary" href={`/events/${event.slug}`}>View</Link>
      </div>
    </article>
  );
}
