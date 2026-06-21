'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { dashboardForRole } from '@/lib/roles';

export default function DashboardRouterPage() {
  const router = useRouter();
  useEffect(() => {
    async function routeUser() {
      const response = await fetch('/api/auth/session');
      if (!response.ok) {
        router.replace('/login');
        return;
      }
      const { user } = await response.json();
      router.replace(dashboardForRole(user.role));
    }

    routeUser();
  }, [router]);

  return (
    <section className="section panel">
      <h1>Opening your dashboard...</h1>
      <p>Routing you to the right Tokea workspace.</p>
    </section>
  );
}
