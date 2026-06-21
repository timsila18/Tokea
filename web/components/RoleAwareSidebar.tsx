'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CalendarDays,
  LogIn,
  LogOut,
  Menu,
  Plane,
  Shield,
  Ticket,
  UserPlus,
  Users,
  Utensils,
  WalletCards,
} from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

type AppRole = 'super_admin' | 'organizer' | 'attendee' | 'vendor' | 'event_staff';

type NavItem = {
  label: string;
  href: string;
  icon: typeof WalletCards;
  roles?: AppRole[];
};

const navItems: NavItem[] = [
  { label: 'Public', href: '/', icon: WalletCards },
  { label: 'Events', href: '/events/blankets-and-wine-nairobi', icon: CalendarDays },
  { label: 'Tickets', href: '/dashboard/attendee', icon: Ticket, roles: ['attendee', 'super_admin'] },
  { label: 'Foodo', href: '/dashboard/vendor', icon: Utensils, roles: ['vendor', 'super_admin'] },
  { label: 'Triplink', href: '/search?q=Triplink', icon: Plane },
  { label: 'Organizer', href: '/dashboard/organizer', icon: Users, roles: ['organizer', 'super_admin'] },
  { label: 'Staff', href: '/dashboard/staff', icon: Users, roles: ['event_staff', 'super_admin'] },
  { label: 'Admin', href: '/admin', icon: Shield, roles: ['super_admin'] },
];

const roleLabels: Record<AppRole, string> = {
  super_admin: 'Super Admin',
  organizer: 'Organizer',
  attendee: 'Attendee',
  vendor: 'Vendor',
  event_staff: 'Event Staff',
};

const roleDashboards: Record<AppRole, string> = {
  super_admin: '/admin',
  organizer: '/dashboard/organizer',
  attendee: '/dashboard/attendee',
  vendor: '/dashboard/vendor',
  event_staff: '/dashboard/staff',
};

export function dashboardForRole(role?: string | null) {
  return roleDashboards[(role as AppRole) || 'attendee'] ?? '/dashboard/attendee';
}

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
      setRole(((userRole?.role ?? profile?.role ?? user.user_metadata?.role ?? 'attendee') as AppRole) || 'attendee');
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
