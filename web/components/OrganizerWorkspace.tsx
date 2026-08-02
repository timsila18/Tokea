'use client';

import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import { ArrowRight, Check, Download, ImagePlus, Plus, Save, Upload } from 'lucide-react';
import { OrganizerActionForm, type OrganizerAction } from '@/components/OrganizerActionForm';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

type Module = {
  title: string;
  description: string;
  action: string;
  metrics: [string, string][];
  rows: [string, string, string][];
};
type ActiveOrganizerAction = { action: OrganizerAction; initialFields?: Record<string, string> };
type OrganizerReport = {
  title: string;
  cadence: string;
  audience: string;
  insight: string;
  metrics: [string, string][];
};

const modules: Record<string, Module> = {
  events: { title: 'My Events', description: 'Monitor every draft, live, upcoming, completed, and cancelled event.', action: 'Create event', metrics: [['Published', '2'], ['Drafts', '1'], ['Ticket revenue', 'KES 642K']], rows: [['Nairobi Gospel Night', '15 Jul 2026 - KICC', '42% ready'], ['Campus Amapiano Festival', '30 Aug 2026 - Carnivore', 'Draft'], ['Tech Founders Summit', '12 Sep 2026 - Sarit', '61% ready']] },
  ticketing: { title: 'Ticketing', description: 'Manage ticket types, promo codes, affiliates, sales, refunds, transfers, and check-ins.', action: 'Create ticket type', metrics: [['Sold today', '64'], ['Sales this week', '286'], ['Conversion', '4.8%']], rows: [['Early Bird', '1,040 sold - KES 2,500', 'Active'], ['VIP', '205 sold - KES 6,500', 'Selling fast'], ['Regular', '0 sold - KES 3,500', 'Scheduled']] },
  marketing: { title: 'Marketing Center', description: 'Create campaigns, announcements, reels, social posts, and share-ready event links.', action: 'Create campaign', metrics: [['Reach', '86.4K'], ['Interested', '1,862'], ['Promo conversions', '198']], rows: [['Instagram reel', '24.8K views - 1.9K likes', 'Top performing'], ['WhatsApp launch', '4.2% conversion', 'Active'], ['Campus creator code', '54 ticket sales', 'Active']] },
  operations: { title: 'Operations Center', description: 'Assign work, control approvals, track deadlines, logistics, incidents, and event readiness.', action: 'Create task', metrics: [['Tasks complete', '38 / 52'], ['Overdue', '4'], ['Approvals', '7']], rows: [['Security coverage', 'Owner: Operations lead', 'Blocked'], ['Gate scanner test', 'Owner: Ticketing lead', 'Due 12 Jul'], ['Vendor confirmation', 'Owner: Vendor lead', 'In progress']] },
  staff: { title: 'Staff Management', description: 'Define roles, invite staff, assign shifts, track attendance, and connect the workforce foundation.', action: 'Invite staff', metrics: [['Required', '24'], ['Assigned', '18'], ['Shift coverage', '75%']], rows: [['Security', '6 / 8 assigned', 'Needs action'], ['Gate scanners', '4 / 4 assigned', 'Covered'], ['VIP hosts', '2 / 4 assigned', 'Needs action']] },
  volunteers: { title: 'Volunteer Management', description: 'Review applications, assign tasks, track service hours, and issue certificates.', action: 'Create opportunity', metrics: [['Applications', '31'], ['Approved', '12'], ['Hours planned', '246']], rows: [['Guest experience', '8 approved', 'Open'], ['Community support', '3 approved', 'Open'], ['Green team', '1 approved', 'Needs action']] },
  vendors: { title: 'Vendor Management', description: 'Source service vendors, request quotes, approve contracts, and track vendor deliverables.', action: 'Find vendors', metrics: [['Applications', '8'], ['Awaiting review', '3'], ['Confirmed', '5']], rows: [['Stage and sound', 'Quote received', 'Review'], ['Security provider', 'Contract pending', 'Action needed'], ['Photo and video', 'Confirmed', 'Ready']] },
  foodo: { title: 'Foodo Management', description: 'Approve food vendors, allocate stalls, review menus, and monitor food pre-orders and redemptions.', action: 'Activate Foodo', metrics: [['Approved vendors', '6'], ['Pending menus', '2'], ['Pre-orders', '184']], rows: [['Urban Bites', 'Stall A12 - Menu approved', 'Ready'], ['Mama Njeri Kitchen', 'Compliance pending', 'Review'], ['Wok House', 'Stall B02 - 64 pre-orders', 'Ready']] },
  triplink: { title: 'Triplink Management', description: 'Configure routes, pickup points, vehicles, manifests, boarding, and transport revenue.', action: 'Create route', metrics: [['Routes', '0'], ['Pickup points', '0'], ['Seats booked', '0']], rows: [['CBD express', 'Not configured', 'Action needed'], ['Thika Road', 'Not configured', 'Action needed'], ['Westlands', 'Not configured', 'Action needed']] },
  sponsors: { title: 'Sponsor Management', description: 'Build packages, send proposals, approve sponsors, and deliver every commercial commitment.', action: 'Create package', metrics: [['Secured', '2'], ['Proposals open', '4'], ['Sponsor revenue', 'KES 180K']], rows: [['Main stage partner', 'KES 120,000 - Signed', 'Ready'], ['Beverage partner', 'KES 60,000 - Signed', 'Ready'], ['Connectivity partner', 'Proposal sent', 'Follow up']] },
  finance: { title: 'Finance', description: 'Track revenue, expenses, budgets, fees, settlements, payouts, and event profit.', action: 'Create budget line', metrics: [['Gross revenue', 'KES 642K'], ['Expenses', 'KES 358K'], ['Projected profit', 'KES 284K']], rows: [['Venue deposit', 'KES 120,000', 'Paid'], ['Production', 'KES 88,000', 'On budget'], ['Marketing', 'KES 65,000', 'Under budget']] },
  analytics: { title: 'Analytics', description: 'Understand sales trends, audience growth, conversion, community activity, and partner performance.', action: 'Export report', metrics: [['Sales velocity', '+18.7%'], ['New followers', '842'], ['Community posts', '128']], rows: [['Instagram', '42% of event traffic', 'Top source'], ['WhatsApp', '26% of event traffic', 'High conversion'], ['Affiliate codes', '18% of ticket sales', 'Growing']] },
  solco: { title: 'Solco Workspace', description: 'Coordinate the event team through channels, announcements, meetings, files, and pinned decisions.', action: 'Open workspace', metrics: [['Channels', '9'], ['Unread messages', '14'], ['Meetings this week', '3']], rows: [['# operations', '4 unread - Gate plan updated', 'Active'], ['# announcements', '2 scheduled updates', 'Active'], ['# emergency', 'Safety briefing pinned', 'Ready']] },
  documents: { title: 'Documents', description: 'Store permits, contracts, invoices, emergency plans, insurance, and partner agreements.', action: 'Upload document', metrics: [['Stored', '18'], ['Awaiting upload', '4'], ['Expiring soon', '1']], rows: [['Venue agreement', 'PDF - KICC', 'Verified'], ['Emergency plan', 'Missing', 'Action needed'], ['Insurance certificate', 'Expires 16 Jul 2026', 'Review']] },
  settings: { title: 'Organization Settings', description: 'Manage the organization profile, team permissions, payout details, verification, notifications, and security.', action: 'Edit organization', metrics: [['Team members', '8'], ['Verified', 'Pending'], ['Security checks', '6 / 7']], rows: [['Organization profile', 'Tokea Events Kenya', 'Complete'], ['Payout account', 'Equity Bank - **** 4231', 'Verified'], ['Two-step verification', 'Not enabled', 'Action needed']] },
};

const wizardSteps = ['Basic details', 'Venue', 'Media', 'Schedule', 'Tickets', 'Foodo', 'Triplink', 'Staff', 'Volunteers', 'Sponsors', 'Budget', 'Marketing', 'Preview'];
const standardTicketTypes = ['Regular', 'VIP', 'VVIP', 'Regular Group of 5', 'Gate Regular'];
const eventCategories = ['Music', 'Gospel', 'Sports', 'Business', 'Technology', 'Fashion', 'Comedy', 'Festivals', 'Conferences', 'Nightlife'];
const venueSuggestions = ['KICC', 'Uhuru Gardens', 'The Carnivore Grounds', 'Sarit Expo Centre', 'Two Rivers Mall', 'The Hub Karen', 'Kenyatta Stadium', 'Nairobi Street Kitchen', 'Bomas of Kenya', 'The Standup Lounge'];
const cityOptions = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Naivasha', 'Thika', 'Machakos', 'Diani', 'Nanyuki'];
const eventNameSuggestions = ['Blankets & Wine Nairobi', 'Nairobi Gospel Night', 'Koroga Festival 2026', 'Campus Amapiano Festival', 'Tech Founders Summit'];
type WizardField = {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'time' | 'datetime-local' | 'select';
  placeholder?: string;
  options?: string[];
  full?: boolean;
  defaultValue?: string;
};

type WizardStepConfig = {
  guidance: string;
  fields: WizardField[];
};

const wizardSuggestions: Record<number, WizardStepConfig> = {
  3: {
    guidance: 'Build the run-of-show quickly with suggested programme titles and real schedule pickers.',
    fields: [
      { name: 'scheduleTitle', label: 'Schedule title', type: 'select', options: ['Gates open', 'Opening act', 'Headline performance', 'VIP check-in', 'After party', 'Main programme'], defaultValue: 'Gates open' },
      { name: 'scheduleDate', label: 'Schedule date', type: 'date' },
      { name: 'scheduleStartTime', label: 'Start time', type: 'time' },
      { name: 'scheduleEndTime', label: 'End time', type: 'time' },
    ],
  },
  5: {
    guidance: 'Choose the Foodo setup instead of typing from scratch, then add the commercial basics.',
    fields: [
      { name: 'foodoBrief', label: 'Foodo brief', type: 'select', options: ['Nyama choma village', 'Cocktail bars', 'Street food court', 'Coffee and dessert vendors', 'VIP lounge catering'], defaultValue: 'Street food court' },
      { name: 'vendorFeeKes', label: 'Vendor fee (KES)', type: 'number', placeholder: '15000' },
      { name: 'foodVendorCount', label: 'Vendor slots', type: 'number', placeholder: '12' },
      { name: 'menuDeadline', label: 'Menu submission deadline', type: 'datetime-local' },
    ],
  },
  6: {
    guidance: 'Pick common Nairobi pickup routes, then set seats and departure timing.',
    fields: [
      { name: 'pickupPoints', label: 'Pickup points', type: 'select', options: ['CBD, Westlands, Kilimani', 'Thika Road, Kasarani, Roysambu', 'Ngong Road, Junction, Karen', 'Mombasa Road, South B, South C', 'Kiambu Road, Ridgeways, Runda'], defaultValue: 'CBD, Westlands, Kilimani' },
      { name: 'seatsRequired', label: 'Seats required', type: 'number', placeholder: '100' },
      { name: 'firstDeparture', label: 'First departure', type: 'datetime-local' },
      { name: 'returnDeparture', label: 'Return departure', type: 'datetime-local' },
    ],
  },
  7: {
    guidance: 'Select the staff mix your floor team needs and set shift coverage.',
    fields: [
      { name: 'staffRoles', label: 'Staff roles required', type: 'select', options: ['Security, ushers, scanners', 'VIP hosts, gate scanners, media crew', 'Parking, sanitation, medical desk', 'Backstage, runners, artist liaison'], defaultValue: 'Security, ushers, scanners' },
      { name: 'staffTarget', label: 'Staff target', type: 'number', placeholder: '20' },
      { name: 'staffShiftStart', label: 'Shift start', type: 'datetime-local' },
      { name: 'staffShiftEnd', label: 'Shift end', type: 'datetime-local' },
    ],
  },
  8: {
    guidance: 'Publish volunteer opportunities with role suggestions and shift timing.',
    fields: [
      { name: 'volunteerOpportunity', label: 'Volunteer role', type: 'select', options: ['Guest experience team', 'Green team', 'Information desk', 'Lost and found', 'Queue marshals', 'Photo runners'], defaultValue: 'Guest experience team' },
      { name: 'volunteersRequired', label: 'Volunteers required', type: 'number', placeholder: '10' },
      { name: 'volunteerShiftStart', label: 'Shift start', type: 'datetime-local' },
      { name: 'volunteerShiftEnd', label: 'Shift end', type: 'datetime-local' },
    ],
  },
  9: {
    guidance: 'Choose a sponsor package tier and capture the value in one step.',
    fields: [
      { name: 'sponsorshipPackage', label: 'Sponsorship package', type: 'select', options: ['Title Partner', 'Gold Partner', 'Silver Partner', 'Bronze Partner', 'Stage Partner', 'Beverage Partner', 'Media Partner'], defaultValue: 'Gold Partner' },
      { name: 'packageValueKes', label: 'Package value (KES)', type: 'number', placeholder: '250000' },
      { name: 'sponsorInventory', label: 'Packages available', type: 'number', placeholder: '3' },
    ],
  },
  10: {
    guidance: 'Use standard event budget categories so finance stays clean.',
    fields: [
      { name: 'budgetCategory', label: 'Budget category', type: 'select', options: ['Venue', 'Production', 'Security', 'Marketing', 'Talent', 'Staffing', 'Foodo setup', 'Triplink transport', 'Permits', 'Insurance', 'Contingency'], defaultValue: 'Production' },
      { name: 'budgetKes', label: 'Budget (KES)', type: 'number', placeholder: '85000' },
    ],
  },
  11: {
    guidance: 'Create one or more campaign pushes: awareness first, conversion second, and final reminders before event day.',
    fields: [
      { name: 'campaignName', label: 'Campaign name', type: 'select', options: ['Launch campaign', 'Early bird push', 'Final week sales', 'VIP table push', 'Influencer reel burst'], defaultValue: 'Launch campaign' },
      { name: 'primaryChannel', label: 'Primary channel', type: 'select', options: ['Instagram', 'TikTok', 'WhatsApp', 'Facebook', 'X', 'Telegram', 'Radio', 'Campus ambassadors'], defaultValue: 'Instagram' },
      { name: 'campaignObjective', label: 'Objective', type: 'select', options: ['Awareness', 'Interested saves', 'Ticket conversion', 'VIP upsell', 'Community growth', 'Last-call urgency'], defaultValue: 'Awareness' },
      { name: 'campaignFormat', label: 'Content format', type: 'select', options: ['Poster carousel + reel', 'Short-form video', 'Broadcast copy + short link', 'Story countdown', 'Creator brief', 'Radio mention'], defaultValue: 'Poster carousel + reel' },
      { name: 'campaignCta', label: 'Call to action', type: 'select', options: ['Save event', 'Buy ticket', 'Share with friends', 'Join community', 'Book VIP', 'Use creator code'], defaultValue: 'Save event' },
      { name: 'trackingCode', label: 'Tracking code', type: 'text', placeholder: 'IG-LAUNCH' },
      { name: 'campaignStart', label: 'Campaign start', type: 'datetime-local' },
      { name: 'campaignEnd', label: 'Campaign end', type: 'datetime-local' },
    ],
  },
};

const workflowActions: Record<string, OrganizerAction> = {
  ticketing: 'ticket_type',
  marketing: 'campaign',
  operations: 'task',
  staff: 'staff_invite',
  volunteers: 'volunteer_opportunity',
  vendors: 'vendor_request',
  foodo: 'foodo',
  triplink: 'triplink_route',
  sponsors: 'sponsorship_package',
  finance: 'budget',
  solco: 'workspace',
  documents: 'task',
  settings: 'organization',
};
const wizardWorkflowActions: Partial<Record<number, OrganizerAction>> = {
  3: 'event_schedule',
  4: 'ticket_type',
  5: 'foodo',
  6: 'triplink_route',
  7: 'staff_invite',
  8: 'volunteer_opportunity',
  9: 'sponsorship_package',
  10: 'budget',
  11: 'campaign',
};

const marketingChannelUses = [
  ['Instagram', 'Premium posters, carousels, Stories, countdowns, and Reels for visual hype and saves.'],
  ['TikTok', 'Short event trailers, creator clips, venue previews, and trend-led discovery for younger audiences.'],
  ['WhatsApp', 'Conversion-focused broadcast copy, share links, group reminders, and last-call ticket pushes.'],
  ['Facebook', 'Event listings, community groups, retargeting audiences, and longer organizer updates.'],
  ['X', 'Fast announcements, lineup reveals, public conversation, and live event-day updates.'],
  ['Telegram', 'Community drops, deal alerts, and broadcast-style updates for loyal event communities.'],
  ['Radio', 'Mass awareness and credibility for citywide events, festivals, gospel, comedy, and concerts.'],
  ['Campus ambassadors', 'Creator codes and field promotion for student-heavy events and youth culture.'],
];

const organizerReports: OrganizerReport[] = [
  { title: 'Executive Event Snapshot', cadence: 'Daily during campaign, hourly on event day', audience: 'Organizer directors and investors', insight: 'One page view of sales, attendance, readiness, revenue, risk, and next actions.', metrics: [['Gross revenue', 'KES 642K'], ['Tickets sold', '1,245'], ['Readiness', '78%']] },
  { title: 'Ticket Sales & Conversion', cadence: 'Daily', audience: 'Ticketing and marketing leads', insight: 'Shows sales by ticket type, sales velocity, abandoned checkouts, promo code performance, and remaining inventory.', metrics: [['Conversion', '4.8%'], ['VIP sold', '205'], ['Inventory left', '38%']] },
  { title: 'Revenue, Fees & Payouts', cadence: 'Daily and after settlement', audience: 'Finance and organizer owners', insight: 'Tracks gross revenue, platform fees, M-Pesa reconciliation, refunds, expenses, payout requests, and projected profit.', metrics: [['Net projection', 'KES 284K'], ['Payout queue', '2'], ['Refund risk', '1.2%']] },
  { title: 'Marketing Attribution', cadence: 'After each campaign push', audience: 'Growth team', insight: 'Compares Instagram, TikTok, WhatsApp, Facebook, creator codes, and radio against clicks, saves, interested users, and purchases.', metrics: [['Top source', 'Instagram'], ['Promo sales', '198'], ['Interested', '1,862']] },
  { title: 'Audience & Community', cadence: 'Weekly and post-event', audience: 'Experience and community teams', insight: 'Reports saved events, going/interested counts, attendee location, comments, community posts, reviews, photos, and sentiment.', metrics: [['Community posts', '128'], ['Going', '1,245'], ['Rating', '4.7']] },
  { title: 'Operations Readiness', cadence: 'Every planning meeting', audience: 'Operations lead', insight: 'Checks venue readiness, permits, vendors, gates, scanner tests, emergency exits, production tasks, and blocked work.', metrics: [['Tasks done', '38 / 52'], ['Blocked', '4'], ['Approvals', '7']] },
  { title: 'Staffing & Attendance', cadence: 'Daily in final week, live on event day', audience: 'Workforce lead', insight: 'Shows required roles, assigned staff, shift coverage, check-ins, late arrivals, missed shifts, tasks completed, and incidents.', metrics: [['Assigned', '18 / 24'], ['Attendance', '96%'], ['Incidents', '2']] },
  { title: 'Vendor, Foodo & Triplink', cadence: 'Weekly, then event day', audience: 'Partner operations', insight: 'Summarizes vendor approvals, Foodo stall readiness, menus, transport routes, seats booked, pickup points, and partner issues.', metrics: [['Food vendors', '6'], ['Routes', '3'], ['Seats booked', '184']] },
  { title: 'Sponsor Delivery', cadence: 'Weekly and post-event', audience: 'Commercial team and sponsors', insight: 'Tracks sponsor packages, deliverables, social mentions, booth placements, impressions, photos, and proof-of-performance.', metrics: [['Secured', 'KES 180K'], ['Deliverables', '82%'], ['Open proposals', '4']] },
  { title: 'Post-Event Performance Pack', cadence: '24-72 hours after event', audience: 'Organizer, sponsors, venue, and investors', insight: 'A premium closeout report combining revenue, attendance, reviews, media, operations, incidents, sponsor proof, and recommendations.', metrics: [['Attendance', '1,184'], ['NPS', '68'], ['Next event leads', '412']] },
];

export function OrganizerWorkspace({ module }: { module: string }) {
  if (module === 'create') return <CreateEventWizard />;

  const config = modules[module] ?? modules.events;
  const [filter, setFilter] = useState('All');
  const [activeAction, setActiveAction] = useState<ActiveOrganizerAction | null>(null);
  const rows = useMemo(() => (filter === 'All' ? config.rows : config.rows.filter((row) => row[2].toLowerCase().includes(filter.toLowerCase()))), [config.rows, filter]);

  function exportReport() {
    const report = module === 'analytics'
      ? ['Report,Cadence,Audience,Key Insight,Metric 1,Metric 2,Metric 3', ...organizerReports.map((item) => [item.title, item.cadence, item.audience, item.insight, ...item.metrics.map(([label, value]) => `${label}: ${value}`)].map(csvCell).join(','))].join('\n')
      : ['Metric,Value', ...config.metrics.map(([label, value]) => `${label},${value}`)].join('\n');
    const url = URL.createObjectURL(new Blob([report], { type: 'text/csv' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = module === 'analytics' ? 'tokea-organizer-report-suite.csv' : 'tokea-organizer-analytics.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const action = workflowActions[module];

  function campaignFieldsForRow(row: [string, string, string]) {
    const [name] = row;
    if (name.toLowerCase().includes('whatsapp')) {
      return {
        campaigns: JSON.stringify([{ name: 'Final week sales', channel: 'WhatsApp', objective: 'Ticket conversion', contentFormat: 'Broadcast copy + short link', cta: 'Buy ticket', destinationUrl: 'https://tokeaevents.co.ke/events/your-event', trackingCode: 'WA-FINAL', startsAt: '', endsAt: '', message: 'Send a concise WhatsApp reminder with price, date, venue, urgency, and the Tokea ticket link.' }]),
      };
    }
    if (name.toLowerCase().includes('creator') || name.toLowerCase().includes('campus')) {
      return {
        campaigns: JSON.stringify([{ name: 'Campus creator code', channel: 'Campus ambassadors', objective: 'Ticket conversion', contentFormat: 'Creator brief', cta: 'Use creator code', destinationUrl: 'https://tokeaevents.co.ke/events/your-event', trackingCode: 'CAMPUS-CODE', startsAt: '', endsAt: '', message: 'Assign creator codes, campus posters, and story templates so sales can be traced per ambassador.' }]),
      };
    }
    return {
      campaigns: JSON.stringify([{ name: 'Influencer reel burst', channel: 'Instagram', objective: 'Awareness', contentFormat: 'Short-form video', cta: 'Save event', destinationUrl: 'https://tokeaevents.co.ke/events/your-event', trackingCode: 'IG-REEL', startsAt: '', endsAt: '', message: 'Post a punchy Reel using the poster, venue shots, artist clips, ticket price, and event link.' }]),
    };
  }

  function openRowAction(row: [string, string, string]) {
    if (module === 'analytics') {
      exportReport();
      return;
    }
    if (action) setActiveAction({ action, initialFields: module === 'marketing' ? campaignFieldsForRow(row) : undefined });
  }

  return (
    <div className="organizer-workspace">
      <header className="organizer-header">
        <div>
          <p className="section-kicker">Organizer workspace</p>
          <h1>{config.title}</h1>
          <p>{config.description}</p>
        </div>
        {module === 'events' ? (
          <Link href="/dashboard/organizer/create" className="button"><Plus size={16} />{config.action}</Link>
        ) : module === 'analytics' ? (
          <button className="button" type="button" onClick={exportReport}><Download size={16} />{config.action}</button>
        ) : (
          <button className="button" type="button" onClick={() => setActiveAction({ action })}><Plus size={16} />{config.action}</button>
        )}
      </header>
      <div className="workspace-metrics">
        {config.metrics.map(([label, value]) => <article key={label}><span>{label}</span><strong>{value}</strong></article>)}
      </div>
      <section className="organizer-panel workspace-table">
        <div className="panel-heading">
          <h2>Current activity</h2>
          <div className="compact-tabs">
            {['All', 'Ready', 'Action needed'].map((item) => <button className={filter === item ? 'active' : ''} key={item} onClick={() => setFilter(item)}>{item}</button>)}
          </div>
        </div>
        <table className="table">
          <thead><tr><th>Item</th><th>Details</th><th>Status</th><th /></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row[0]}>
                <td><strong>{row[0]}</strong></td>
                <td>{row[1]}</td>
                <td><span className="status">{row[2]}</span></td>
                <td>
                  {module === 'events' ? (
                    <Link className="row-action-button" href="/dashboard/organizer/create" aria-label={`Continue setup for ${row[0]}`} title={`Continue setup for ${row[0]}`}>
                      <ArrowRight size={16} />
                    </Link>
                  ) : (
                    <button className="row-action-button" type="button" onClick={() => openRowAction(row)} aria-label={`Open ${config.action} for ${row[0]}`} title={`Open ${config.action} for ${row[0]}`}>
                      <ArrowRight size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      {module === 'analytics' && <OrganizerReportSuite onExport={exportReport} />}
      {activeAction && <OrganizerActionForm action={activeAction.action} initialFields={activeAction.initialFields} onClose={() => setActiveAction(null)} />}
    </div>
  );
}

function csvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function OrganizerReportSuite({ onExport }: { onExport: () => void }) {
  return (
    <section className="organizer-report-suite">
      <div className="report-suite-head">
        <div>
          <p className="section-kicker">Organizer intelligence</p>
          <h2>Premium Report Suite</h2>
          <p>Classy board-pack style reports for planning meetings, event-day command, sponsor updates, and post-event closeout.</p>
        </div>
        <div>
          <button className="button secondary" type="button" onClick={() => window.print()}><Download size={16} />Print pack</button>
          <button className="button" type="button" onClick={onExport}><Download size={16} />Export data</button>
        </div>
      </div>
      <div className="report-card-grid">
        {organizerReports.map((report, index) => (
          <article className="report-card" key={report.title}>
            <div className="report-number">{String(index + 1).padStart(2, '0')}</div>
            <div>
              <span>{report.cadence}</span>
              <h3>{report.title}</h3>
              <p>{report.insight}</p>
              <small>For: {report.audience}</small>
            </div>
            <dl>
              {report.metrics.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}

function CreateEventWizard() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [step, setStep] = useState(0);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState('');
  const [activeAction, setActiveAction] = useState<OrganizerAction | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<{ file: File; previewUrl: string }[]>([]);
  const [form, setForm] = useState({
    title: '',
    category: 'Music',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    venue: '',
    venueAddress: '',
    venueCity: 'Nairobi',
    venueCapacity: '',
    venueContact: '',
    venueNotes: '',
    description: '',
  });
  const progress = Math.round(((step + 1) / wizardSteps.length) * 100);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function formatDate(date: Date) {
    return date.toISOString().slice(0, 10);
  }

  function nextSaturday() {
    const date = new Date();
    const daysUntilSaturday = (6 - date.getDay() + 7) % 7 || 7;
    date.setDate(date.getDate() + daysUntilSaturday);
    return formatDate(date);
  }

  function applyTemplate(kind: 'concert' | 'festival' | 'conference') {
    const templates = {
      concert: { title: 'Nairobi Live Concert', category: 'Music', venue: 'KICC', startTime: '18:00', endTime: '23:00' },
      festival: { title: 'Koroga Festival 2026', category: 'Festivals', venue: 'The Carnivore Grounds', startTime: '12:00', endTime: '22:00' },
      conference: { title: 'Tech Founders Summit', category: 'Technology', venue: 'Sarit Expo Centre', startTime: '09:00', endTime: '17:00' },
    }[kind];
    const date = nextSaturday();
    setForm((current) => ({ ...current, ...templates, startDate: date, endDate: date }));
  }

  async function saveDraft() {
    if (!form.title.trim() || !form.startDate || !form.startTime || !form.venue.trim()) {
      setSaveMessage('Add an event name, start date, start time, and venue before saving this draft.');
      setStep(0);
      return null;
    }

    const startsAt = new Date(`${form.startDate}T${form.startTime}:00+03:00`);
    const endsAt = form.endDate && form.endTime ? new Date(`${form.endDate}T${form.endTime}:00+03:00`) : null;
    if (Number.isNaN(startsAt.getTime()) || (endsAt && Number.isNaN(endsAt.getTime()))) {
      setSaveMessage('Choose a valid event date and time before saving this draft.');
      setStep(0);
      return null;
    }

    setSaving(true);
    setSaveMessage('');
    const response = await fetch('/api/organizer/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: draftId ?? undefined,
        title: form.title,
        description: form.description,
        venue: form.venue,
        startsAt: startsAt.toISOString(),
        endsAt: endsAt?.toISOString() ?? undefined,
      }),
    });
    const data = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      setSaveMessage(data.error ?? 'Unable to save the draft. Please try again.');
      return null;
    }

    setDraftId(data.event.id);
    setSaveMessage(data.message ?? 'Draft saved securely to your organizer workspace.');
    return data.event.id as string;
  }

  function selectPoster(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setSaveMessage('Please choose an image file for the event poster.');
      return;
    }
    setPosterFile(file);
    setPosterPreview(URL.createObjectURL(file));
  }

  function selectGallery(files: FileList | null) {
    const selected = Array.from(files ?? []).filter((file) => file.type.startsWith('image/'));
    if (selected.length === 0) {
      setSaveMessage('Choose one or more image files for the gallery.');
      return;
    }
    setGalleryFiles(selected.map((file) => ({ file, previewUrl: URL.createObjectURL(file) })));
  }

  function safeFileName(file: File) {
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const baseName = file.name.replace(/\.[^/.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'media';
    return `${baseName}.${extension}`;
  }

  async function uploadFile(eventId: string, file: File, mediaType: 'poster' | 'image', displayOrder: number) {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) throw new Error('Please login again before uploading media.');

    const path = `${userId}/${eventId}/${Date.now()}-${displayOrder}-${safeFileName(file)}`;
    const { error: uploadError } = await supabase.storage.from('event-media').upload(path, file, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: false,
    });
    if (uploadError) throw uploadError;

    if (mediaType === 'poster') {
      const { error: deleteError } = await supabase.from('event_media').delete().eq('event_id', eventId).eq('media_type', 'poster');
      if (deleteError) throw deleteError;
    }

    const { error: mediaError } = await supabase.from('event_media').insert({
      event_id: eventId,
      media_type: mediaType,
      storage_path: path,
      display_order: displayOrder,
    });
    if (mediaError) throw mediaError;
  }

  async function uploadMedia() {
    if (!posterFile && galleryFiles.length === 0) {
      setSaveMessage('Choose a poster or gallery image before uploading media.');
      return;
    }

    setUploading(true);
    setSaveMessage('');
    try {
      const eventId = draftId ?? await saveDraft();
      if (!eventId) return;
      if (posterFile) await uploadFile(eventId, posterFile, 'poster', 0);
      for (const [index, item] of galleryFiles.entries()) {
        await uploadFile(eventId, item.file, 'image', index + 1);
      }
      setSaveMessage('Media uploaded successfully to Supabase Storage.');
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : 'Unable to upload media. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  async function openFullSetup(action: OrganizerAction) {
    const eventId = draftId ?? await saveDraft();
    if (!eventId) return;
    setActiveAction(action);
  }

  return (
    <div className="organizer-workspace">
      <header className="organizer-header">
        <div>
          <p className="section-kicker">Create an event</p>
          <h1>Build your event</h1>
          <p>Save progress at every stage, then preview and publish when your plan is complete.</p>
        </div>
        <button className="button secondary" type="button" onClick={() => void saveDraft()} disabled={saving}>
          <Save size={16} />{saving ? 'Saving...' : 'Save draft'}
        </button>
      </header>
      {saveMessage && <div className="save-notice"><Check size={16} /> {saveMessage}</div>}
      <section className="organizer-panel wizard-panel">
        <div className="wizard-progress">
          <div><span>{wizardSteps[step]}</span><b>{progress}% complete</b></div>
          <i><em style={{ width: `${progress}%` }} /></i>
        </div>
        <div className="wizard-layout">
          <nav>
            {wizardSteps.map((item, index) => (
              <button type="button" key={item} className={index === step ? 'active' : index < step ? 'complete' : ''} onClick={() => setStep(index)}>
                {index < step ? <Check size={14} /> : <span>{index + 1}</span>}{item}
              </button>
            ))}
          </nav>
          <div className="wizard-content">
            <h2>{wizardSteps[step]}</h2>
            <p>{step === 0 ? 'Start with the event title, category, description, and dates.' : step === 1 ? 'Add the operational venue information your team needs.' : step === wizardSteps.length - 1 ? 'Review the experience, then publish when every core detail is ready.' : `Configure ${wizardSteps[step].toLowerCase()} for the event.`}</p>

            {step === 0 && (
              <div className="wizard-form">
                <div className="wide quick-template-row">
                  <button type="button" onClick={() => applyTemplate('concert')}>Concert</button>
                  <button type="button" onClick={() => applyTemplate('festival')}>Festival</button>
                  <button type="button" onClick={() => applyTemplate('conference')}>Conference</button>
                </div>
                <label>Event name<input value={form.title} onChange={(event) => updateField('title', event.target.value)} placeholder="Nairobi Gospel Night" /><SuggestionChips options={eventNameSuggestions} onPick={(value) => updateField('title', value)} /></label>
                <label>Category<select value={form.category} onChange={(event) => updateField('category', event.target.value)}>{eventCategories.map((category) => <option key={category}>{category}</option>)}</select></label>
                <PickerField label="Start date" type="date" value={form.startDate} onChange={(value) => updateField('startDate', value)} />
                <PickerField label="Start time" type="time" value={form.startTime} onChange={(value) => updateField('startTime', value)} />
                <PickerField label="End date" type="date" value={form.endDate} onChange={(value) => updateField('endDate', value)} />
                <PickerField label="End time" type="time" value={form.endTime} onChange={(value) => updateField('endTime', value)} />
                <label>Venue<input list="event-venue-suggestions" value={form.venue} onChange={(event) => updateField('venue', event.target.value)} placeholder="KICC, Nairobi" /><datalist id="event-venue-suggestions">{venueSuggestions.map((venue) => <option key={venue} value={venue} />)}</datalist><SuggestionChips options={venueSuggestions.slice(0, 5)} onPick={(value) => updateField('venue', value)} /></label>
                <label className="wide">Description<textarea value={form.description} onChange={(event) => updateField('description', event.target.value)} placeholder="Tell guests what makes this event worth showing up for." /></label>
              </div>
            )}

            {step === 1 && (
              <div className="wizard-form">
                <label>Venue name<input list="venue-name-suggestions" value={form.venue} onChange={(event) => updateField('venue', event.target.value)} placeholder="KICC" /><datalist id="venue-name-suggestions">{venueSuggestions.map((venue) => <option key={venue} value={venue} />)}</datalist><SuggestionChips options={venueSuggestions.slice(0, 5)} onPick={(value) => updateField('venue', value)} /></label>
                <label>City<select value={form.venueCity} onChange={(event) => updateField('venueCity', event.target.value)}>{cityOptions.map((city) => <option key={city}>{city}</option>)}</select></label>
                <label>Capacity<input value={form.venueCapacity} onChange={(event) => updateField('venueCapacity', event.target.value)} type="number" placeholder="3000" /></label>
                <label>Venue contact<input value={form.venueContact} onChange={(event) => updateField('venueContact', event.target.value)} type="tel" placeholder="2547..." /></label>
                <label className="wide">Physical address<textarea value={form.venueAddress} onChange={(event) => updateField('venueAddress', event.target.value)} placeholder="Main entrance, parking guidance, access notes" /></label>
                <label className="wide">Operations notes<textarea value={form.venueNotes} onChange={(event) => updateField('venueNotes', event.target.value)} placeholder="Loading bay, security access, sound restrictions, emergency exits" /></label>
              </div>
            )}

            {step === 2 && (
              <div className="wizard-form media-upload-form">
                <label className="wide">Event poster<input type="file" accept="image/*" onChange={(event) => selectPoster(event.target.files?.[0])} /></label>
                {posterPreview && <div className="media-preview wide" style={{ backgroundImage: `url(${posterPreview})` }}><span>Poster preview</span></div>}
                <label className="wide">Gallery images<input type="file" accept="image/*" multiple onChange={(event) => selectGallery(event.target.files)} /></label>
                {galleryFiles.length > 0 && <div className="media-gallery-preview wide">{galleryFiles.map((item) => <div key={item.previewUrl} style={{ backgroundImage: `url(${item.previewUrl})` }} />)}</div>}
                <div className="wide media-upload-actions">
                  <button className="button" type="button" onClick={() => void uploadMedia()} disabled={uploading || saving}>
                    <Upload size={16} />{uploading ? 'Uploading...' : 'Upload media'}
                  </button>
                  <span><ImagePlus size={15} /> Uploads are saved to Supabase Storage and linked to this event draft.</span>
                </div>
              </div>
            )}

            {step === 4 && <TicketStageFields />}

            {step > 2 && step !== 4 && step < wizardSteps.length - 1 && <WizardStageFields step={step} />}

            {step === wizardSteps.length - 1 && (
              <div className="wizard-preview">
                <strong>{form.title || 'Untitled event'}</strong>
                <span>{form.venue || 'Venue to be confirmed'} - {form.startDate || 'Date to be confirmed'} {form.startTime || ''}</span>
                <p>Review each section, save the draft, then publish when the event is ready.</p>
                <Link href="/dashboard/organizer/events" className="button">Preview event</Link>
              </div>
            )}

            <div className="wizard-actions">
              <button className="button secondary" type="button" disabled={step === 0} onClick={() => setStep((current) => current - 1)}>Back</button>
              <div className="wizard-action-group">
                {wizardWorkflowActions[step] && <button className="button secondary" type="button" onClick={() => void openFullSetup(wizardWorkflowActions[step]!)}>Open full setup</button>}
                {step >= 5 && step < wizardSteps.length - 1 && <button className="button secondary" type="button" onClick={() => setStep(wizardSteps.length - 1)}>Skip add-ons</button>}
                <button className="button" type="button" onClick={() => setStep((current) => Math.min(current + 1, wizardSteps.length - 1))}>
                  {step === wizardSteps.length - 1 ? 'Publish when ready' : step >= 5 ? 'Save optional step' : 'Continue'} <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      {activeAction && <OrganizerActionForm action={activeAction} initialEventId={draftId ?? undefined} onClose={() => setActiveAction(null)} />}
    </div>
  );
}

function WizardStageFields({ step }: { step: number }) {
  const config = wizardSuggestions[step];
  if (!config) return null;

  return (
    <div className="wizard-form">
      <div className="wide suggested-options-panel">
        <strong>Recommended picks</strong>
        <span>{config.guidance}</span>
      </div>
      {step === 11 && <MarketingChannelGuide />}
      {config.fields.map((field) => (
        <SuggestedField key={field.name} field={field} />
      ))}
    </div>
  );
}

function MarketingChannelGuide() {
  return (
    <div className="wide marketing-channel-guide">
      <strong>How Tokea uses the channels</strong>
      <div>
        {marketingChannelUses.map(([channel, use]) => (
          <article key={channel}>
            <b>{channel}</b>
            <span>{use}</span>
          </article>
        ))}
      </div>
    </div>
  );
}

function SuggestedField({ field }: { field: WizardField }) {
  const [value, setValue] = useState(field.defaultValue ?? '');
  if (field.type === 'date' || field.type === 'time' || field.type === 'datetime-local') {
    return <PickerField label={field.label} type={field.type} value={value} onChange={setValue} />;
  }

  if (field.type === 'select') {
    return (
      <label className={field.full ? 'wide' : undefined}>
        {field.label}
        <select value={value} onChange={(event) => setValue(event.target.value)}>
          {(field.options ?? []).map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
        {field.options && <SuggestionChips options={field.options} onPick={setValue} />}
      </label>
    );
  }

  return <label className={field.full ? 'wide' : undefined}>{field.label}<input type={field.type} value={value} onChange={(event) => setValue(event.target.value)} placeholder={field.placeholder} /></label>;
}

function SuggestionChips({ options, onPick }: { options: string[]; onPick: (value: string) => void }) {
  return <div className="suggestion-chips">{options.map((option) => <button type="button" key={option} onClick={() => onPick(option)}>{option}</button>)}</div>;
}

function PickerField({ label, type, value, onChange }: { label: string; type: 'date' | 'time' | 'datetime-local'; value: string; onChange: (value: string) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const kind = type === 'time' ? 'time' : 'date';

  function openPicker() {
    inputRef.current?.showPicker?.();
    inputRef.current?.focus();
  }

  return (
    <label>
      {label}
      <div className="picker-control">
        <input ref={inputRef} className="picker-input" value={value} onChange={(event) => onChange(event.target.value)} type={type} />
        <button type="button" onClick={openPicker}>Pick {kind}</button>
      </div>
      <PickerHelp kind={kind} />
    </label>
  );
}

function PickerHelp({ kind }: { kind: 'date' | 'time' }) {
  return <span className="picker-help">Use the Pick {kind} button or click inside the field.</span>;
}

function TicketStageFields() {
  const [salesStart, setSalesStart] = useState('');
  const [salesEnd, setSalesEnd] = useState('');

  return (
    <div className="wizard-form ticket-bulk-grid">
      <div className="wide ticket-bulk-head"><strong>Standard ticket categories</strong><span>Configure several ticket types for this event instead of adding one at a time.</span></div>
      {standardTicketTypes.map((name, index) => <div className="ticket-bulk-card" key={name}><strong>{name}</strong><label>Price (KES)<input type="number" placeholder={String([2500, 6500, 12000, 11000, 3000][index])} /></label><label>Quantity<input type="number" placeholder={String([500, 150, 50, 80, 300][index])} /></label></div>)}
      <PickerField label="Sales start" type="datetime-local" value={salesStart} onChange={setSalesStart} />
      <PickerField label="Sales end" type="datetime-local" value={salesEnd} onChange={setSalesEnd} />
      <label className="wide">Description<textarea placeholder="Describe who this ticket is for, benefits, group size, gate restrictions, or access level." /></label>
    </div>
  );
}
