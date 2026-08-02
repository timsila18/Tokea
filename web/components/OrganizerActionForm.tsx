'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Check, Loader2, X } from 'lucide-react';

export type OrganizerAction = 'ticket_type' | 'campaign' | 'task' | 'staff_invite' | 'volunteer_opportunity' | 'vendor_request' | 'foodo' | 'triplink_route' | 'sponsorship_package' | 'budget' | 'workspace' | 'organization';
type EventOption = { id: string; title: string };
type Copy = { title: string; submit: string; eventRequired?: boolean };

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

const copies: Record<OrganizerAction, Copy> = {
  ticket_type: { title: 'Create ticket type', submit: 'Create ticket type', eventRequired: true }, campaign: { title: 'Create campaign', submit: 'Save campaign', eventRequired: true }, task: { title: 'Create task', submit: 'Create task', eventRequired: true }, staff_invite: { title: 'Invite staff member', submit: 'Create invitation', eventRequired: true }, volunteer_opportunity: { title: 'Create volunteer opportunity', submit: 'Publish opportunity', eventRequired: true }, vendor_request: { title: 'Request vendors', submit: 'Publish vendor request', eventRequired: true }, foodo: { title: 'Activate Foodo', submit: 'Activate Foodo', eventRequired: true }, triplink_route: { title: 'Create Triplink route', submit: 'Create route', eventRequired: true }, sponsorship_package: { title: 'Create sponsorship package', submit: 'Save package', eventRequired: true }, budget: { title: 'Create budget line', submit: 'Save budget line', eventRequired: true }, workspace: { title: 'Open Solco workspace', submit: 'Open workspace', eventRequired: true }, organization: { title: 'Edit organization', submit: 'Save organization' },
};

export function OrganizerActionForm({ action, onClose }: { action: OrganizerAction; onClose: () => void }) {
  const copy = copies[action];
  const [events, setEvents] = useState<EventOption[]>([]);
  const [eventId, setEventId] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (action === 'ticket_type' && !fields.ticketTypes) {
      setFields((current) => ({ ...current, ticketTypes: JSON.stringify(ticketDefaults) }));
    }
    if (!copy.eventRequired) return;
    fetch('/api/organizer/events').then((response) => response.json()).then((data) => {
      const options = data.events ?? [];
      setEvents(options);
      if (options[0]) setEventId(options[0].id);
    }).catch(() => setMessage('Unable to load your events. Refresh and try again.'));
  }, [action, copy.eventRequired, fields.ticketTypes]);

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
  const input = (name: string, label: string, type = 'text', required = true) => <label key={name}>{label}<input className={type === 'date' || type === 'time' || type === 'datetime-local' ? 'picker-input' : undefined} type={type} value={fields[name] ?? ''} onChange={(event) => setField(name, event.target.value)} required={required} />{(type === 'date' || type === 'time' || type === 'datetime-local') && <span className="picker-help">Click the calendar or clock icon to pick.</span>}</label>;
  const datalistInput = (name: string, label: string, options: string[], required = true) => <label key={name}>{label}<input list={`${name}-suggestions`} value={fields[name] ?? ''} onChange={(event) => setField(name, event.target.value)} required={required} /><datalist id={`${name}-suggestions`}>{options.map((option) => <option key={option} value={option} />)}</datalist><div className="suggestion-chips">{options.slice(0, 4).map((option) => <button type="button" key={option} onClick={() => setField(name, option)}>{option}</button>)}</div></label>;
  const select = (name: string, label: string, options: string[] | string[][], required = true) => <label key={name}>{label}<select value={fields[name] ?? (Array.isArray(options[0]) ? (options[0] as string[])[0] : options[0] as string)} onChange={(event) => setField(name, event.target.value)} required={required}>{options.map((option) => {
    const value = Array.isArray(option) ? option[0] : option;
    const display = Array.isArray(option) ? option[1] : option;
    return <option key={value} value={value}>{display}</option>;
  })}</select></label>;
  const textarea = (name: string, label: string, required = true) => <label className="wide" key={name}>{label}<textarea value={fields[name] ?? ''} onChange={(event) => setField(name, event.target.value)} required={required} /></label>;
  if (action === 'ticket_type') return <TicketTypeBulkFields fields={fields} setField={setField} />;
  if (action === 'campaign') return <div className="workflow-grid">{datalistInput('name', 'Campaign name', ['Launch campaign', 'Early bird push', 'Final week sales', 'VIP table push', 'Influencer reel burst'])}{select('channel', 'Channel', campaignChannels)}{input('startsAt', 'Campaign start', 'datetime-local', false)}{input('endsAt', 'Campaign end', 'datetime-local', false)}{textarea('message', 'Campaign message')}</div>;
  if (action === 'task') return <div className="workflow-grid">{input('title', 'Task title')}<label>Priority<select value={fields.priority ?? 'medium'} onChange={(event) => setField('priority', event.target.value)}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></label>{input('dueAt', 'Due date', 'datetime-local', false)}{input('assignedEmail', 'Assign to staff/volunteer email', 'email', false)}{textarea('description', 'Task details', false)}</div>;
  if (action === 'staff_invite') return <div className="workflow-grid">{input('email', 'Staff email', 'email')}{select('roleTitle', 'Role title', staffRoles)}{select('department', 'Department', departments)}{input('shiftStart', 'Shift start', 'datetime-local', false)}{input('shiftEnd', 'Shift end', 'datetime-local', false)}</div>;
  if (action === 'volunteer_opportunity') return <div className="workflow-grid">{select('title', 'Opportunity title', volunteerRoles)}{input('requiredCount', 'Volunteers required', 'number')}{input('volunteerEmail', 'Assign volunteer email', 'email', false)}{input('shiftStart', 'Shift start', 'datetime-local', false)}{input('shiftEnd', 'Shift end', 'datetime-local', false)}{textarea('description', 'Opportunity details', false)}</div>;
  if (action === 'vendor_request') return <div className="workflow-grid">{select('category', 'Service category', vendorCategories)}{input('budgetKes', 'Budget (KES)', 'number', false)}{textarea('requirements', 'Requirements')}</div>;
  if (action === 'foodo') return <p className="workflow-note">Foodo will be enabled for this event. You can then publish food vendor requests, allocate stalls, approve menus, and monitor pre-orders.</p>;
  if (action === 'triplink_route') return <div className="workflow-grid">{select('routeName', 'Route name', triplinkRoutes)}{input('departureAt', 'First departure', 'datetime-local', false)}{input('returnAt', 'Return departure', 'datetime-local', false)}{input('priceKes', 'Price per seat (KES)', 'number')}{input('capacity', 'Seats available', 'number')}{datalistInput('pickupPoints', 'Pickup points (comma-separated)', pickupSuggestions)}{input('dropoffPoint', 'Dropoff point')}</div>;
  if (action === 'sponsorship_package') return <div className="workflow-grid">{select('name', 'Package name', sponsorshipPackages)}{input('priceKes', 'Price (KES)', 'number')}{input('inventory', 'Packages available', 'number')}{textarea('benefits', 'Benefits (one per line)')}</div>;
  if (action === 'budget') return <div className="workflow-grid">{select('category', 'Budget category', budgetCategories)}{input('budgetKes', 'Budget (KES)', 'number')}{textarea('notes', 'Notes', false)}</div>;
  if (action === 'workspace') return <div className="workflow-grid">{select('workspaceName', 'Workspace name', workspaceNames)}</div>;
  return <div className="workflow-grid">{input('organizationName', 'Organization name')}{input('website', 'Website', 'url', false)}{textarea('description', 'Organization description', false)}</div>;
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

  return <div className="workflow-grid ticket-bulk-grid"><div className="wide ticket-bulk-head"><strong>Ticket categories</strong><span>Add several ticket types in one save. Set quantity to 0 for any category you do not want.</span></div>{rows.map((row, index) => <div className="ticket-bulk-card" key={`${row.name}-${index}`}><label>Type<select value={row.name} onChange={(event) => updateRow(index, 'name', event.target.value)}>{standardTicketTypes.map((name) => <option key={name} value={name}>{name}</option>)}</select></label><label>Price (KES)<input type="number" value={row.priceKes} onChange={(event) => updateRow(index, 'priceKes', event.target.value)} /></label><label>Quantity<input type="number" value={row.quantity} onChange={(event) => updateRow(index, 'quantity', event.target.value)} /></label></div>)}<label>Sales start<input className="picker-input" type="datetime-local" value={fields.salesStart ?? ''} onChange={(event) => setField('salesStart', event.target.value)} /><span className="picker-help">Click the calendar icon to pick.</span></label><label>Sales end<input className="picker-input" type="datetime-local" value={fields.salesEnd ?? ''} onChange={(event) => setField('salesEnd', event.target.value)} /><span className="picker-help">Click the calendar icon to pick.</span></label><label className="wide">Description<textarea value={fields.description ?? ''} onChange={(event) => setField('description', event.target.value)} placeholder="Benefits, access notes, refund rules, or gate restrictions." /></label></div>;
}
