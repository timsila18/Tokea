import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSignedInUser } from '@/lib/authz';

const postSchema = z.object({
  channel: z.string().min(2).max(40).default('Photos'),
  body: z.string().max(1200).optional(),
  mediaUrls: z.array(z.string().url()).max(8).default([]),
});

const channelKindByName: Record<string, string> = {
  general: 'general',
  announcements: 'announcements',
  questions: 'questions',
  photos: 'photos',
  networking: 'networking',
  transport: 'transport',
  food: 'food',
  support: 'support',
};

function slugify(value: string) {
  return value.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function initials(name?: string | null) {
  const parts = (name ?? 'Tokea Attendee').trim().split(/\s+/).filter(Boolean);
  return `${parts[0]?.[0] ?? 'T'}${parts[1]?.[0] ?? 'A'}`.toUpperCase();
}

async function findCommunity(auth: Awaited<ReturnType<typeof requireSignedInUser>>, slug: string) {
  if ('error' in auth) return null;

  const { data: directEvent } = await auth.supabase
    .from('events')
    .select('id,title,share_slug')
    .eq('share_slug', slug)
    .maybeSingle();

  let event = directEvent;
  if (!event) {
    const { data: events } = await auth.supabase
      .from('events')
      .select('id,title,share_slug')
      .order('starts_at', { ascending: false })
      .limit(100);
    event = (events ?? []).find((item) => slugify(item.title) === slug) ?? null;
  }

  if (!event) return null;

  const { data: community } = await auth.supabase
    .from('event_communities')
    .select('id,title')
    .eq('event_id', event.id)
    .maybeSingle();

  return community ? { event, community } : null;
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const auth = await requireSignedInUser();
  if ('error' in auth) return auth.error;

  const { slug } = await params;
  const resolved = await findCommunity(auth, slug);
  if (!resolved) return NextResponse.json({ posts: [], connected: false });

  const { data: channels, error: channelError } = await auth.supabase
    .from('community_channels')
    .select('id,name,kind')
    .eq('community_id', resolved.community.id);
  if (channelError) return NextResponse.json({ error: 'Unable to load community channels.' }, { status: 400 });

  const channelIds = (channels ?? []).map((channel) => channel.id);
  if (channelIds.length === 0) return NextResponse.json({ posts: [], connected: true });

  const { data: rows, error } = await auth.supabase
    .from('community_posts')
    .select('id,channel_id,body,media_urls,pinned_at,created_at,profiles(full_name)')
    .in('channel_id', channelIds)
    .order('created_at', { ascending: false })
    .limit(60);
  if (error) return NextResponse.json({ error: 'Unable to load community posts.' }, { status: 400 });

  const channelById = new Map((channels ?? []).map((channel) => [channel.id, channel.name]));
  const posts = (rows ?? []).map((row) => {
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    const author = profile?.full_name ?? 'Tokea Attendee';
    return {
      id: row.id,
      channel: channelById.get(row.channel_id) ?? 'General',
      author,
      initials: initials(author),
      time: 'Just now',
      body: row.body,
      likes: 0,
      comments: [],
      pinned: Boolean(row.pinned_at),
      mediaUrls: row.media_urls ?? [],
    };
  });

  return NextResponse.json({ posts, connected: true });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const auth = await requireSignedInUser(request);
  if ('error' in auth) return auth.error;

  const { slug } = await params;
  const parsed = postSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Write a caption or attach photos before posting.' }, { status: 400 });

  const resolved = await findCommunity(auth, slug);
  if (!resolved) return NextResponse.json({ error: 'This event community is not connected to the live database yet.' }, { status: 404 });

  const channelKind = channelKindByName[parsed.data.channel.toLowerCase()] ?? 'photos';
  const { data: channel, error: channelError } = await auth.supabase
    .from('community_channels')
    .select('id,name')
    .eq('community_id', resolved.community.id)
    .eq('kind', channelKind)
    .maybeSingle();
  if (channelError || !channel) return NextResponse.json({ error: 'This community channel is not ready yet.' }, { status: 400 });

  const body = parsed.data.body?.trim() || (parsed.data.mediaUrls.length > 0 ? 'Shared event photos.' : '');
  if (!body && parsed.data.mediaUrls.length === 0) return NextResponse.json({ error: 'Write a caption or attach photos before posting.' }, { status: 400 });

  const { data: profile } = await auth.supabase.from('profiles').select('full_name').eq('id', auth.user.id).maybeSingle();
  const { data: post, error } = await auth.supabase
    .from('community_posts')
    .insert({
      channel_id: channel.id,
      profile_id: auth.user.id,
      body,
      media_urls: parsed.data.mediaUrls,
    })
    .select('id,body,media_urls,created_at')
    .single();

  if (error || !post) return NextResponse.json({ error: error?.message ?? 'Unable to publish this post.' }, { status: 400 });

  const author = profile?.full_name ?? 'You';
  return NextResponse.json({
    post: {
      id: post.id,
      channel: channel.name,
      author,
      initials: initials(author),
      time: 'Just now',
      body: post.body,
      likes: 0,
      comments: [],
      mediaUrls: post.media_urls ?? [],
    },
  });
}
