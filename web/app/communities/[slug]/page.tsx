import type { Metadata } from 'next';
import { EventCommunityChat } from '@/components/EventCommunityChat';
import { demoEvents } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Event Community',
  description: 'The conversation space for people attending Tokea events.',
};

function communityTitle(slug: string) {
  return demoEvents.find((event) => event.slug === slug)?.title ?? slug.split('-').map((word) => word[0]?.toUpperCase() + word.slice(1)).join(' ');
}

export default async function CommunityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return <EventCommunityChat eventTitle={communityTitle(slug)} />;
}
