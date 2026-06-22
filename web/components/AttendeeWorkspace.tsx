'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CalendarDays, ChevronRight, Gift, MapPin, QrCode, Ticket, UserRound } from 'lucide-react';

const tickets = [
  { event: 'Blankets & Wine Nairobi', date: '4 Jul 2026', venue: 'Uhuru Gardens', type: 'Early Bird', code: 'TK-BW-8F42', status: 'Upcoming' },
  { event: 'Koroga Festival 2025', date: '18 Jul 2026', venue: 'Carnivore Grounds', type: 'VIP', code: 'TK-KR-191Q', status: 'Upcoming' },
];

export function AttendeeWorkspace({ module }: { module: string }) {
  if (module === 'tickets') return <TicketWallet />;
  return <AttendeeProfile />;
}

function TicketWallet() {
  const [tab, setTab] = useState('Upcoming');
  const [selected, setSelected] = useState<string | null>(null);
  const visible = tab === 'Upcoming' ? tickets : [];
  return <div className="attendee-workspace"><header className="attendee-header"><div><p className="section-kicker">Your wallet</p><h1>Every pass, ready when you are.</h1><p>Tickets, Foodo orders, and Triplink passes live in one event-day wallet.</p></div><Link href="/search" className="button">Find events</Link></header><div className="wallet-tabs">{['Upcoming', 'Past', 'Transferred', 'Cancelled', 'Refunds'].map((item) => <button className={tab === item ? 'active' : ''} key={item} onClick={() => setTab(item)}>{item}</button>)}</div><section className="ticket-wallet-list">{visible.map((ticket) => <article className="wallet-ticket" key={ticket.code}><div className="wallet-ticket-head"><div><span className="status good">{ticket.status}</span><h2>{ticket.event}</h2><p><CalendarDays size={14} />{ticket.date}<MapPin size={14} />{ticket.venue}</p></div><button type="button" className="wallet-qr-button" onClick={() => setSelected(selected === ticket.code ? null : ticket.code)}><QrCode size={22} />View QR</button></div><div className="wallet-ticket-meta"><span>{ticket.type}</span><span>Order {ticket.code}</span><span>Foodo + Triplink available</span></div>{selected === ticket.code && <div className="ticket-qr-panel"><div className="qr-pattern" aria-label="Ticket QR code">{Array.from({ length: 49 }, (_, index) => <i className={index % 3 === 0 || index % 7 === 0 ? 'filled' : ''} key={index} />)}</div><div><strong>Keep this code private</strong><p>Show it only at the event gate. Your Foodo and Triplink passes will appear here when booked.</p><Link className="text-link" href="/communities/blankets-and-wine-nairobi">Open event community <ChevronRight size={15} /></Link></div></div>}</article>)}{visible.length === 0 && <div className="attendee-empty"><Ticket size={26} /><strong>No {tab.toLowerCase()} tickets</strong><p>Your completed ticket actions will appear here.</p></div>}</section></div>;
}

function AttendeeProfile() {
  return <div className="attendee-workspace"><header className="attendee-header"><div><p className="section-kicker">Your profile</p><h1>Make Tokea yours.</h1><p>Choose the events, communities, and experiences you want more of.</p></div></header><section className="profile-overview"><div className="profile-avatar"><UserRound size={32} /></div><div><h2>Tokea Demo Attendee</h2><p>0700 000 002 · Nairobi</p><p className="profile-bio">Music, food, city culture, and good plans with good people.</p></div><button type="button" className="button secondary">Edit profile</button></section><div className="profile-stats"><article><strong>7</strong><span>Events attended</span></article><article><strong>9</strong><span>Saved events</span></article><article><strong>1,240</strong><span>Reward points</span></article><article><strong>12</strong><span>Following</span></article></div><section className="profile-rewards"><Gift size={24} /><div><span>TOKEA REWARDS</span><h2>1,240 points available</h2><p>Earn points when you attend, share, review, pre-order food, or book transport.</p></div><Link href="/dashboard/attendee/tickets" className="button secondary">View wallet</Link></section></div>;
}
