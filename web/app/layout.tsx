import type { Metadata } from 'next';
import Link from 'next/link';
import {
  CalendarDays,
  Menu,
  Plane,
  Shield,
  Ticket,
  Utensils,
  Users,
  WalletCards,
} from 'lucide-react';
import { AuthControls } from '@/components/AuthControls';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tokea.co.ke'),
  title: {
    default: "Tokea | Don't Hear About It. Tokea.",
    template: '%s | Tokea',
  },
  description: 'Africa event discovery, ticketing, event operations, food, transport, workforce, and attendee experience platform.',
  openGraph: {
    type: 'website',
    siteName: 'Tokea',
    title: "Tokea | Don't Hear About It. Tokea.",
    description: 'Discover, manage, attend, and operate premium events across Africa.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tokea',
    description: "Don't Hear About It. Tokea.",
  },
};

const nav = [
  { label: 'Public', href: '/', icon: WalletCards },
  { label: 'Events', href: '/events/nairobi-jazz-festival-2027', icon: CalendarDays },
  { label: 'Tickets', href: '/dashboard/attendee', icon: Ticket },
  { label: 'Foodo', href: '/dashboard/vendor', icon: Utensils },
  { label: 'Triplink', href: '/search', icon: Plane },
  { label: 'Organizer', href: '/dashboard/organizer', icon: Users },
  { label: 'Admin', href: '/admin', icon: Shield },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <aside className="sidebar">
            <div className="brand-block">
              <div>
                <Link href="/" className="brand">Tokea</Link>
                <div className="tagline">Don&apos;t Hear About It. Tokea.</div>
              </div>
              <button className="icon-button ghost" aria-label="Collapse navigation">
                <Menu size={19} />
              </button>
            </div>
            <nav className="nav" aria-label="Main navigation">
              {nav.map(({ label, href, icon: Icon }, index) => (
                <Link key={href} href={href} className={index === 0 ? 'active' : undefined}>
                  <Icon size={20} />
                  <span>{label}</span>
                </Link>
              ))}
            </nav>
            <div className="sidebar-user">
              <div className="avatar">TK</div>
              <div>
                <strong>Tokea Admin</strong>
                <span>Super Admin</span>
              </div>
            </div>
            <AuthControls />
          </aside>
          <main className="page">{children}</main>
        </div>
      </body>
    </html>
  );
}
