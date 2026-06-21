import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function requireSignedInUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      error: NextResponse.json({ error: 'Authentication required' }, { status: 401 }),
    };
  }

  return { supabase, user };
}

export async function requireSuperAdmin() {
  const auth = await requireSignedInUser();
  if ('error' in auth) {
    return auth;
  }

  const { data, error } = await auth.supabase.from('users').select('role').eq('id', auth.user.id).maybeSingle();

  if (error || data?.role !== 'super_admin') {
    return {
      error: NextResponse.json({ error: 'Super admin access required' }, { status: 403 }),
    };
  }

  return auth;
}
