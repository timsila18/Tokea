'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FileWarning,
  Megaphone,
  ShieldAlert,
  Sparkles,
  UsersRound,
} from 'lucide-react';

const readinessItems = [
  ['Venue confirmed', true],
  ['Ticket types created', true],
  ['Poster uploaded', true],
  ['Marketing content posted', true],
  ['Staff assigned', false],
  ['Security assigned', false],
  ['Food vendors approved', true],
  ['Transport routes configured', false],
  ['Sponsors secured', true],
  ['Budget created', true],
  ['Emergency plan uploaded', false],
  ['Solco workspace active', true],
  ['Event schedule completed', true],
] as const;

const urgentActions = [
  { title: 'Assign security leads', detail: 'Security coverage is not confirmed for Nairobi Gospel Night.', priority: 'Critical', due: 'Today', href: '/dashboard/organizer/staff' },
  { title: 'Configure transport routes', detail: 'No pickup points are live for an event with 3,000 expected attendees.', priority: 'High', due: 'Tomorrow', href: '/dashboard/organizer/triplink' },
  { title: 'Upload emergency plan', detail: 'The venue safety pack is still missing.', priority: 'High', due: 'In 2 days', href: '/dashboard/organizer/documents' },
  { title: 'Review vendor applications', detail: '3 service vendor applications are waiting for approval.', priority: 'Medium', due: 'This week', href: '/dashboard/organizer/vendors' },
];

const advisorItems = [
  { text: 'Ticket sales are 35% below the weekly target. Extend Early Bird pricing for 48 hours.', reason: 'Sales velocity is below the plan.', action: 'Open ticketing', href: '/dashboard/organizer/ticketing', impact: 'High impact' },
  { text: 'VIP is selling 2.4x faster than Regular. Add a second VIP tier before it sells out.', reason: 'Strong premium demand.', action: 'Create tier', href: '/dashboard/organizer/ticketing', impact: 'Revenue opportunity' },
  { text: 'Community interest is high but purchases are soft. Run a WhatsApp promo campaign.', reason: '1,862 interested vs 1,245 sold.', action: 'Build campaign', href: '/dashboard/organizer/marketing', impact: 'Conversion lift' },
];

function scoreTone(score: number) {
  if (score >= 90) return 'Ready';
  if (score >= 70) return 'On Track';
  if (score >= 40) return 'Needs Attention';
  return 'Critical';
}

export function OrganizerCommandCenter() {
  const [selectedAdvisor, setSelectedAdvisor] = useState(0);
  const [actionFilter, setActionFilter] = useState<'all' | 'critical'>('all');
  const readiness = useMemo(() => Math.round((readinessItems.filter(([, complete]) => complete).length / readinessItems.length) * 100), []);
  const actions = actionFilter === 'critical' ? urgentActions.filter((action) => action.priority === 'Critical') : urgentActions;
  const activeAdvice = advisorItems[selectedAdvisor];

  return (
    <div className="organizer-command">
      <header className="organizer-header">
        <div>
          <p className="section-kicker">Tokea Events Kenya</p>
          <h1>Organizer Command Center</h1>
          <p>Plan, sell, operate, and improve every event from one focused workspace.</p>
        </div>
        <div className="organizer-header-actions">
          <Link href="/dashboard/organizer/create" className="button">Create event <ArrowRight size={16} /></Link>
          <Link href="/dashboard/organizer/events" className="button secondary">My events</Link>
        </div>
      </header>

      <section className="command-grid command-hero-grid">
        <article className="organizer-panel readiness-panel">
          <div className="panel-heading"><h2>Event Readiness Score</h2><span className="status good">{scoreTone(readiness)}</span></div>
          <div className="readiness-main">
            <div className="score-ring" style={{ '--score': `${readiness * 3.6}deg` } as React.CSSProperties}><strong>{readiness}%</strong><span>Ready</span></div>
            <div><h3>Nairobi Gospel Night</h3><p>24 days remaining at KICC, Nairobi.</p><Link href="/dashboard/organizer/operations" className="text-link">Open readiness plan <ArrowRight size={15} /></Link></div>
          </div>
          <div className="readiness-list">
            {readinessItems.filter(([, complete]) => !complete).map(([label]) => <span key={label}><AlertTriangle size={14} /> {label}</span>)}
          </div>
        </article>

        <article className="organizer-panel countdown-panel">
          <div className="panel-heading"><h2>Next Event</h2><CalendarClock size={18} /></div>
          <h3>Nairobi Gospel Night</h3>
          <strong className="countdown-value">24 <span>days</span></strong>
          <p>Saturday, 15 July 2026 · KICC, Nairobi</p>
          <div className="progress-label"><span>Ticket sales</span><b>1,245 / 3,000</b></div>
          <div className="progress-track"><i style={{ width: '42%' }} /></div>
          <Link href="/dashboard/organizer/events" className="text-link">Manage event <ArrowRight size={15} /></Link>
        </article>

        <article className="organizer-panel finance-preview">
          <div className="panel-heading"><h2>Finance Snapshot</h2><CircleDollarSign size={18} /></div>
          <strong>KES 642,000</strong><span>Gross ticket revenue</span>
          <dl><div><dt>Projected profit</dt><dd>KES 284K</dd></div><div><dt>Break-even</dt><dd>68%</dd></div></dl>
          <Link href="/dashboard/organizer/finance" className="text-link">Open finance <ArrowRight size={15} /></Link>
        </article>
      </section>

      <section className="command-grid command-split-grid">
        <article className="organizer-panel urgent-panel">
          <div className="panel-heading"><h2>Urgent Actions</h2><div className="compact-tabs"><button className={actionFilter === 'all' ? 'active' : ''} onClick={() => setActionFilter('all')}>All</button><button className={actionFilter === 'critical' ? 'active' : ''} onClick={() => setActionFilter('critical')}>Critical</button></div></div>
          <div className="action-list">
            {actions.map((action) => <div className="action-row" key={action.title}><span className={`priority-dot ${action.priority.toLowerCase()}`} /><div><strong>{action.title}</strong><p>{action.detail}</p><small><Clock3 size={12} /> Due {action.due}</small></div><Link href={action.href} aria-label={`Open ${action.title}`}><ArrowRight size={16} /></Link></div>)}
          </div>
        </article>
        <article className="organizer-panel advisor-panel">
          <div className="panel-heading"><h2>AI Event Advisor</h2><Sparkles size={18} /></div>
          <p className="advisor-text">{activeAdvice.text}</p>
          <div className="advisor-reason"><span>Why this matters</span><p>{activeAdvice.reason}</p></div>
          <div className="advisor-footer"><span>{activeAdvice.impact}</span><Link href={activeAdvice.href} className="button secondary">{activeAdvice.action}</Link></div>
          <div className="advisor-dots">{advisorItems.map((item, index) => <button key={item.action} className={index === selectedAdvisor ? 'active' : ''} aria-label={`Advisor recommendation ${index + 1}`} onClick={() => setSelectedAdvisor(index)} />)}</div>
        </article>
      </section>

      <section className="command-grid command-three-grid">
        <Snapshot title="Ticket Performance" icon={<BarChart3 size={18} />} stats={[['Sold this week', '286'], ['Conversion rate', '4.8%'], ['Remaining', '1,755']]} href="/dashboard/organizer/ticketing" />
        <Snapshot title="Operations Health" icon={<CheckCircle2 size={18} />} stats={[['Tasks complete', '38 / 52'], ['Overdue', '4'], ['Approvals pending', '7']]} href="/dashboard/organizer/operations" />
        <Snapshot title="Team Readiness" icon={<UsersRound size={18} />} stats={[['Staff assigned', '18 / 24'], ['Volunteers', '12 / 20'], ['Open positions', '14']]} href="/dashboard/organizer/staff" />
      </section>

      <section className="command-grid command-two-grid">
        <article className="organizer-panel risk-panel"><div className="panel-heading"><h2>Risk Dashboard</h2><ShieldAlert size={18} /></div><div className="risk-list"><Risk level="High" text="No emergency plan uploaded" href="/dashboard/organizer/documents" /><Risk level="High" text="Transport routes not configured" href="/dashboard/organizer/triplink" /><Risk level="Medium" text="Staff coverage below plan" href="/dashboard/organizer/staff" /></div></article>
        <article className="organizer-panel milestones-panel"><div className="panel-heading"><h2>Upcoming Milestones</h2><FileWarning size={18} /></div><ol><li><b>14 days before</b><span>Confirm all staff shifts</span></li><li><b>7 days before</b><span>Lock transport and vendor manifests</span></li><li><b>3 days before</b><span>Test gate scanners and final emergency briefing</span></li></ol></article>
      </section>
    </div>
  );
}

function Snapshot({ title, icon, stats, href }: { title: string; icon: React.ReactNode; stats: string[][]; href: string }) {
  return <article className="organizer-panel snapshot-panel"><div className="panel-heading"><h2>{title}</h2>{icon}</div><dl>{stats.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><Link href={href} className="text-link">View details <ArrowRight size={15} /></Link></article>;
}

function Risk({ level, text, href }: { level: string; text: string; href: string }) {
  return <Link className="risk-row" href={href}><span className={level === 'High' ? 'risk-high' : 'risk-medium'}>{level}</span><strong>{text}</strong><ArrowRight size={15} /></Link>;
}
