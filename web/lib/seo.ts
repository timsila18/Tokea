import type { Metadata } from 'next';
import { publicEnv } from '@/lib/env';

export function eventMetadata(event: {
  title: string;
  description?: string | null;
  slug: string;
  startsAt?: string | null;
  location?: string | null;
}): Metadata {
  const title = `${event.title} Tickets`;
  const description = event.description ?? `Book tickets, food, transport, and event-day services for ${event.title} on Tokea.`;
  const url = `${publicEnv.NEXT_PUBLIC_SITE_URL}/events/${event.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      title,
      description,
      url,
      siteName: 'Tokea',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export function eventJsonLd(event: {
  title: string;
  description?: string | null;
  startsAt?: string | null;
  location?: string | null;
  slug: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description,
    startDate: event.startsAt,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: {
      '@type': 'Place',
      name: event.location ?? 'Kenya',
      address: event.location ?? 'Kenya',
    },
    url: `${publicEnv.NEXT_PUBLIC_SITE_URL}/events/${event.slug}`,
    organizer: {
      '@type': 'Organization',
      name: 'Tokea Organizer',
    },
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      priceCurrency: 'KES',
      url: `${publicEnv.NEXT_PUBLIC_SITE_URL}/events/${event.slug}`,
    },
  };
}
