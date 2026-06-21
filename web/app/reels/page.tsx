import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Event Reels',
  description: 'Short-form event videos, festival trailers, concert promos, announcements, and venue previews.',
};

export default function ReelsPage() {
  return (
    <>
      <div className="topbar">
        <h1 style={{ fontSize: 42 }}>Event Reels</h1>
      </div>
      <div className="grid">
        {['Festival Trailers', 'Concert Promos', 'Organizer Announcements'].map((title) => (
          <article className="panel" key={title}>
            <div className="poster">Play</div>
            <h3>{title}</h3>
            <p>Like, comment, share, save, and follow organizer with realtime updates.</p>
          </article>
        ))}
      </div>
    </>
  );
}
