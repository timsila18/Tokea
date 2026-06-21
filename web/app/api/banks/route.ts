import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('kenya_banks')
    .select('id, bank_code, name, swift_code')
    .eq('is_active', true)
    .order('name');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ banks: data });
}
