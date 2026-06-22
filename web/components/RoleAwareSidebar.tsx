'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LogIn,
  LogOut,
  Menu,
  UserPlus,
} from 'lucide-react';
import { dashboardForRole, navigationForRole, roleLabels, type AppRole } from '@/lib/roles';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

export function RoleAwareSidebar() {
  const pathname = usePathname();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [email, setEmail] = useState<string | null>(null);
  const [fullName, setFullName] = useState('Guest');
  const [role, setRole] = useState<AppRole>('attendee');

  useEffect(() => {
    let mounted = true;
    let retryId: number | undefined;

    async function loadIdentity(retry = true) {
      const response = await fetch('/api/auth/session', {
        cache: 'no-store',
        credentials: 'same-origin',
      });
      if (!mounted) return;
      if (!response.ok) {
        if (retry) {
          retryId = window.setTimeout(() => loadIdentity(false), 800);
          return;
        }
        setEmail(null);
        setFullName('Guest');
        setRole('attendee');
        return;
      }
      const { user } = await response.json();
      if (!mounted) return;
      setEmail(user.email);
      setFullName(user.fullName);
      setRole(user.role);
    }

    loadIdentity();
    const handleAuthChanged = () => {
      void loadIdentity();
    };
    window.addEventListener('tokea-auth-changed', handleAuthChanged);

    return () => {
      mounted = false;
      if (retryId) window.clearTimeout(retryId);
      window.removeEventListener('tokea-auth-changed', handleAuthChanged);
    };
  }, [pathname]);

  async function logout() {
    await supabase.auth.signOut();
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  }

  const visibleNav = navigationForRole(role);
  const initials = fullName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className="sidebar">
      <div className="brand-block">
        <div>
          <Link href="/" className="brand">Tokea</Link>
          <div className="tagline">Don&apos;t Hear About It. Tokea.</div>
        </div>
        <button className="icon-button ghost" aria-label="Collapse navigation" type="button">
          <Menu size={19} />
        </button>
      </div>
      <nav className="nav" aria-label="Main navigation">
        {visibleNav.map(({ label, href, icon: Icon }) => (
          <Link key={href} href={href} className={pathname === href ? 'active' : undefined}>
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
      <Link className="sidebar-user" href={email ? dashboardForRole(role) : '/login'}>
        <div className="avatar">{initials || 'TK'}</div>
        <div>
          <strong>{fullName}</strong>
          <span>{email ? roleLabels[role] : 'Not signed in'}</span>
        </div>
      </Link>
      {email ? (
        <div className="auth-controls signed-in">
          <span>{email}</span>
          <button type="button" onClick={logout}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      ) : (
        <div className="auth-controls">
          <Link href="/login">
            <LogIn size={16} />
            Login
          </Link>
          <Link href="/signup">
            <UserPlus size={16} />
            Sign up
          </Link>
        </div>
      )}
    </aside>
  );
}
