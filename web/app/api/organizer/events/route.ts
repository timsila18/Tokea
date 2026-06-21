import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSignedInUser } from '@/lib/authz';

const eventSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(2).max(180),
  description: z.string().max(4000).optional(),
  venue: z.string().min(2).max(180),
  startsAt: z.string().datetime(),
});

export async function GET() {
  const auth = await requireSignedInUser();
  if ('error' in auth) return auth.error;

  const { data, error } = await auth.supabase
    .from('events')
    .select('id, title, status, starts_at')
    .order('starts_at', { ascending: true });
  if (error) return NextResponse.json({ error: 'Unable to load your events.' }, { status: 400 });
  return NextResponse.json({ events: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireSignedInUser(request);
  if ('error' in auth) return auth.error;
  const parsed = eventSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Enter a valid event name, venue, and start date.' }, { status: 400 });

  const { data: organizer } = await auth.supabase.from('organizer_profiles').select('id').eq('profile_id', auth.user.id).maybeSingle();
  if (!organizer) return NextResponse.json({ error: 'Your organizer profile is not ready yet.' }, { status: 403 });
  const payload = { organizer_id: organizer.id, title: parsed.data.title.trim(), description: parsed.data.description?.trim() || null, location_name: parsed.data.venue.trim(), venue: parsed.data.venue.trim(), starts_at: parsed.data.startsAt, status: 'draft' as const };
  const query = parsed.data.id
    ? auth.supabase.from('events').update(payload).eq('id', parsed.data.id).select('id').single()
    : auth.supabase.from('events').insert(payload).select('id').single();
  const { data, error } = await query;
  if (error || !data) return NextResponse.json({ error: 'Unable to save the event draft.' }, { status: 400 });
  return NextResponse.json({ ok: true, event: data, message: 'Draft saved to your organizer workspace.' });
}
