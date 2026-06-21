import type { Metadata } from 'next';
import { ModuleTable } from '@/components/ModuleTable';

export const metadata: Metadata = {
  title: 'Venue Profile',
  description: 'Venue page with capacity, location, maps, upcoming events, ratings, and reviews.',
};

export default async function VenuePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <>
      <section className="panel hero-panel">
        <div className="hero-content">
          <h1>{slug.replaceAll('-', ' ')}</h1>
          <p>Venue profile with capacity, images, maps, upcoming events, past events, ratings, and reviews.</p>
        </div>
      </section>
      <ModuleTable
        title="Venue Readiness"
        columns={['Area', 'Status', 'Table']}
        rows={[
          ['Maps', 'Ready', 'event_maps'],
          ['Upcoming Events', 'Ready', 'events'],
          ['Reviews', 'Ready', 'event_reviews'],
          ['Transport Zones', 'Ready', 'transport_routes'],
        ]}
      />
    </>
  );
}
