'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { dashboardForRole } from '@/lib/roles';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

export default function DashboardRouterPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  useEffect(() => {
    async function routeUser() {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) {
        router.replace('/login');
        return;
      }

      const { data: roleRow } = await supabase.from('users').select('role').eq('id', user.id).maybeSingle();
      router.replace(dashboardForRole(roleRow?.role ?? user.user_metadata?.role));
    }

    routeUser();
  }, [router, supabase]);

  return (
    <section className="section panel">
      <h1>Opening your dashboard...</h1>
      <p>Routing you to the right Tokea workspace.</p>
    </section>
  );
}
