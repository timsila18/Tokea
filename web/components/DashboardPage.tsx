import Link from 'next/link';
import { ReactNode } from 'react';
import { RealtimePulse } from '@/components/RealtimePulse';

type Tile = {
  label: string;
  value: string;
  tone?: 'good' | 'warn';
};

export function DashboardPage({
  title,
  description,
  tiles,
  children,
}: {
  title: string;
  description: string;
  tiles: Tile[];
  children?: ReactNode;
}) {
  return (
    <>
      <div className="topbar">
        <div>
          <h1 style={{ fontSize: 42 }}>{title}</h1>
          <p>{description}</p>
        </div>
        <Link href="/search" className="button secondary">Global Search</Link>
      </div>
      <div className="metrics">
        {tiles.map((tile) => (
          <div className="metric" key={tile.label}>
            <strong>{tile.value}</strong>
            <span>{tile.label}</span>
          </div>
        ))}
      </div>
      {children}
      <section className="section panel">
        <h2>Realtime Synchronization</h2>
        <div className="grid">
          {['ticket_orders', 'notifications', 'workspace_messages'].map((table) => (
            <RealtimePulse key={table} table={table} />
          ))}
        </div>
      </section>
    </>
  );
}
