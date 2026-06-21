'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';
import { dashboardForRole } from '@/components/RoleAwareSidebar';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

type RoleGateProps = {
  allowedRoles: string[];
  children: ReactNode;
};

export function RoleGate({ allowedRoles, children }: RoleGateProps) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [status, setStatus] = useState<'checking' | 'allowed' | 'denied'>('checking');
  const [dashboardHref, setDashboardHref] = useState('/dashboard/attendee');

  useEffect(() => {
    async function checkRole() {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) {
        router.replace('/login');
        return;
      }

      const { data: roleRow } = await supabase.from('users').select('role').eq('id', user.id).maybeSingle();
      const role = roleRow?.role ?? user.user_metadata?.role ?? 'attendee';
      const dashboard = dashboardForRole(role);
      setDashboardHref(dashboard);
      setStatus(allowedRoles.includes(role) ? 'allowed' : 'denied');
    }

    checkRole();
  }, [allowedRoles, router, supabase]);

  if (status === 'checking') {
    return (
      <section className="section panel access-panel">
        <h1>Checking access...</h1>
        <p>Opening the correct Tokea workspace for your account.</p>
      </section>
    );
  }

  if (status === 'denied') {
    return (
      <section className="section panel access-panel">
        <ShieldAlert size={34} />
        <h1>This workspace is not available for your account.</h1>
        <p>Your login is working, but this page belongs to a different account type.</p>
        <Link className="button" href={dashboardHref}>Go to My Dashboard</Link>
      </section>
    );
  }

  return children;
}
