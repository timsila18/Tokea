import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSignedInUser } from "@/lib/authz";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const eventSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(2).max(180),
  description: z.string().max(4000).optional(),
  venue: z.string().min(2).max(180),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime().optional(),
});

const publishSchema = z.object({
  id: z.string().uuid(),
  action: z.enum(["publish"]),
});

const communityChannels = [
  ["general", "General", 10],
  ["announcements", "Announcements", 20],
  ["questions", "Questions", 30],
  ["photos", "Photos", 40],
  ["networking", "Networking", 50],
  ["transport", "Transport", 60],
  ["food", "Food", 70],
  ["support", "Support", 80],
] as const;

async function ensureEventCommunity(eventId: string, eventTitle: string) {
  const admin = createSupabaseAdminClient();
  const { data: existing, error: existingError } = await admin
    .from("event_communities")
    .select("id")
    .eq("event_id", eventId)
    .maybeSingle();
  if (existingError) throw existingError;

  let communityId = existing?.id as string | undefined;
  if (!communityId) {
    const { data, error } = await admin
      .from("event_communities")
      .insert({
        event_id: eventId,
        title: `${eventTitle} Community`,
        rules: "Respect attendees, organizers, vendors, and staff.",
      })
      .select("id")
      .single();
    if (error || !data)
      throw error ?? new Error("Unable to create event community.");
    communityId = data.id as string;
  }

  const { error } = await admin.from("community_channels").upsert(
    communityChannels.map(([kind, name, display_order]) => ({
      community_id: communityId,
      kind,
      name,
      display_order,
    })),
    { onConflict: "community_id,kind" },
  );
  if (error) throw error;
}

export async function GET() {
  const auth = await requireSignedInUser();
  if ("error" in auth) return auth.error;

  const { data, error } = await auth.supabase
    .from("events")
    .select("id, title, status, starts_at")
    .order("starts_at", { ascending: true });
  if (error)
    return NextResponse.json(
      { error: "Unable to load your events." },
      { status: 400 },
    );
  return NextResponse.json({ events: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireSignedInUser(request);
  if ("error" in auth) return auth.error;
  const parsed = eventSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { error: "Enter a valid event name, venue, and start date." },
      { status: 400 },
    );

  const { data: organizer } = await auth.supabase
    .from("organizer_profiles")
    .select("id")
    .eq("profile_id", auth.user.id)
    .maybeSingle();
  if (!organizer)
    return NextResponse.json(
      { error: "Your organizer profile is not ready yet." },
      { status: 403 },
    );
  const payload = {
    organizer_id: organizer.id,
    title: parsed.data.title.trim(),
    description: parsed.data.description?.trim() || null,
    location_name: parsed.data.venue.trim(),
    venue: parsed.data.venue.trim(),
    starts_at: parsed.data.startsAt,
    ends_at: parsed.data.endsAt ?? null,
    status: "draft" as const,
  };
  const query = parsed.data.id
    ? auth.supabase
        .from("events")
        .update(payload)
        .eq("id", parsed.data.id)
        .select("id, share_slug")
        .single()
    : auth.supabase
        .from("events")
        .insert(payload)
        .select("id, share_slug")
        .single();
  const { data, error } = await query;
  if (error || !data)
    return NextResponse.json(
      { error: "Unable to save the event draft." },
      { status: 400 },
    );
  return NextResponse.json({
    ok: true,
    event: data,
    message: "Draft saved to your organizer workspace.",
  });
}

export async function PATCH(request: Request) {
  const auth = await requireSignedInUser(request);
  if ("error" in auth) return auth.error;

  const parsed = publishSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return NextResponse.json(
      { error: "Choose a valid event to publish." },
      { status: 400 },
    );

  const { data: organizer } = await auth.supabase
    .from("organizer_profiles")
    .select("id")
    .eq("profile_id", auth.user.id)
    .maybeSingle();
  if (!organizer)
    return NextResponse.json(
      { error: "Your organizer profile is not ready yet." },
      { status: 403 },
    );

  const admin = createSupabaseAdminClient();
  const { data: event, error: eventError } = await admin
    .from("events")
    .select("id, organizer_id, title, share_slug, starts_at, location_name")
    .eq("id", parsed.data.id)
    .eq("organizer_id", organizer.id)
    .maybeSingle();

  if (eventError || !event) {
    return NextResponse.json(
      { error: "Event not found in your organizer workspace." },
      { status: 404 },
    );
  }

  if (!event.starts_at || !event.location_name) {
    return NextResponse.json(
      { error: "Add the event date, time, and venue before publishing." },
      { status: 400 },
    );
  }

  const { data: updated, error: updateError } = await admin
    .from("events")
    .update({ status: "published", updated_at: new Date().toISOString() })
    .eq("id", event.id)
    .select("id, share_slug, status")
    .single();

  if (updateError || !updated) {
    return NextResponse.json(
      { error: updateError?.message ?? "Unable to publish this event." },
      { status: 400 },
    );
  }

  try {
    await ensureEventCommunity(event.id, event.title);
  } catch (communityError) {
    return NextResponse.json(
      {
        error:
          communityError instanceof Error
            ? communityError.message
            : "Unable to prepare event community.",
      },
      { status: 400 },
    );
  }

  return NextResponse.json({
    ok: true,
    event: updated,
    url: `/events/${updated.share_slug}`,
    message: "Event published successfully.",
  });
}
