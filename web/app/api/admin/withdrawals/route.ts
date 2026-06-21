import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSuperAdmin } from '@/lib/authz';

const updateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['processing', 'completed', 'rejected', 'frozen']),
  adminNotes: z.string().max(500).optional(),
});

export async function GET() {
  const auth = await requireSuperAdmin();
  if ('error' in auth) {
    return auth.error;
  }

  const { data, error } = await auth.supabase
    .from('payout_requests')
    .select('id, organizer_id, requested_by, status, amount_cents, currency, payout_method, destination_details, requested_processing_deadline, admin_notes, processed_by, processed_at, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ withdrawals: data });
}

export async function PATCH(request: Request) {
  const auth = await requireSuperAdmin();
  if ('error' in auth) {
    return auth.error;
  }

  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid withdrawal update' }, { status: 400 });
  }

  const { id, status, adminNotes } = parsed.data;
  const { data, error } = await auth.supabase
    .from('payout_requests')
    .update({
      status,
      admin_notes: adminNotes,
      processed_by: auth.user.id,
      processed_at: status === 'completed' || status === 'rejected' ? new Date().toISOString() : null,
    })
    .eq('id', id)
    .select('id, status, processed_at')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, withdrawal: data });
}
