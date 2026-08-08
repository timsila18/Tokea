'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Check, Loader2, X } from 'lucide-react';

export type OrganizerAction = 'ticket_type' | 'campaign' | 'task' | 'staff_invite' | 'volunteer_opportunity' | 'vendor_request' | 'foodo' | 'triplink_route' | 'sponsorship_package' | 'budget' | 'event_schedule' | 'workspace' | 'organization';
type EventOption = { id: string; title: string };
type Copy = { title: string; submit: string; eventRequired?: boolean };
type BulkField = { key: string; label: string; type?: string; options?: string[] | string[][]; wide?: boolean; placeholder?: string };

const standardTicketTypes = ['Regular', 'VIP', 'VVIP', 'Regular Group of 5', 'Gate Regular'];
const campaignChannels = ['Instagram', 'TikTok', 'WhatsApp', 'Facebook', 'X', 'Telegram', 'Email', 'Influencer campaign', 'Campus ambassadors', 'Radio'];
const staffRoles = ['Security Lead', 'Security Guard', 'Gate Scanner', 'Usher', 'VIP Host', 'Customer Support', 'Media Crew', 'Stage Manager', 'Backstage Assistant', 'Parking Attendant'];
const departments = [['operations_team', 'Operations team'], ['security', 'Security'], ['ushers', 'Ushers'], ['ticket_scanners', 'Ticket scanners'], ['media_team', 'Media team'], ['customer_support', 'Customer support'], ['vip_coordinators', 'VIP coordinators']];
const volunteerRoles = ['Guest experience team', 'Green team', 'Community support', 'Queue marshals', 'Information desk', 'Photo runners', 'Artist hospitality', 'Lost and found'];
const vendorCategories = ['Stage and sound', 'Lighting', 'Security', 'Photography and video', 'Decor and styling', 'Toilets and sanitation', 'Medical support', 'Cleaning', 'Power and generators', 'Brand activations'];
const triplinkRoutes = ['CBD Express', 'Westlands Shuttle', 'Thika Road Connector', 'Ngong Road Shuttle', 'Mombasa Road Express', 'Kiambu Road Connector', 'Kilimani Pickup', 'Karen Link'];
const pickupSuggestions = ['CBD, Westlands, Kilimani', 'Thika Road, Kasarani, Roysambu', 'Ngong Road, Junction, Karen', 'Mombasa Road, South B, South C', 'Kiambu Road, Ridgeways, Runda'];
const sponsorshipPackages = ['Title Partner', 'Gold Partner', 'Silver Partner', 'Bronze Partner', 'Stage Partner', 'Beverage Partner', 'Connectivity Partner', 'Media Partner'];
const budgetCategories = ['Venue', 'Production', 'Security', 'Marketing', 'Talent', 'Staffing', 'Foodo setup', 'Triplink transport', 'Permits', 'Insurance', 'Contingency'];
const workspaceNames = ['Event Command', 'Operations', 'Festival Control', 'Concert Control', 'Launch Team', 'VIP Operations'];
const ticketDefaults = [
  { name: 'Regular', priceKes: '2500', quantity: '500' },
  { name: 'VIP', priceKes: '6500', quantity: '150' },
  { name: 'VVIP', priceKes: '12000', quantity: '50' },
  { name: 'Regular Group of 5', priceKes: '11000', quantity: '80' },
  { name: 'Gate Regular', priceKes: '3000', quantity: '300' },
];
const scheduleDefaults = [
  { title: 'Gates open', scheduleDate: '', startTime: '', endTime: '', locationLabel: 'Main gate', description: 'Guest arrival and check-in starts.' },
  { title: 'Headline performance', scheduleDate: '', startTime: '', endTime: '', locationLabel: 'Main stage', description: 'Main act goes live.' },
];
const campaignDefaults = [
  { name: 'Launch campaign', channel: 'Instagram', objective: 'Awareness', contentFormat: 'Poster carousel + reel', cta: 'Save event', destinationUrl: '', trackingCode: 'IG-LAUNCH', message: 'Launch event announcement and early interest push.', startsAt: '', endsAt: '' },
  { name: 'Final week sales', channel: 'WhatsApp', objective: 'Ticket conversion', contentFormat: 'Broadcast copy + short link', cta: 'Buy ticket', destinationUrl: '', trackingCode: 'WA-FINAL', message: 'Final week ticket reminder and share link.', startsAt: '', endsAt: '' },
];
const taskDefaults = [
  { title: 'Security coverage', priority: 'high', dueAt: '', assignedEmail: '', description: 'Confirm gate, crowd, and emergency coverage.' },
  { title: 'Vendor confirmation', priority: 'medium', dueAt: '', assignedEmail: '', description: 'Confirm vendor requirements and arrival times.' },
];
const staffInviteDefaults = [
  { email: '', roleTitle: 'Security Guard', department: 'security', shiftStart: '', shiftEnd: '' },
  { email: '', roleTitle: 'Gate Scanner', department: 'ticket_scanners', shiftStart: '', shiftEnd: '' },
];
const volunteerDefaults = [
  { title: 'Guest experience team', requiredCount: '10', volunteerEmail: '', shiftStart: '', shiftEnd: '', description: 'Help guests find gates, seats, and support points.' },
  { title: 'Lost and found', requiredCount: '3', volunteerEmail: '', shiftStart: '', shiftEnd: '', description: 'Run lost item intake and guest handover.' },
];
const vendorRequestDefaults = [
  { category: 'Stage and sound', budgetKes: '80000', requirements: 'Sound, stage, backline, and standby technical support.' },
  { category: 'Security', budgetKes: '60000', requirements: 'Access control, patrols, and incident response.' },
];
const foodoVendorDefaults = [
  { vendorName: 'Nyama Choma Village', cuisineType: 'Nyama choma', vendorFeeKes: '15000', stallNumber: 'F1', menuSummary: 'Grill plates, sides, and soft drinks.', requirements: 'Charcoal/heat safety, waste handling, and M-Pesa till required.' },
  { vendorName: 'Coffee and Dessert Bar', cuisineType: 'Coffee and dessert', vendorFeeKes: '12000', stallNumber: 'F2', menuSummary: 'Coffee, pastries, and dessert cups.', requirements: 'Power outlet and covered stall.' },
];
const triplinkDefaults = [
  { routeName: 'CBD Express', pickupPoints: 'CBD, Westlands, Kilimani', dropoffPoint: 'Event main gate', departureAt: '', returnAt: '', priceKes: '500', capacity: '45' },
  { routeName: 'Thika Road Connector', pickupPoints: 'Thika Road, Kasarani, Roysambu', dropoffPoint: 'Event main gate', departureAt: '', returnAt: '', priceKes: '600', capacity: '45' },
];
const sponsorDefaults = [
  { name: 'Gold Partner', priceKes: '250000', inventory: '3', benefits: 'Logo on event poster\nStage mentions\nVIP tickets\nSocial media feature' },
  { name: 'Beverage Partner', priceKes: '150000', inventory: '2', benefits: 'Brand booth\nPouring rights\nSocial media feature' },
];
const budgetDefaults = [
  { category: 'Venue', budgetKes: '120000', notes: 'Deposit, site access, and base venue charges.' },
  { category: 'Production', budgetKes: '85000', notes: 'Stage, lighting, sound, and screens.' },
  { category: 'Security', budgetKes: '60000', notes: 'Security staff and emergency response.' },
];

const bulkDefaults: Partial<Record<OrganizerAction, { key: string; rows: Record<string, string>[] }>> = {
  ticket_type: { key: 'ticketTypes', rows: ticketDefaults },
  campaign: { key: 'campaigns', rows: campaignDefaults },
  task: { key: 'tasks', rows: taskDefaults },
  staff_invite: { key: 'staffInvites', rows: staffInviteDefaults },
  volunteer_opportunity: { key: 'volunteerOpportunities', rows: volunteerDefaults },
  vendor_request: { key: 'vendorRequests', rows: vendorRequestDefaults },
  foodo: { key: 'foodoVendors', rows: foodoVendorDefaults },
  triplink_route: { key: 'triplinkRoutes', rows: triplinkDefaults },
  sponsorship_package: { key: 'sponsorshipPackages', rows: sponsorDefaults },
  budget: { key: 'budgets', rows: budgetDefaults },
  event_schedule: { key: 'scheduleItems', rows: scheduleDefaults },
};

const copies: Record<OrganizerAction, Copy> = {
  ticket_type: { title: 'Create ticket types', submit: 'Save ticket types', eventRequired: true }, campaign: { title: 'Create campaigns', submit: 'Save campaigns', eventRequired: true }, task: { title: 'Create tasks', submit: 'Save tasks', eventRequired: true }, staff_invite: { title: 'Invite staff members', submit: 'Save invitations', eventRequired: true }, volunteer_opportunity: { title: 'Create volunteer opportunities', submit: 'Publish opportunities', eventRequired: true }, vendor_request: { title: 'Request vendors', submit: 'Publish vendor requests', eventRequired: true }, foodo: { title: 'Activate Foodo vendors', submit: 'Activate Foodo', eventRequired: true }, triplink_route: { title: 'Create Triplink routes', submit: 'Save routes', eventRequired: true }, sponsorship_package: { title: 'Create sponsorship packages', submit: 'Save packages', eventRequired: true }, budget: { title: 'Create budget lines', submit: 'Save budget lines', eventRequired: true }, event_schedule: { title: 'Create event schedule', submit: 'Save schedule', eventRequired: true }, workspace: { title: 'Open Solco workspace', submit: 'Open workspace', eventRequired: true }, organization: { title: 'Edit organization', submit: 'Save organization' },
};

export function OrganizerActionForm({ action, onClose, initialEventId, initialFields = {} }: { action: OrganizerAction; onClose: () => void; initialEventId?: string; initialFields?: Record<string, string> }) {
  const copy = copies[action];
  const [events, setEvents] = useState<EventOption[]>([]);
  const [eventId, setEventId] = useState('');
  const [fields, setFields] = useState<Record<string, string>>(initialFields);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const defaults = bulkDefaults[action];
    if (defaults && !fields[defaults.key]) {
      setFields((current) => ({ ...current, [defaults.key]: JSON.stringify(defaults.rows) }));
    }
    if (!copy.eventRequired) return;
    fetch('/api/organizer/events').then((response) => response.json()).then((data) => {
      const options = data.events ?? [];
      setEvents(options);
      if (initialEventId && options.some((item: EventOption) => item.id === initialEventId)) setEventId(initialEventId);
      else if (options[0]) setEventId(options[0].id);
    }).catch(() => setMessage('Unable to load your events. Refresh and try again.'));
  }, [action, copy.eventRequired, initialEventId]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true); setMessage('');
    const response = await fetch('/api/organizer/workflows', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, eventId: copy.eventRequired ? eventId : undefined, fields }) });
    const data = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) { setMessage(data.error ?? 'Unable to save this workflow.'); return; }
    setMessage(data.message ?? 'Saved to your organizer workspace.');
    window.dispatchEvent(new Event('tokea-organizer-workflow-saved'));
  }

  return <div className="workflow-backdrop" role="presentation" onMouseDown={onClose}><section className="workflow-dialog" role="dialog" aria-modal="true" aria-label={copy.title} onMouseDown={(event) => event.stopPropagation()}><div className="workflow-head"><div><h2>{copy.title}</h2><p>Choose the event and complete the details below.</p></div><button className="icon-button" type="button" onClick={onClose} aria-label="Close"><X size={18} /></button></div><form onSubmit={submit} className="workflow-form">{copy.eventRequired && <label>Event<select value={eventId} onChange={(event) => setEventId(event.target.value)} required><option value="">Select event</option>{events.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>}<ActionFields action={action} fields={fields} setField={(name, value) => setFields((current) => ({ ...current, [name]: value }))} />{message && <div className={message.startsWith('Saved') ? 'workflow-message success' : 'workflow-message'}>{message.startsWith('Saved') ? <Check size={16} /> : null}{message}</div>}<div className="workflow-actions"><button className="button secondary" type="button" onClick={onClose}>Cancel</button><button className="button" disabled={saving || (copy.eventRequired && !eventId)}>{saving ? <><Loader2 size={16} className="spin" />Saving...</> : copy.submit}</button></div></form></section></div>;
}

function ActionFields({ action, fields, setField }: { action: OrganizerAction; fields: Record<string, string>; setField: (name: string, value: string) => void }) {
  const input = (name: string, label: string, type = 'text', required = true) => <label key={name}>{label}<input className={type === 'date' || type === 'time' || type === 'datetime-local' ? 'picker-input' : undefined} type={type} value={fields[name] ?? ''} onChange={(event) => setField(name, event.target.value)} required={required} /></label>;
  const datalistInput = (name: string, label: string, options: string[], required = true) => <label key={name}>{label}<input list={`${name}-suggestions`} value={fields[name] ?? ''} onChange={(event) => setField(name, event.target.value)} required={required} /><datalist id={`${name}-suggestions`}>{options.map((option) => <option key={option} value={option} />)}</datalist><div className="suggestion-chips">{options.slice(0, 4).map((option) => <button type="button" key={option} onClick={() => setField(name, option)}>{option}</button>)}</div></label>;
  const select = (name: string, label: string, options: string[] | string[][], required = true) => <label key={name}>{label}<select value={fields[name] ?? (Array.isArray(options[0]) ? (options[0] as string[])[0] : options[0] as string)} onChange={(event) => setField(name, event.target.value)} required={required}>{options.map((option) => {
    const value = Array.isArray(option) ? option[0] : option;
    const display = Array.isArray(option) ? option[1] : option;
    return <option key={value} value={value}>{display}</option>;
  })}</select><div className="suggestion-chips">{options.slice(0, 5).map((option) => {
    const value = Array.isArray(option) ? option[0] : option;
    const display = Array.isArray(option) ? option[1] : option;
    return <button type="button" key={value} onClick={() => setField(name, value)}>{display}</button>;
  })}</div></label>;
  const textarea = (name: string, label: string, required = true) => <label className="wide" key={name}>{label}<textarea value={fields[name] ?? ''} onChange={(event) => setField(name, event.target.value)} required={required} /></label>;
  if (action === 'ticket_type') return <TicketTypeBulkFields fields={fields} setField={setField} />;
  if (action === 'campaign') return <BulkRows title="Campaigns" storageKey="campaigns" fields={fields} setField={setField} defaults={campaignDefaults} columns={[{ key: 'name', label: 'Campaign name', options: ['Launch campaign', 'Early bird push', 'Final week sales', 'VIP table push', 'Influencer reel burst'] }, { key: 'channel', label: 'Channel', options: campaignChannels }, { key: 'objective', label: 'Objective', options: ['Awareness', 'Interested saves', 'Ticket conversion', 'VIP upsell', 'Community growth', 'Last-call urgency'] }, { key: 'contentFormat', label: 'Content format', options: ['Poster carousel + reel', 'Short-form video', 'Broadcast copy + short link', 'Story countdown', 'Creator brief', 'Radio mention'] }, { key: 'cta', label: 'Call to action', options: ['Save event', 'Buy ticket', 'Share with friends', 'Join community', 'Book VIP', 'Use creator code'] }, { key: 'destinationUrl', label: 'Share link', type: 'url', placeholder: 'https://tokeaevents.co.ke/events/...' }, { key: 'trackingCode', label: 'Tracking code', placeholder: 'IG-LAUNCH' }, { key: 'startsAt', label: 'Campaign start', type: 'datetime-local' }, { key: 'endsAt', label: 'Campaign end', type: 'datetime-local' }, { key: 'message', label: 'Message', type: 'textarea', wide: true }]} />;
  if (action === 'task') return <BulkRows title="Tasks" storageKey="tasks" fields={fields} setField={setField} defaults={taskDefaults} columns={[{ key: 'title', label: 'Task title' }, { key: 'priority', label: 'Priority', options: ['low', 'medium', 'high', 'critical'] }, { key: 'dueAt', label: 'Due date', type: 'datetime-local' }, { key: 'assignedEmail', label: 'Assign email', type: 'email' }, { key: 'description', label: 'Task details', type: 'textarea', wide: true }]} />;
  if (action === 'staff_invite') return <BulkRows title="Staff invitations" storageKey="staffInvites" fields={fields} setField={setField} defaults={staffInviteDefaults} columns={[{ key: 'email', label: 'Staff email', type: 'email' }, { key: 'roleTitle', label: 'Role title', options: staffRoles }, { key: 'department', label: 'Department', options: departments }, { key: 'shiftStart', label: 'Shift start', type: 'datetime-local' }, { key: 'shiftEnd', label: 'Shift end', type: 'datetime-local' }]} />;
  if (action === 'volunteer_opportunity') return <BulkRows title="Volunteer opportunities" storageKey="volunteerOpportunities" fields={fields} setField={setField} defaults={volunteerDefaults} columns={[{ key: 'title', label: 'Opportunity title', options: volunteerRoles }, { key: 'requiredCount', label: 'Required', type: 'number' }, { key: 'volunteerEmail', label: 'Assign email', type: 'email' }, { key: 'shiftStart', label: 'Shift start', type: 'datetime-local' }, { key: 'shiftEnd', label: 'Shift end', type: 'datetime-local' }, { key: 'description', label: 'Details', type: 'textarea', wide: true }]} />;
  if (action === 'vendor_request') return <BulkRows title="Vendor requests" storageKey="vendorRequests" fields={fields} setField={setField} defaults={vendorRequestDefaults} columns={[{ key: 'category', label: 'Category', options: vendorCategories }, { key: 'budgetKes', label: 'Budget (KES)', type: 'number' }, { key: 'requirements', label: 'Requirements', type: 'textarea', wide: true }]} />;
  if (action === 'foodo') return <BulkRows title="Foodo vendors" storageKey="foodoVendors" fields={fields} setField={setField} defaults={foodoVendorDefaults} columns={[{ key: 'vendorName', label: 'Vendor name' }, { key: 'cuisineType', label: 'Foodo brief', options: ['Nyama choma', 'Cocktails', 'Street food', 'Coffee and dessert', 'VIP lounge catering'] }, { key: 'vendorFeeKes', label: 'Vendor fee (KES)', type: 'number' }, { key: 'stallNumber', label: 'Stall' }, { key: 'menuSummary', label: 'Menu summary', type: 'textarea', wide: true }, { key: 'requirements', label: 'Requirements', type: 'textarea', wide: true }]} />;
  if (action === 'triplink_route') return <BulkRows title="Triplink routes" storageKey="triplinkRoutes" fields={fields} setField={setField} defaults={triplinkDefaults} columns={[{ key: 'routeName', label: 'Route name', options: triplinkRoutes }, { key: 'pickupPoints', label: 'Pickup points', options: pickupSuggestions }, { key: 'dropoffPoint', label: 'Dropoff' }, { key: 'departureAt', label: 'First departure', type: 'datetime-local' }, { key: 'returnAt', label: 'Return departure', type: 'datetime-local' }, { key: 'priceKes', label: 'Price/seat', type: 'number' }, { key: 'capacity', label: 'Seats', type: 'number' }]} />;
  if (action === 'sponsorship_package') return <BulkRows title="Sponsorship packages" storageKey="sponsorshipPackages" fields={fields} setField={setField} defaults={sponsorDefaults} columns={[{ key: 'name', label: 'Package name', options: sponsorshipPackages }, { key: 'priceKes', label: 'Price (KES)', type: 'number' }, { key: 'inventory', label: 'Available', type: 'number' }, { key: 'benefits', label: 'Benefits', type: 'textarea', wide: true }]} />;
  if (action === 'budget') return <BulkRows title="Budget lines" storageKey="budgets" fields={fields} setField={setField} defaults={budgetDefaults} columns={[{ key: 'category', label: 'Category', options: budgetCategories }, { key: 'budgetKes', label: 'Budget (KES)', type: 'number' }, { key: 'notes', label: 'Notes', type: 'textarea', wide: true }]} />;
  if (action === 'event_schedule') return <BulkRows title="Schedule items" storageKey="scheduleItems" fields={fields} setField={setField} defaults={scheduleDefaults} columns={[{ key: 'title', label: 'Title', options: ['Gates open', 'Opening act', 'Headline performance', 'VIP check-in', 'After party', 'Main programme'] }, { key: 'scheduleDate', label: 'Date', type: 'date' }, { key: 'startTime', label: 'Start', type: 'time' }, { key: 'endTime', label: 'End', type: 'time' }, { key: 'locationLabel', label: 'Location' }, { key: 'description', label: 'Details', type: 'textarea', wide: true }]} />;
  if (action === 'workspace') return <div className="workflow-grid">{select('workspaceName', 'Workspace name', workspaceNames)}</div>;
  return <div className="workflow-grid">{input('organizationName', 'Organization name')}{input('website', 'Website', 'url', false)}{textarea('description', 'Organization description', false)}</div>;
}

function BulkRows({ title, storageKey, fields, setField, defaults, columns }: { title: string; storageKey: string; fields: Record<string, string>; setField: (name: string, value: string) => void; defaults: Record<string, string>[]; columns: BulkField[] }) {
  const rows = readRows(fields[storageKey], defaults);

  function saveRows(next: Record<string, string>[]) {
    setField(storageKey, JSON.stringify(next));
  }

  function updateRow(index: number, key: string, value: string) {
    saveRows(rows.map((row, rowIndex) => rowIndex === index ? { ...row, [key]: value } : row));
  }

  function addRow() {
    saveRows([...rows, { ...defaults[Math.min(rows.length, defaults.length - 1)] }]);
  }

  function removeRow(index: number) {
    saveRows(rows.length > 1 ? rows.filter((_, rowIndex) => rowIndex !== index) : rows);
  }

  return (
    <div className="workflow-grid ticket-bulk-grid">
      <div className="wide ticket-bulk-head">
        <strong>{title}</strong>
        <span>Add another row for each extra record, then save everything in one step.</span>
      </div>
      {rows.map((row, index) => (
        <div className="ticket-bulk-card multi-record-card" key={`${storageKey}-${index}`}>
          <div className="multi-record-head"><strong>{title.slice(0, -1) || title} {index + 1}</strong><button type="button" onClick={() => removeRow(index)} disabled={rows.length === 1}>Remove</button></div>
          {columns.map((column) => <BulkInput key={column.key} column={column} value={row[column.key] ?? ''} onChange={(value) => updateRow(index, column.key, value)} />)}
        </div>
      ))}
      <button className="button secondary wide" type="button" onClick={addRow}>Add another {title.toLowerCase()}</button>
    </div>
  );
}

function readRows(value: string | undefined, defaults: Record<string, string>[]) {
  try {
    const parsed = JSON.parse(value || 'null');
    return Array.isArray(parsed) && parsed.length > 0 ? parsed.map((row) => Object.fromEntries(Object.entries(row as Record<string, unknown>).map(([key, item]) => [key, String(item ?? '')]))) : defaults;
  } catch {
    return defaults;
  }
}

function BulkInput({ column, value, onChange }: { column: BulkField; value: string; onChange: (value: string) => void }) {
  const className = column.wide || column.type === 'textarea' ? 'wide' : undefined;
  if (column.options) {
    return (
      <label className={className}>
        {column.label}
        <select value={value || optionValue(column.options[0])} onChange={(event) => onChange(event.target.value)}>
          {column.options.map((option) => <option key={optionValue(option)} value={optionValue(option)}>{optionLabel(option)}</option>)}
        </select>
        <div className="suggestion-chips">{column.options.slice(0, 5).map((option) => <button type="button" key={optionValue(option)} onClick={() => onChange(optionValue(option))}>{optionLabel(option)}</button>)}</div>
      </label>
    );
  }
  if (column.type === 'textarea') return <label className={className}>{column.label}<textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={column.placeholder} /></label>;
  return <label className={className}>{column.label}<input className={column.type === 'date' || column.type === 'time' || column.type === 'datetime-local' ? 'picker-input' : undefined} type={column.type ?? 'text'} value={value} onChange={(event) => onChange(event.target.value)} placeholder={column.placeholder} /></label>;
}

function optionValue(option: string | string[]) {
  return Array.isArray(option) ? option[0] : option;
}

function optionLabel(option: string | string[]) {
  return Array.isArray(option) ? option[1] : option;
}

function TicketTypeBulkFields({ fields, setField }: { fields: Record<string, string>; setField: (name: string, value: string) => void }) {
  const rows = (() => {
    try {
      const parsed = JSON.parse(fields.ticketTypes || 'null');
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : ticketDefaults;
    } catch {
      return ticketDefaults;
    }
  })() as typeof ticketDefaults;

  function updateRow(index: number, key: keyof typeof ticketDefaults[number], value: string) {
    const next = rows.map((row, rowIndex) => rowIndex === index ? { ...row, [key]: value } : row);
    setField('ticketTypes', JSON.stringify(next));
  }

  function saveRows(next: typeof ticketDefaults) {
    setField('ticketTypes', JSON.stringify(next));
  }

  function addRow() {
    saveRows([...rows, { name: 'Regular', priceKes: '0', quantity: '100' }]);
  }

  function removeRow(index: number) {
    if (rows.length > 1) saveRows(rows.filter((_, rowIndex) => rowIndex !== index));
  }

  return <div className="workflow-grid ticket-bulk-grid"><div className="wide ticket-bulk-head"><strong>Ticket categories</strong><span>Add several ticket types in one save. Set quantity to 0 for any category you do not want.</span></div>{rows.map((row, index) => <div className="ticket-bulk-card" key={`${row.name}-${index}`}><div className="multi-record-head"><strong>Ticket {index + 1}</strong><button type="button" onClick={() => removeRow(index)} disabled={rows.length === 1}>Remove</button></div><label>Type<select value={row.name} onChange={(event) => updateRow(index, 'name', event.target.value)}>{standardTicketTypes.map((name) => <option key={name} value={name}>{name}</option>)}</select></label><label>Price (KES)<input type="number" value={row.priceKes} onChange={(event) => updateRow(index, 'priceKes', event.target.value)} /></label><label>Quantity<input type="number" value={row.quantity} onChange={(event) => updateRow(index, 'quantity', event.target.value)} /></label></div>)}<button className="button secondary wide" type="button" onClick={addRow}>Add another ticket type</button><label>Sales start<input className="picker-input" type="datetime-local" value={fields.salesStart ?? ''} onChange={(event) => setField('salesStart', event.target.value)} /></label><label>Sales end<input className="picker-input" type="datetime-local" value={fields.salesEnd ?? ''} onChange={(event) => setField('salesEnd', event.target.value)} /></label><label className="wide">Description<textarea value={fields.description ?? ''} onChange={(event) => setField('description', event.target.value)} placeholder="Benefits, access notes, refund rules, or gate restrictions." /></label></div>;
}
