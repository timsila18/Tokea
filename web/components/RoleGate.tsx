'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';
import { dashboardForRole, type AppRole } from '@/lib/roles';

type RoleGateProps = {
  allowedRoles: AppRole[];
  children: ReactNode;
};

export function RoleGate({ allowedRoles, children }: RoleGateProps) {
  const router = useRouter();
  const allowedKey = useMemo(() => allowedRoles.join('|'), [allowedRoles]);
  const [status, setStatus] = useState<'checking' | 'allowed' | 'denied'>('checking');
  const [dashboardHref, setDashboardHref] = useState('/dashboard/attendee');

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 12_000);

    async function checkRole() {
      try {
        setStatus('checking');
        const allowedRoleList = allowedKey.split('|') as AppRole[];
        const response = await fetch('/api/auth/session', {
          cache: 'no-store',
          credentials: 'same-origin',
          signal: controller.signal,
        });
        if (!mounted) return;
        if (response.status === 401) {
          setStatus('denied');
          window.dispatchEvent(new Event('tokea-auth-changed'));
          router.replace('/login');
          return;
        }
        if (!response.ok) {
          setStatus('denied');
          return;
        }
        const { user } = await response.json();
        if (!mounted) return;
        const role = user.role as AppRole;
        const dashboard = dashboardForRole(role);
        setDashboardHref(dashboard);
        setStatus(allowedRoleList.includes(role) ? 'allowed' : 'denied');
      } catch {
        if (!mounted) return;
        setStatus('denied');
      }
    }

    checkRole();

    return () => {
      mounted = false;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [allowedKey, router]);

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
