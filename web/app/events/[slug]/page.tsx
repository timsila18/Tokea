import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eventJsonLd, eventMetadata } from "@/lib/seo";
import { demoEvents } from "@/lib/data";
import { EventCommunityChat } from "@/components/EventCommunityChat";
import { ModuleTable } from "@/components/ModuleTable";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type EventView = {
  slug: string;
  title: string;
  location: string;
  date: string;
  price: string;
  description: string;
  status?: string;
};

type Props = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ preview?: string }>;
};

function getEvent(slug: string) {
  return demoEvents.find((event) => event.slug === slug);
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function formatKes(cents?: number | null) {
  if (!cents) return "Tickets coming soon";
  return `From ${new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(Math.round(cents / 100))}`;
}

async function isOrganizerPreviewOwner(eventOrganizerId: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: organizer } = await supabase
    .from("organizer_profiles")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  return organizer?.id === eventOrganizerId;
}

async function getDatabaseEvent(
  slug: string,
  preview = false,
): Promise<EventView | null> {
  const admin = createSupabaseAdminClient();
  let query = admin
    .from("events")
    .select(
      "id, organizer_id, title, description, location_name, venue, city, starts_at, share_slug, ticket_starting_price_cents, status",
    )
    .eq("share_slug", slug)
    .maybeSingle();

  if (isUuid(slug)) {
    query = admin
      .from("events")
      .select(
        "id, organizer_id, title, description, location_name, venue, city, starts_at, share_slug, ticket_starting_price_cents, status",
      )
      .eq("id", slug)
      .maybeSingle();
  }

  const { data: event, error } = await query;
  if (error || !event) return null;

  if (event.status !== "published") {
    if (!preview) return null;
    const isOwner = await isOrganizerPreviewOwner(event.organizer_id);
    if (!isOwner) return null;
  }

  return {
    slug: event.share_slug ?? event.id,
    title: event.title,
    location:
      event.venue ||
      event.location_name ||
      event.city ||
      "Venue to be confirmed",
    date: event.starts_at
      ? event.starts_at.slice(0, 10)
      : "Date to be confirmed",
    price: formatKes(event.ticket_starting_price_cents),
    description: event.description || "Tokea event details are being prepared.",
    status: event.status,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = getEvent(slug) ?? (await getDatabaseEvent(slug, false));
  if (!event) return {};
  return eventMetadata({
    title: event.title,
    description: event.description,
    slug: event.slug,
    startsAt: event.date,
    location: event.location,
  });
}

export default async function EventDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const preview = (await searchParams)?.preview === "1";
  const event = getEvent(slug) ?? (await getDatabaseEvent(slug, preview));
  if (!event) notFound();

  const jsonLd = eventJsonLd({
    title: event.title,
    description: event.description,
    slug: event.slug,
    startsAt: event.date,
    location: event.location,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="panel hero-panel">
        <div className="hero-content">
          <h1>{event.title}</h1>
          <p>{event.description}</p>
          <div className="hero-actions">
            <Link href="/dashboard/attendee/top-up" className="button">
              Buy Ticket
            </Link>
            <Link
              href="/search?q=Foodo%20Triplink"
              className="button secondary"
            >
              Add Food + Transport
            </Link>
          </div>
          <div className="metrics">
            <div className="metric">
              <strong>{event.price}</strong>
              <span>Ticket Starting Price</span>
            </div>
            <div className="metric">
              <strong>{event.location}</strong>
              <span>Venue</span>
            </div>
            <div className="metric">
              <strong>{event.date}</strong>
              <span>Date</span>
            </div>
            <div className="metric">
              <strong>Realtime</strong>
              <span>Comments, likes, orders</span>
            </div>
          </div>
        </div>
      </section>
      <EventCommunityChat eventSlug={event.slug} eventTitle={event.title} />
      <ModuleTable
        title="Event-Day Add Ons"
        columns={["Service", "Status", "Realtime Table"]}
        rows={[
          ["Ticketing", "Ready", "ticket_orders"],
          ["Foodo Pre-Orders", "Ready", "food_orders"],
          ["Triplink Transport", "Ready", "transport_bookings"],
          ["Merchandise", "Ready", "merchandise_orders"],
        ]}
      />
    </>
  );
}
