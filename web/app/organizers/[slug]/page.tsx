import type { Metadata } from 'next';
import { ModuleTable } from '@/components/ModuleTable';

export const metadata: Metadata = {
  title: 'Organizer Profile',
  description: 'Professional organizer page with events, videos, photos, reviews, followers, and verification.',
};

export default function OrganizerPage({ params }: { params: { slug: string } }) {
  return (
    <>
      <section className="panel hero-panel">
        <div className="hero-content">
          <h1>{params.slug.replaceAll('-', ' ')}</h1>
          <p>Verified organizer profile with upcoming events, past events, videos, photos, reviews, and sponsor-ready proof.</p>
          <div className="hero-actions">
            <button className="button">Follow Organizer</button>
            <button className="button secondary">View Events</button>
          </div>
        </div>
      </section>
      <ModuleTable
        title="Organizer Surface"
        columns={['Module', 'Capability', 'Sync']}
        rows={[
          ['Upcoming Events', 'Discovery and tickets', 'events'],
          ['Reviews', 'Organizer reputation', 'event_reviews'],
          ['Videos', 'Reels and media', 'reels'],
          ['Followers', 'Personalized feed', 'organizer_followers'],
        ]}
      />
    </>
  );
}
