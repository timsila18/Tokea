import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

const paramsSchema = z.object({
  bankId: z.string().uuid(),
});

export async function GET(_request: Request, { params }: { params: Promise<{ bankId: string }> }) {
  const parsed = paramsSchema.safeParse(await params);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid bank id' }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('kenya_bank_branches')
    .select('id, branch_code, name, city')
    .eq('bank_id', parsed.data.bankId)
    .eq('is_active', true)
    .order('name');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ branches: data });
}
