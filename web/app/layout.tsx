import type { Metadata } from 'next';
import Link from 'next/link';
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
  ['Public', '/'],
  ['Events', '/events/nairobi-jazz-festival-2027'],
  ['Reels', '/reels'],
  ['Communities', '/communities/nairobi-jazz-festival-2027'],
  ['Tickets', '/dashboard/attendee'],
  ['Organizer', '/dashboard/organizer'],
  ['Vendor', '/dashboard/vendor'],
  ['Sponsor', '/dashboard/sponsor'],
  ['Staff', '/dashboard/staff'],
  ['Admin', '/admin'],
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <aside className="sidebar">
            <Link href="/" className="brand">Tokea</Link>
            <div className="tagline">Don&apos;t Hear About It. Tokea.</div>
            <nav className="nav" aria-label="Main navigation">
              {nav.map(([label, href]) => (
                <Link key={href} href={href}>{label}</Link>
              ))}
            </nav>
          </aside>
          <main className="page">{children}</main>
        </div>
      </body>
    </html>
  );
}
