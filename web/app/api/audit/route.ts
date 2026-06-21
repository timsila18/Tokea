import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

const auditSchema = z.object({
  actionType: z.enum(['create', 'update', 'delete', 'approve', 'reject', 'refund', 'transfer', 'payout', 'verification', 'role_change', 'system_setting', 'security_event']),
  targetTable: z.string().min(1).max(80),
  targetId: z.string().uuid().optional(),
  summary: z.string().min(1).max(300),
  metadata: z.record(z.unknown()).optional(),
});

export async function POST(request: Request) {
  const parsed = auditSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid audit payload' }, { status: 400 });
  }

  let supabase;
  try {
    supabase = createSupabaseAdminClient();
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 503 });
  }

  const { error } = await supabase.from('audit_logs').insert({
    action_type: parsed.data.actionType,
    target_table: parsed.data.targetTable,
    target_id: parsed.data.targetId ?? null,
    summary: parsed.data.summary,
    metadata: parsed.data.metadata ?? {},
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
