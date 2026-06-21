import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSuperAdmin } from '@/lib/authz';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

const payloadSchema = z.object({
  profileId: z.string().uuid(),
  title: z.string().min(1).max(120),
  body: z.string().max(500).optional(),
  data: z.record(z.unknown()).optional(),
});

export async function POST(request: Request) {
  const auth = await requireSuperAdmin();
  if ('error' in auth) {
    return auth.error;
  }

  const parsed = payloadSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid notification payload' }, { status: 400 });
  }

  let supabase;
  try {
    supabase = createSupabaseAdminClient();
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 503 });
  }

  const { error } = await supabase.from('notifications').insert({
    profile_id: parsed.data.profileId,
    title: parsed.data.title,
    body: parsed.data.body ?? null,
    data: parsed.data.data ?? {},
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
