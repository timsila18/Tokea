import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { publicEnv } from '@/lib/env';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function requireSignedInUser(request?: Request) {
  const bearerToken = request?.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];
  const supabase = bearerToken
    ? createClient(publicEnv.NEXT_PUBLIC_SUPABASE_URL, publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
        global: {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
          },
        },
      })
    : await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = bearerToken ? await supabase.auth.getUser(bearerToken) : await supabase.auth.getUser();

  if (error || !user) {
    return {
      error: NextResponse.json({ error: 'Authentication required' }, { status: 401 }),
    };
  }

  return { supabase, user };
}

export async function requireSuperAdmin(request?: Request) {
  const auth = await requireSignedInUser(request);
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
