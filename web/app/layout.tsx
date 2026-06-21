import type { Metadata } from 'next';
import { RoleAwareSidebar } from '@/components/RoleAwareSidebar';
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <RoleAwareSidebar />
          <main className="page">{children}</main>
        </div>
      </body>
    </html>
  );
}
