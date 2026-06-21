import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { dashboardForRole, normalizeRole } from '@/lib/roles';
import { publicEnv } from '@/lib/env';

const loginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
});

function isTrustedOrigin(origin: string | null) {
  if (!origin) return true;
  return ['https://tokeaevents.co.ke', 'https://www.tokeaevents.co.ke', publicEnv.NEXT_PUBLIC_SITE_URL].includes(origin);
}

export async function POST(request: NextRequest) {
  if (!isTrustedOrigin(request.headers.get('origin'))) {
    return NextResponse.json({ error: 'Untrusted request origin' }, { status: 403 });
  }

  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Enter a valid email address and password.' }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  const supabase = createServerClient(publicEnv.NEXT_PUBLIC_SUPABASE_URL, publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookies) => cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
    },
  });

  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email.trim().toLowerCase(),
    password: parsed.data.password,
  });
  if (error || !data.user) {
    return NextResponse.json({ error: 'Incorrect email address or password.' }, { status: 401 });
  }

  const { data: roleRow } = await supabase.from('users').select('role').eq('id', data.user.id).maybeSingle();
  const role = normalizeRole(roleRow?.role ?? data.user.app_metadata?.role);
  return NextResponse.json(
    { ok: true, dashboard: dashboardForRole(role) },
    { headers: response.headers },
  );
}
