'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Check, Loader2, X } from 'lucide-react';

export type OrganizerAction = 'ticket_type' | 'campaign' | 'task' | 'staff_invite' | 'volunteer_opportunity' | 'vendor_request' | 'foodo' | 'triplink_route' | 'sponsorship_package' | 'budget' | 'workspace' | 'organization';
type EventOption = { id: string; title: string };
type Copy = { title: string; submit: string; eventRequired?: boolean };

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
    if (!copy.eventRequired) return;
    fetch('/api/organizer/events').then((response) => response.json()).then((data) => {
      const options = data.events ?? [];
      setEvents(options);
      if (options[0]) setEventId(options[0].id);
    }).catch(() => setMessage('Unable to load your events. Refresh and try again.'));
  }, [copy.eventRequired]);

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
  const input = (name: string, label: string, type = 'text', required = true) => <label key={name}>{label}<input type={type} value={fields[name] ?? ''} onChange={(event) => setField(name, event.target.value)} required={required} /></label>;
  const textarea = (name: string, label: string, required = true) => <label className="wide" key={name}>{label}<textarea value={fields[name] ?? ''} onChange={(event) => setField(name, event.target.value)} required={required} /></label>;
  if (action === 'ticket_type') return <div className="workflow-grid">{input('name', 'Ticket name')}{input('priceKes', 'Price (KES)', 'number')}{input('quantity', 'Quantity', 'number')}{input('salesStart', 'Sales start', 'datetime-local', false)}{textarea('description', 'Description', false)}</div>;
  if (action === 'campaign') return <div className="workflow-grid">{input('name', 'Campaign name')}{input('channel', 'Channel')}{textarea('message', 'Campaign message')}</div>;
  if (action === 'task') return <div className="workflow-grid">{input('title', 'Task title')}<label>Priority<select value={fields.priority ?? 'medium'} onChange={(event) => setField('priority', event.target.value)}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></label>{input('dueAt', 'Due date', 'datetime-local', false)}{textarea('description', 'Task details', false)}</div>;
  if (action === 'staff_invite') return <div className="workflow-grid">{input('email', 'Staff email', 'email')}{input('roleTitle', 'Role title')}<label>Department<select value={fields.department ?? ''} onChange={(event) => setField('department', event.target.value)}><option value="">Not specified</option><option value="security">Security</option><option value="ushers">Ushers</option><option value="ticket_scanners">Ticket scanners</option><option value="media_team">Media team</option><option value="operations_team">Operations team</option></select></label></div>;
  if (action === 'volunteer_opportunity') return <div className="workflow-grid">{input('title', 'Opportunity title')}{input('requiredCount', 'Volunteers required', 'number')}{textarea('description', 'Opportunity details', false)}</div>;
  if (action === 'vendor_request') return <div className="workflow-grid">{input('category', 'Service category')}{input('budgetKes', 'Budget (KES)', 'number', false)}{textarea('requirements', 'Requirements')}</div>;
  if (action === 'foodo') return <p className="workflow-note">Foodo will be enabled for this event. You can then publish food vendor requests, allocate stalls, approve menus, and monitor pre-orders.</p>;
  if (action === 'triplink_route') return <div className="workflow-grid">{input('routeName', 'Route name')}{input('priceKes', 'Price per seat (KES)', 'number')}{input('capacity', 'Seats available', 'number')}{input('pickupPoints', 'Pickup points (comma-separated)')}{input('dropoffPoint', 'Dropoff point')}</div>;
  if (action === 'sponsorship_package') return <div className="workflow-grid">{input('name', 'Package name')}{input('priceKes', 'Price (KES)', 'number')}{input('inventory', 'Packages available', 'number')}{textarea('benefits', 'Benefits (one per line)')}</div>;
  if (action === 'budget') return <div className="workflow-grid">{input('category', 'Budget category')}{input('budgetKes', 'Budget (KES)', 'number')}{textarea('notes', 'Notes', false)}</div>;
  if (action === 'workspace') return <div className="workflow-grid">{input('workspaceName', 'Workspace name')}</div>;
  return <div className="workflow-grid">{input('organizationName', 'Organization name')}{input('website', 'Website', 'url', false)}{textarea('description', 'Organization description', false)}</div>;
}
