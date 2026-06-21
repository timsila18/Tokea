import type { Metadata } from 'next';
import { OrganizerProfileActions } from '@/components/OrganizerProfileActions';
import { ModuleTable } from '@/components/ModuleTable';

export const metadata: Metadata = {
  title: 'Organizer Profile',
  description: 'Professional organizer page with events, videos, photos, reviews, followers, and verification.',
};

export default async function OrganizerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const organizerName = slug.replaceAll('-', ' ');

  return (
    <>
      <section className="panel hero-panel">
        <div className="hero-content">
          <h1>{organizerName}</h1>
          <p>Verified organizer profile with upcoming events, past events, videos, photos, reviews, and sponsor-ready proof.</p>
          <OrganizerProfileActions organizerName={organizerName} />
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
