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
import { dashboardForRole, navItems, normalizeRole, roleLabels, type AppRole } from '@/lib/roles';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

export function RoleAwareSidebar() {
  const pathname = usePathname();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [email, setEmail] = useState<string | null>(null);
  const [fullName, setFullName] = useState('Guest');
  const [role, setRole] = useState<AppRole>('attendee');

  useEffect(() => {
    let mounted = true;

    async function loadIdentity() {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!mounted) return;

      setEmail(user?.email ?? null);
      if (!user) {
        setFullName('Guest');
        setRole('attendee');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .maybeSingle();
      const { data: userRole } = await supabase.from('users').select('role').eq('id', user.id).maybeSingle();
      if (!mounted) return;

      setFullName(profile?.full_name ?? user.user_metadata?.full_name ?? user.email ?? 'Tokea User');
      // UI personalization only. Server authorization still uses database-backed checks.
      setRole(normalizeRole(userRole?.role ?? profile?.role ?? user.user_metadata?.role));
    }

    loadIdentity();
    const { data: listener } = supabase.auth.onAuthStateChange(() => loadIdentity());

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  const visibleNav = navItems.filter((item) => !item.roles || item.roles.includes(role));
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
