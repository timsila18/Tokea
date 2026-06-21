'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowRight, Check, Copy, Download, Plus, Save, Share2 } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

type Module = { title: string; description: string; action: string; metrics: [string, string][]; rows: [string, string, string][] };

const modules: Record<string, Module> = {
  events: { title: 'My Events', description: 'Monitor every draft, live, upcoming, completed, and cancelled event.', action: 'Create event', metrics: [['Published', '2'], ['Drafts', '1'], ['Ticket revenue', 'KES 642K']], rows: [['Nairobi Gospel Night', '15 Jul 2026 · KICC', '42% ready'], ['Campus Amapiano Festival', '30 Aug 2026 · Carnivore', 'Draft'], ['Tech Founders Summit', '12 Sep 2026 · Sarit', '61% ready']] },
  ticketing: { title: 'Ticketing', description: 'Manage ticket types, promo codes, affiliates, sales, refunds, transfers, and check-ins.', action: 'Create ticket type', metrics: [['Sold today', '64'], ['Sales this week', '286'], ['Conversion', '4.8%']], rows: [['Early Bird', '1,040 sold · KES 2,500', 'Active'], ['VIP', '205 sold · KES 6,500', 'Selling fast'], ['Regular', '0 sold · KES 3,500', 'Scheduled']] },
  marketing: { title: 'Marketing Center', description: 'Create campaigns, announcements, reels, social posts, and share-ready event links.', action: 'Create campaign', metrics: [['Reach', '86.4K'], ['Interested', '1,862'], ['Promo conversions', '198']], rows: [['Instagram reel', '24.8K views · 1.9K likes', 'Top performing'], ['WhatsApp launch', '4.2% conversion', 'Active'], ['Campus creator code', '54 ticket sales', 'Active']] },
  operations: { title: 'Operations Center', description: 'Assign work, control approvals, track deadlines, logistics, incidents, and event readiness.', action: 'Create task', metrics: [['Tasks complete', '38 / 52'], ['Overdue', '4'], ['Approvals', '7']], rows: [['Security coverage', 'Owner: Operations lead', 'Blocked'], ['Gate scanner test', 'Owner: Ticketing lead', 'Due 12 Jul'], ['Vendor confirmation', 'Owner: Vendor lead', 'In progress']] },
  staff: { title: 'Staff Management', description: 'Define roles, invite staff, assign shifts, track attendance, and connect the workforce foundation.', action: 'Invite staff', metrics: [['Required', '24'], ['Assigned', '18'], ['Shift coverage', '75%']], rows: [['Security', '6 / 8 assigned', 'Needs action'], ['Gate scanners', '4 / 4 assigned', 'Covered'], ['VIP hosts', '2 / 4 assigned', 'Needs action']] },
  volunteers: { title: 'Volunteer Management', description: 'Review applications, assign tasks, track service hours, and issue certificates.', action: 'Create opportunity', metrics: [['Applications', '31'], ['Approved', '12'], ['Hours planned', '246']], rows: [['Guest experience', '8 approved', 'Open'], ['Community support', '3 approved', 'Open'], ['Green team', '1 approved', 'Needs action']] },
  vendors: { title: 'Vendor Management', description: 'Source service vendors, request quotes, approve contracts, and track vendor deliverables.', action: 'Find vendors', metrics: [['Applications', '8'], ['Awaiting review', '3'], ['Confirmed', '5']], rows: [['Stage and sound', 'Quote received', 'Review'], ['Security provider', 'Contract pending', 'Action needed'], ['Photo and video', 'Confirmed', 'Ready']] },
  foodo: { title: 'Foodo Management', description: 'Approve food vendors, allocate stalls, review menus, and monitor food pre-orders and redemptions.', action: 'Activate Foodo', metrics: [['Approved vendors', '6'], ['Pending menus', '2'], ['Pre-orders', '184']], rows: [['Urban Bites', 'Stall A12 · Menu approved', 'Ready'], ['Mama Njeri Kitchen', 'Compliance pending', 'Review'], ['Wok House', 'Stall B02 · 64 pre-orders', 'Ready']] },
  triplink: { title: 'Triplink Management', description: 'Configure routes, pickup points, vehicles, manifests, boarding, and transport revenue.', action: 'Create route', metrics: [['Routes', '0'], ['Pickup points', '0'], ['Seats booked', '0']], rows: [['CBD express', 'Not configured', 'Action needed'], ['Thika Road', 'Not configured', 'Action needed'], ['Westlands', 'Not configured', 'Action needed']] },
  sponsors: { title: 'Sponsor Management', description: 'Build packages, send proposals, approve sponsors, and deliver every commercial commitment.', action: 'Create package', metrics: [['Secured', '2'], ['Proposals open', '4'], ['Sponsor revenue', 'KES 180K']], rows: [['Main stage partner', 'KES 120,000 · Signed', 'Ready'], ['Beverage partner', 'KES 60,000 · Signed', 'Ready'], ['Connectivity partner', 'Proposal sent', 'Follow up']] },
  finance: { title: 'Finance', description: 'Track revenue, expenses, budgets, fees, settlements, payouts, and event profit.', action: 'Create budget line', metrics: [['Gross revenue', 'KES 642K'], ['Expenses', 'KES 358K'], ['Projected profit', 'KES 284K']], rows: [['Venue deposit', 'KES 120,000', 'Paid'], ['Production', 'KES 88,000', 'On budget'], ['Marketing', 'KES 65,000', 'Under budget']] },
  analytics: { title: 'Analytics', description: 'Understand sales trends, audience growth, conversion, community activity, and partner performance.', action: 'Export report', metrics: [['Sales velocity', '+18.7%'], ['New followers', '842'], ['Community posts', '128']], rows: [['Instagram', '42% of event traffic', 'Top source'], ['WhatsApp', '26% of event traffic', 'High conversion'], ['Affiliate codes', '18% of ticket sales', 'Growing']] },
  solco: { title: 'Solco Workspace', description: 'Coordinate the event team through channels, announcements, meetings, files, and pinned decisions.', action: 'Open workspace', metrics: [['Channels', '9'], ['Unread messages', '14'], ['Meetings this week', '3']], rows: [['# operations', '4 unread · Gate plan updated', 'Active'], ['# announcements', '2 scheduled updates', 'Active'], ['# emergency', 'Safety briefing pinned', 'Ready']] },
  documents: { title: 'Documents', description: 'Store permits, contracts, invoices, emergency plans, insurance, and partner agreements.', action: 'Upload document', metrics: [['Stored', '18'], ['Awaiting upload', '4'], ['Expiring soon', '1']], rows: [['Venue agreement', 'PDF · KICC', 'Verified'], ['Emergency plan', 'Missing', 'Action needed'], ['Insurance certificate', 'Expires 16 Jul 2026', 'Review']] },
  settings: { title: 'Organization Settings', description: 'Manage the organization profile, team permissions, payout details, verification, notifications, and security.', action: 'Edit organization', metrics: [['Team members', '8'], ['Verified', 'Pending'], ['Security checks', '6 / 7']], rows: [['Organization profile', 'Tokea Events Kenya', 'Complete'], ['Payout account', 'Equity Bank ·•••• 4231', 'Verified'], ['Two-step verification', 'Not enabled', 'Action needed']] },
};

const wizardSteps = ['Basic details', 'Venue', 'Media', 'Schedule', 'Tickets', 'Foodo', 'Triplink', 'Staff', 'Volunteers', 'Sponsors', 'Budget', 'Marketing', 'Preview'];

export function OrganizerWorkspace({ module }: { module: string }) {
  if (module === 'create') return <CreateEventWizard />;
  const config = modules[module] ?? modules.events;
  const [filter, setFilter] = useState('All');
  const rows = useMemo(() => filter === 'All' ? config.rows : config.rows.filter((row) => row[2].toLowerCase().includes(filter.toLowerCase())), [config.rows, filter]);
  return <div className="organizer-workspace"><header className="organizer-header"><div><p className="section-kicker">Organizer workspace</p><h1>{config.title}</h1><p>{config.description}</p></div><button className="button" type="button" onClick={() => alert(`${config.action} is ready for the next workflow step.`)}><Plus size={16} />{config.action}</button></header><div className="workspace-metrics">{config.metrics.map(([label, value]) => <article key={label}><span>{label}</span><strong>{value}</strong></article>)}</div><section className="organizer-panel workspace-table"><div className="panel-heading"><h2>Current activity</h2><div className="compact-tabs">{['All', 'Ready', 'Action needed'].map((item) => <button className={filter === item ? 'active' : ''} key={item} onClick={() => setFilter(item)}>{item}</button>)}</div></div><table className="table"><thead><tr><th>Item</th><th>Details</th><th>Status</th><th /></tr></thead><tbody>{rows.map((row) => <tr key={row[0]}><td><strong>{row[0]}</strong></td><td>{row[1]}</td><td><span className="status">{row[2]}</span></td><td><Link href="/dashboard/organizer/events" aria-label={`Manage ${row[0]}`}><ArrowRight size={16} /></Link></td></tr>)}</tbody></table></section></div>;
}

function CreateEventWizard() {
  const [step, setStep] = useState(0);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    category: 'Music',
    startsAt: '',
    venue: '',
    description: '',
  });
  const progress = Math.round(((step + 1) / wizardSteps.length) * 100);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function saveDraft() {
    if (!form.title.trim() || !form.startsAt || !form.venue.trim()) {
      setSaveMessage('Add an event name, start date, and venue before saving this draft.');
      setStep(0);
      return;
    }

    setSaving(true);
    setSaveMessage('');
    const supabase = createSupabaseBrowserClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      setSaving(false);
      setSaveMessage('Your session has ended. Please login again.');
      return;
    }

    const { data: organizer, error: organizerError } = await supabase
      .from('organizer_profiles')
      .select('id')
      .eq('profile_id', auth.user.id)
      .maybeSingle();
    if (organizerError || !organizer) {
      setSaving(false);
      setSaveMessage('Your organizer profile is not ready yet. Please complete the organization setup and try again.');
      return;
    }

    const eventData = {
      organizer_id: organizer.id,
      title: form.title.trim(),
      description: form.description.trim() || null,
      location_name: form.venue.trim(),
      venue: form.venue.trim(),
      starts_at: new Date(`${form.startsAt}T18:00:00+03:00`).toISOString(),
      status: 'draft' as const,
    };
    const query = draftId
      ? supabase.from('events').update(eventData).eq('id', draftId).select('id').single()
      : supabase.from('events').insert(eventData).select('id').single();
    const { data, error } = await query;
    setSaving(false);
    if (error) {
      setSaveMessage('Unable to save the draft. Please try again.');
      return;
    }
    setDraftId(data.id);
    setSaveMessage('Draft saved securely to your organizer workspace.');
  }

  return <div className="organizer-workspace"><header className="organizer-header"><div><p className="section-kicker">Create an event</p><h1>Build your event</h1><p>Save progress at every stage, then preview and publish when your plan is complete.</p></div><button className="button secondary" type="button" onClick={saveDraft} disabled={saving}><Save size={16} />{saving ? 'Saving...' : 'Save draft'}</button></header>{saveMessage && <div className="save-notice"><Check size={16} /> {saveMessage}</div>}<section className="organizer-panel wizard-panel"><div className="wizard-progress"><div><span>{wizardSteps[step]}</span><b>{progress}% complete</b></div><i><em style={{ width: `${progress}%` }} /></i></div><div className="wizard-layout"><nav>{wizardSteps.map((item, index) => <button type="button" key={item} className={index === step ? 'active' : index < step ? 'complete' : ''} onClick={() => setStep(index)}>{index < step ? <Check size={14} /> : <span>{index + 1}</span>}{item}</button>)}</nav><div className="wizard-content"><h2>{wizardSteps[step]}</h2><p>{step === 0 ? 'Start with the event title, category, description, and dates.' : step === wizardSteps.length - 1 ? 'Review the experience, then publish when every core detail is ready.' : `Configure ${wizardSteps[step].toLowerCase()} for the event.`}</p>{step === 0 && <div className="wizard-form"><label>Event name<input value={form.title} onChange={(event) => updateField('title', event.target.value)} placeholder="Nairobi Gospel Night" /></label><label>Category<select value={form.category} onChange={(event) => updateField('category', event.target.value)}><option>Music</option><option>Business</option><option>Technology</option><option>Festival</option></select></label><label>Start date<input value={form.startsAt} onChange={(event) => updateField('startsAt', event.target.value)} type="date" /></label><label>Venue<input value={form.venue} onChange={(event) => updateField('venue', event.target.value)} placeholder="KICC, Nairobi" /></label><label className="wide">Description<textarea value={form.description} onChange={(event) => updateField('description', event.target.value)} placeholder="Tell guests what makes this event worth showing up for." /></label></div>}{step > 0 && step < wizardSteps.length - 1 && <div className="wizard-placeholder"><Share2 size={24} /><strong>{wizardSteps[step]} configuration</strong><span>This stage is ready for the connected workflow.</span></div>}{step === wizardSteps.length - 1 && <div className="wizard-placeholder"><Copy size={24} /><strong>Ready to preview</strong><span>Finish the required details, then publish to make the event visible.</span><Link href="/dashboard/organizer/events" className="button">Preview event</Link></div>}<div className="wizard-actions"><button className="button secondary" type="button" disabled={step === 0} onClick={() => setStep((current) => current - 1)}>Back</button><button className="button" type="button" onClick={() => setStep((current) => Math.min(current + 1, wizardSteps.length - 1))}>{step === wizardSteps.length - 1 ? 'Publish when ready' : 'Continue'} <ArrowRight size={16} /></button></div></div></div></section></div>;
}
