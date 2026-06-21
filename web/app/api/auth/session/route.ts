import { NextResponse } from 'next/server';
import { requireSignedInUser } from '@/lib/authz';
import { normalizeRole } from '@/lib/roles';

export async function GET() {
  const auth = await requireSignedInUser();
  if ('error' in auth) return auth.error;

  const [{ data: roleRow }, { data: profile }] = await Promise.all([
    auth.supabase.from('users').select('role').eq('id', auth.user.id).maybeSingle(),
    auth.supabase.from('profiles').select('full_name').eq('id', auth.user.id).maybeSingle(),
  ]);
  const role = normalizeRole(roleRow?.role ?? auth.user.app_metadata?.role);

  return NextResponse.json({
    user: {
      email: auth.user.email ?? null,
      fullName: profile?.full_name ?? auth.user.user_metadata?.full_name ?? auth.user.email ?? 'Tokea User',
      role,
    },
  });
}
