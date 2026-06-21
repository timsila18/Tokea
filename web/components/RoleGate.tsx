'use client';

import { ReactNode, useEffect, useState } from 'react';
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
  const [status, setStatus] = useState<'checking' | 'allowed' | 'denied'>('checking');
  const [dashboardHref, setDashboardHref] = useState('/dashboard/attendee');

  useEffect(() => {
    async function checkRole() {
      const response = await fetch('/api/auth/session');
      if (response.status === 401) {
        router.replace('/login');
        return;
      }
      if (!response.ok) {
        setStatus('denied');
        return;
      }
      const { user } = await response.json();
      const role = user.role as AppRole;
      const dashboard = dashboardForRole(role);
      setDashboardHref(dashboard);
      setStatus(allowedRoles.includes(role) ? 'allowed' : 'denied');
    }

    checkRole();
  }, [allowedRoles, router]);

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
