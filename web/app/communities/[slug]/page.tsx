import type { Metadata } from 'next';
import { RealtimePulse } from '@/components/RealtimePulse';

export const metadata: Metadata = {
  title: 'Event Community',
  description: 'Realtime event community with announcements, questions, photos, networking, support, and transport planning.',
};

export default async function CommunityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <>
      <section className="panel">
        <h1 style={{ fontSize: 42 }}>{slug.replaceAll('-', ' ')} Community</h1>
        <p>General, announcements, questions, photos, networking, transport, food, and support channels.</p>
      </section>
      <section className="grid">
        {['community_posts', 'community_comments', 'notifications'].map((table) => (
          <div className="panel" key={table}>
            <RealtimePulse table={table} />
          </div>
        ))}
      </section>
    </>
  );
}
