import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSignedInUser } from '@/lib/authz';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

const actionSchema = z.object({
  action: z.enum(['ticket_type', 'campaign', 'task', 'staff_invite', 'volunteer_opportunity', 'vendor_request', 'foodo', 'triplink_route', 'sponsorship_package', 'budget', 'event_schedule', 'workspace', 'organization']),
  eventId: z.string().uuid().optional(),
  fields: z.record(z.string()).default({}),
});

const eventActions = new Set(['ticket_type', 'campaign', 'task', 'staff_invite', 'volunteer_opportunity', 'vendor_request', 'foodo', 'triplink_route', 'sponsorship_package', 'budget', 'event_schedule', 'workspace']);
const standardTicketTypes = new Set(['Regular', 'VIP', 'VVIP', 'Regular Group of 5', 'Gate Regular']);
const scheduleTitles = new Set(['Gates open', 'Opening act', 'Headline performance', 'VIP check-in', 'After party', 'Main programme']);

function text(fields: Record<string, string>, key: string, min = 1, max = 500) {
  const value = fields[key]?.trim() ?? '';
  if (value.length < min || value.length > max) throw new Error(`Enter a valid ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}.`);
  return value;
}

function amount(fields: Record<string, string>, key: string) {
  const value = Math.round(Number(fields[key]) * 100);
  if (!Number.isSafeInteger(value) || value < 0) throw new Error(`Enter a valid ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}.`);
  return value;
}

function ticketTypeName(fields: Record<string, string>) {
  const name = text(fields, 'name', 2, 80);
  if (!standardTicketTypes.has(name)) throw new Error('Choose a valid Tokea ticket type.');
  return name;
}

function ticketTypeRows(fields: Record<string, string>) {
  if (!fields.ticketTypes) {
    return [{ name: ticketTypeName(fields), priceKes: fields.priceKes, quantity: fields.quantity }];
  }

  const parsed = JSON.parse(fields.ticketTypes) as unknown;
  if (!Array.isArray(parsed)) throw new Error('Choose valid ticket categories.');
  const rows = parsed.map((item) => {
    if (!item || typeof item !== 'object') throw new Error('Choose valid ticket categories.');
    const record = item as Record<string, unknown>;
    const name = String(record.name ?? '');
    if (!standardTicketTypes.has(name)) throw new Error('Choose valid ticket categories.');
    const priceKes = String(record.priceKes ?? '');
    const quantity = String(record.quantity ?? '');
    return { name, priceKes, quantity };
  }).filter((row) => Number(row.quantity) > 0);

  if (rows.length === 0) throw new Error('Add quantity for at least one ticket category.');
  return rows;
}

function jsonRows(fields: Record<string, string>, key: string, fallback: Record<string, string>) {
  if (!fields[key]) return [fallback];
  const parsed = JSON.parse(fields[key]) as unknown;
  if (!Array.isArray(parsed)) throw new Error(`Add valid ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}.`);
  const rows = parsed
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
    .map((item) => Object.fromEntries(Object.entries(item).map(([field, value]) => [field, String(value ?? '')])));
  if (rows.length === 0) throw new Error(`Add at least one ${key.replace(/([A-Z])/g, ' $1').toLowerCase()} row.`);
  return rows;
}

function campaignMessage(row: Record<string, string>) {
  return [
    row.message || 'Campaign prepared from organizer workspace.',
    row.objective ? `Objective: ${row.objective}` : '',
    row.contentFormat ? `Format: ${row.contentFormat}` : '',
    row.cta ? `CTA: ${row.cta}` : '',
    row.destinationUrl ? `Link: ${row.destinationUrl}` : '',
    row.trackingCode ? `Tracking: ${row.trackingCode}` : '',
  ].filter(Boolean).join('\n');
}

function optionalEmail(fields: Record<string, string>, key: string) {
  const value = fields[key]?.trim().toLowerCase();
  return value && z.string().email().safeParse(value).success ? value : null;
}

function normalizeDepartment(value?: string) {
  return ['security', 'ushers', 'ticket_scanners', 'parking_staff', 'cleaners', 'media_team', 'photographers', 'videographers', 'mc_team', 'vip_coordinators', 'customer_support', 'backstage_staff', 'operations_team'].includes(value ?? '') ? value : 'operations_team';
}

function shiftWindow(fields: Record<string, string>, startsAt?: string | null) {
  const eventStart = startsAt ? new Date(startsAt) : new Date();
  const start = fields.shiftStart ? new Date(fields.shiftStart) : eventStart;
  const end = fields.shiftEnd ? new Date(fields.shiftEnd) : new Date(start.getTime() + 8 * 60 * 60 * 1000);
  return {
    starts_at: Number.isNaN(start.getTime()) ? eventStart.toISOString() : start.toISOString(),
    ends_at: Number.isNaN(end.getTime()) ? new Date(eventStart.getTime() + 8 * 60 * 60 * 1000).toISOString() : end.toISOString(),
  };
}

function optionalTimestamp(fields: Record<string, string>, key: string) {
  const value = fields[key];
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function dateTimeFromParts(row: Record<string, string>, dateKey: string, timeKey: string) {
  if (!row[dateKey] || !row[timeKey]) return null;
  const date = new Date(`${row[dateKey]}T${row[timeKey]}:00+03:00`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

async function findAuthUserByEmail(email: string) {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw error;
  return data.users.find((user) => user.email?.toLowerCase() === email) ?? null;
}

async function ensureStaffProfile(profileId: string, department?: string) {
  const admin = createSupabaseAdminClient();
  const { data: existing, error: readError } = await admin.from('staff_profiles').select('id').eq('profile_id', profileId).maybeSingle();
  if (readError) throw readError;
  if (existing) return existing.id as string;
  const { data, error } = await admin.from('staff_profiles').insert({ profile_id: profileId, staff_category: normalizeDepartment(department) }).select('id').single();
  if (error || !data) throw error ?? new Error('Unable to create staff profile.');
  return data.id as string;
}

async function ensureVolunteerProfile(profileId: string) {
  const admin = createSupabaseAdminClient();
  const { data: existing, error: readError } = await admin.from('volunteer_profiles').select('id').eq('profile_id', profileId).maybeSingle();
  if (readError) throw readError;
  if (existing) return existing.id as string;
  const { data, error } = await admin.from('volunteer_profiles').insert({ profile_id: profileId }).select('id').single();
  if (error || !data) throw error ?? new Error('Unable to create volunteer profile.');
  return data.id as string;
}

async function ensureWorkspace(eventId: string, organizerId: string, eventTitle = 'Event') {
  const admin = createSupabaseAdminClient();
  const { data: existing, error: readError } = await admin.from('event_workspaces').select('id').eq('event_id', eventId).maybeSingle();
  if (readError) throw readError;
  let workspaceId = existing?.id as string | undefined;
  if (!workspaceId) {
    const { data, error } = await admin.from('event_workspaces').insert({ event_id: eventId, organizer_id: organizerId, name: `${eventTitle} Workspace` }).select('id').single();
    if (error || !data) throw error ?? new Error('Unable to create event workspace.');
    workspaceId = data.id as string;
  }
  const channels = [
    ['general', 'General', 10],
    ['announcements', 'Announcements', 20],
    ['operations', 'Operations', 30],
    ['security', 'Security', 50],
    ['vip', 'VIP', 60],
    ['emergency', 'Emergency', 120],
    ['support', 'Support', 140],
    ['staff', 'Staff', 150],
    ['volunteers', 'Volunteers', 160],
  ].map(([kind, name, display_order]) => ({ workspace_id: workspaceId, kind, name, display_order }));
  const { error } = await admin.from('workspace_channels').upsert(channels, { onConflict: 'workspace_id,kind' });
  if (error) throw error;
  return workspaceId;
}

async function assignStaffToEvent(params: { email: string; eventId: string; organizerId: string; eventTitle: string; roleTitle: string; department?: string; startsAt?: string | null; fields: Record<string, string> }) {
  const user = await findAuthUserByEmail(params.email);
  if (!user) return { assigned: false, reason: 'No active account exists for that staff email yet.' };
  const staffProfileId = await ensureStaffProfile(user.id, params.department);
  const admin = createSupabaseAdminClient();
  const { data: assignment, error } = await admin
    .from('staff_assignments')
    .upsert({ event_id: params.eventId, staff_profile_id: staffProfileId, role_title: params.roleTitle, department: normalizeDepartment(params.department), status: 'assigned' }, { onConflict: 'event_id,staff_profile_id' })
    .select('id')
    .single();
  if (error || !assignment) throw error ?? new Error('Unable to assign staff member.');
  const window = shiftWindow(params.fields, params.startsAt);
  const { data: existingShift } = await admin.from('staff_shifts').select('id').eq('event_id', params.eventId).eq('assignment_id', assignment.id).maybeSingle();
  if (!existingShift) {
    const { error: shiftError } = await admin.from('staff_shifts').insert({ event_id: params.eventId, assignment_id: assignment.id, name: `${params.roleTitle} Shift`, ...window });
    if (shiftError) throw shiftError;
  }
  await ensureWorkspace(params.eventId, params.organizerId, params.eventTitle);
  return { assigned: true };
}

async function assignVolunteerToEvent(params: { email: string; eventId: string; organizerId: string; eventTitle: string; startsAt?: string | null; fields: Record<string, string> }) {
  const user = await findAuthUserByEmail(params.email);
  if (!user) return { assigned: false, reason: 'No active account exists for that volunteer email yet.' };
  const volunteerProfileId = await ensureVolunteerProfile(user.id);
  const admin = createSupabaseAdminClient();
  const { data: application, error } = await admin
    .from('volunteer_applications')
    .upsert({ event_id: params.eventId, volunteer_profile_id: volunteerProfileId, status: 'assigned' }, { onConflict: 'event_id,volunteer_profile_id' })
    .select('id')
    .single();
  if (error || !application) throw error ?? new Error('Unable to assign volunteer.');
  const window = shiftWindow(params.fields, params.startsAt);
  const { data: existingShift } = await admin.from('staff_shifts').select('id').eq('event_id', params.eventId).eq('volunteer_application_id', application.id).maybeSingle();
  if (!existingShift) {
    const { error: shiftError } = await admin.from('staff_shifts').insert({ event_id: params.eventId, volunteer_application_id: application.id, name: 'Volunteer Shift', ...window });
    if (shiftError) throw shiftError;
  }
  await ensureWorkspace(params.eventId, params.organizerId, params.eventTitle);
  return { assigned: true };
}

export async function POST(request: NextRequest) {
  const auth = await requireSignedInUser(request);
  if ('error' in auth) return auth.error;

  const parsed = actionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid workflow request.' }, { status: 400 });
  const { action, eventId, fields } = parsed.data;

  let organizerId: string | undefined;
  let eventTitle = 'Event';
  let eventStartsAt: string | null | undefined;
  if (eventActions.has(action)) {
    if (!eventId) return NextResponse.json({ error: 'Choose an event first.' }, { status: 400 });
    const { data: event } = await auth.supabase.from('events').select('organizer_id,title,starts_at').eq('id', eventId).maybeSingle();
    if (!event) return NextResponse.json({ error: 'That event is not available to your organization.' }, { status: 403 });
    organizerId = event.organizer_id;
    eventTitle = event.title;
    eventStartsAt = event.starts_at;
  }

  try {
    let error: { message: string } | null = null;
    let message = 'Saved to your organizer workspace.';
    switch (action) {
      case 'ticket_type':
        {
          const rows = ticketTypeRows(fields).map((row, index) => ({
            event_id: eventId!,
            name: row.name,
            description: fields.description?.trim() || null,
            price_cents: amount({ priceKes: row.priceKes }, 'priceKes'),
            quantity_total: Number(text({ quantity: row.quantity }, 'quantity', 1, 7)),
            sales_start_at: optionalTimestamp(fields, 'salesStart'),
            sales_end_at: optionalTimestamp(fields, 'salesEnd'),
            sort_order: index,
            is_active: true,
          }));
          const { error: deleteError } = await auth.supabase.from('ticket_types').delete().eq('event_id', eventId!);
          if (deleteError) throw deleteError;
          ({ error } = await auth.supabase.from('ticket_types').insert(rows));
          message = `${rows.length} ticket categor${rows.length === 1 ? 'y' : 'ies'} saved.`;
        }
        break;
      case 'campaign':
        {
          const rows = jsonRows(fields, 'campaigns', fields).map((row) => ({
            event_id: eventId!,
            name: text(row, 'name', 2, 120),
            channel: text(row, 'channel', 2, 40),
            message: text({ message: campaignMessage(row) }, 'message', 2, 1000),
            status: 'draft',
            starts_at: optionalTimestamp(row, 'startsAt'),
            ends_at: optionalTimestamp(row, 'endsAt'),
            created_by: auth.user.id,
          }));
          const { error: deleteError } = await auth.supabase.from('marketing_campaigns').delete().eq('event_id', eventId!);
          if (deleteError) throw deleteError;
          ({ error } = await auth.supabase.from('marketing_campaigns').insert(rows));
          message = `${rows.length} campaign${rows.length === 1 ? '' : 's'} saved.`;
        }
        break;
      case 'task':
        {
          const rows = [];
          const taskRows = jsonRows(fields, 'tasks', fields);
          let unassigned = 0;
          for (const row of taskRows) {
            let assignedTo: string | null = null;
            const email = optionalEmail(row, 'assignedEmail');
            if (email) {
              const user = await findAuthUserByEmail(email);
              assignedTo = user?.id ?? null;
              if (!user) unassigned += 1;
            }
            rows.push({ event_id: eventId!, title: text(row, 'title', 2, 160), description: row.description?.trim() || null, assigned_to: assignedTo, priority: row.priority === 'critical' || row.priority === 'high' || row.priority === 'low' ? row.priority : 'medium', due_at: optionalTimestamp(row, 'dueAt'), created_by: auth.user.id });
          }
          ({ error } = await auth.supabase.from('event_tasks').insert(rows));
          await ensureWorkspace(eventId!, organizerId!, eventTitle);
          message = `${rows.length} task${rows.length === 1 ? '' : 's'} created.${unassigned ? ` ${unassigned} assignee email${unassigned === 1 ? '' : 's'} did not have Tokea accounts yet.` : ''}`;
        }
        break;
      case 'staff_invite':
        {
          const rows = jsonRows(fields, 'staffInvites', fields);
          const { error: clearError } = await auth.supabase.from('staff_invitations').delete().eq('event_id', eventId!);
          if (clearError) throw clearError;
          let assignedCount = 0;
          let pendingCount = 0;
          for (const row of rows) {
            const email = text(row, 'email', 5, 254).toLowerCase();
            if (!z.string().email().safeParse(email).success) throw new Error('Enter a valid staff email address.');
            const roleTitle = text(row, 'roleTitle', 2, 120);
            ({ error } = await auth.supabase.from('staff_invitations').upsert({ event_id: eventId!, organizer_id: organizerId!, email, role_title: roleTitle, department: normalizeDepartment(row.department), created_by: auth.user.id }, { onConflict: 'event_id,email' }));
            if (error) break;
            const assignment = await assignStaffToEvent({ email, eventId: eventId!, organizerId: organizerId!, eventTitle, roleTitle, department: row.department, startsAt: eventStartsAt, fields: row });
            if (assignment.assigned) assignedCount += 1; else pendingCount += 1;
          }
          message = `${rows.length} staff invitation${rows.length === 1 ? '' : 's'} saved. ${assignedCount} assigned now${pendingCount ? `, ${pendingCount} pending signup` : ''}.`;
        }
        break;
      case 'volunteer_opportunity':
        {
          const rows = jsonRows(fields, 'volunteerOpportunities', fields);
          let assignedCount = 0;
          let pendingCount = 0;
          const inserts = rows.map((row) => ({ event_id: eventId!, title: text(row, 'title', 2, 120), description: row.description?.trim() || null, required_count: Number(text(row, 'requiredCount', 1, 5)), created_by: auth.user.id }));
          const { error: clearError } = await auth.supabase.from('volunteer_opportunities').delete().eq('event_id', eventId!);
          if (clearError) throw clearError;
          ({ error } = await auth.supabase.from('volunteer_opportunities').insert(inserts));
          if (!error) {
            await ensureWorkspace(eventId!, organizerId!, eventTitle);
            for (const row of rows) {
            const email = optionalEmail(row, 'volunteerEmail');
            if (email) {
              const assignment = await assignVolunteerToEvent({ email, eventId: eventId!, organizerId: organizerId!, eventTitle, startsAt: eventStartsAt, fields: row });
              if (assignment.assigned) assignedCount += 1; else pendingCount += 1;
            }
            }
          }
          message = `${rows.length} volunteer opportunit${rows.length === 1 ? 'y' : 'ies'} published.${assignedCount || pendingCount ? ` ${assignedCount} assigned now${pendingCount ? `, ${pendingCount} pending signup` : ''}.` : ''}`;
        }
        break;
      case 'vendor_request':
        {
          const rows = jsonRows(fields, 'vendorRequests', fields).map((row) => ({ event_id: eventId!, service_category: text(row, 'category', 2, 80), requirements: text(row, 'requirements', 2, 1000), budget_cents: row.budgetKes ? amount(row, 'budgetKes') : null, requested_by: auth.user.id }));
          ({ error } = await auth.supabase.from('vendor_requests').insert(rows));
          message = `${rows.length} vendor request${rows.length === 1 ? '' : 's'} published.`;
        }
        break;
      case 'foodo':
        {
          await auth.supabase.from('event_feature_settings').upsert({ event_id: eventId!, foodo_active: true });
          const rows = jsonRows(fields, 'foodoVendors', { vendorName: fields.foodoBrief || 'Foodo vendor', cuisineType: fields.foodoBrief || 'Street food', vendorFeeKes: fields.vendorFeeKes || '0', requirements: fields.requirements || 'Foodo vendor setup', stallNumber: 'A1', menuSummary: fields.foodoBrief || 'Menu to be confirmed' });
          let created = 0;
          const admin = createSupabaseAdminClient();
          for (const row of rows) {
            const { data: vendor, error: vendorError } = await admin.from('food_vendors').insert({ vendor_name: text(row, 'vendorName', 2, 120), cuisine_type: row.cuisineType || null, menu_summary: row.menuSummary || null }).select('id').single();
            if (vendorError || !vendor) throw vendorError ?? new Error('Unable to create Foodo vendor.');
            const stallNumber = text({ stallNumber: row.stallNumber || `F${created + 1}` }, 'stallNumber', 1, 40);
            const { data: stall, error: stallError } = await admin.from('food_stalls').upsert({ event_id: eventId!, stall_number: stallNumber, food_vendor_id: vendor.id, location: row.location || null }, { onConflict: 'event_id,stall_number' }).select('id').single();
            if (stallError || !stall) throw stallError ?? new Error('Unable to create Foodo stall.');
            const { error: applicationError } = await admin.from('food_vendor_applications').upsert({ event_id: eventId!, food_vendor_id: vendor.id, status: 'submitted', requirements: row.requirements || null, assigned_stall_id: stall.id, assigned_category: row.cuisineType || null, vendor_fee_cents: row.vendorFeeKes ? amount(row, 'vendorFeeKes') : 0 }, { onConflict: 'event_id,food_vendor_id' });
            if (applicationError) throw applicationError;
            created += 1;
          }
          message = `Foodo activated and ${created} food vendor${created === 1 ? '' : 's'} added.`;
        }
        break;
      case 'triplink_route': {
        const { data: providers, error: providerError } = await auth.supabase.from('transport_providers').select('id').eq('profile_id', auth.user.id).limit(1);
        if (providerError) throw providerError;
        let providerId = providers?.[0]?.id;
        if (!providerId) {
          const { data: provider, error: createProviderError } = await auth.supabase.from('transport_providers').insert({ profile_id: auth.user.id, company_name: 'Organizer Triplink Routes' }).select('id').single();
          if (createProviderError || !provider) throw createProviderError ?? new Error('Unable to create a route provider.');
          providerId = provider.id;
        }
        await auth.supabase.from('event_feature_settings').upsert({ event_id: eventId!, triplink_active: true });
        const rows = jsonRows(fields, 'triplinkRoutes', fields).map((row) => {
          const schedules = [
            optionalTimestamp(row, 'departureAt') ? { label: 'First departure', departs_at: optionalTimestamp(row, 'departureAt') } : null,
            optionalTimestamp(row, 'returnAt') ? { label: 'Return departure', departs_at: optionalTimestamp(row, 'returnAt') } : null,
          ].filter(Boolean);
          return { event_id: eventId!, transport_provider_id: providerId, route_name: text(row, 'routeName', 2, 120), pickup_points: text(row, 'pickupPoints', 2, 500).split(',').map((point) => point.trim()).filter(Boolean), dropoff_points: [text(row, 'dropoffPoint', 2, 160)], schedules, price_cents: amount(row, 'priceKes'), capacity: Number(text(row, 'capacity', 1, 6)) };
        });
        ({ error } = await auth.supabase.from('transport_routes').insert(rows));
        message = `${rows.length} Triplink route${rows.length === 1 ? '' : 's'} created.`;
        break;
      }
      case 'sponsorship_package':
        {
          const rows = jsonRows(fields, 'sponsorshipPackages', fields).map((row) => ({ event_id: eventId!, name: text(row, 'name', 2, 100), price_cents: amount(row, 'priceKes'), benefits: text(row, 'benefits', 2, 1000).split('\n').map((item) => item.trim()).filter(Boolean), inventory_count: Number(text(row, 'inventory', 1, 5)), created_by: auth.user.id }));
          const { error: deleteError } = await auth.supabase.from('sponsorship_packages').delete().eq('event_id', eventId!);
          if (deleteError) throw deleteError;
          ({ error } = await auth.supabase.from('sponsorship_packages').insert(rows));
          message = `${rows.length} sponsorship package${rows.length === 1 ? '' : 's'} saved.`;
        }
        break;
      case 'budget':
        {
          const rows = jsonRows(fields, 'budgets', fields).map((row) => ({ event_id: eventId!, category: text(row, 'category', 2, 80), budgeted_cents: amount(row, 'budgetKes'), notes: row.notes?.trim() || null }));
          const { error: deleteError } = await auth.supabase.from('event_budgets').delete().eq('event_id', eventId!);
          if (deleteError) throw deleteError;
          ({ error } = await auth.supabase.from('event_budgets').insert(rows));
          message = `${rows.length} budget line${rows.length === 1 ? '' : 's'} saved.`;
        }
        break;
      case 'event_schedule':
        {
          const rows = jsonRows(fields, 'scheduleItems', fields).map((row) => {
            const startsAt = dateTimeFromParts(row, 'scheduleDate', 'startTime');
            if (!startsAt) throw new Error('Choose a valid schedule date and start time.');
            const title = text(row, 'title', 2, 120);
            if (row.title && !scheduleTitles.has(row.title) && row.title.length < 2) throw new Error('Choose a valid schedule title.');
            return { event_id: eventId!, title, description: row.description?.trim() || null, starts_at: startsAt, ends_at: dateTimeFromParts(row, 'scheduleDate', 'endTime'), location_label: row.locationLabel?.trim() || null, schedule_type: 'program' };
          });
          ({ error } = await auth.supabase.from('event_schedules').insert(rows));
          message = `${rows.length} schedule item${rows.length === 1 ? '' : 's'} saved.`;
        }
        break;
      case 'workspace': {
        const { data: workspace, error: workspaceError } = await auth.supabase.from('event_workspaces').upsert({ event_id: eventId!, organizer_id: organizerId!, name: `${text(fields, 'workspaceName', 2, 120)} Workspace` }, { onConflict: 'event_id' }).select('id').single();
        if (workspaceError || !workspace) throw workspaceError ?? new Error('Unable to open workspace.');
        await ensureWorkspace(eventId!, organizerId!, eventTitle);
        ({ error } = await auth.supabase.from('workspace_channels').upsert([{ workspace_id: workspace.id, kind: 'general', name: 'General', display_order: 1 }, { workspace_id: workspace.id, kind: 'operations', name: 'Operations', display_order: 2 }, { workspace_id: workspace.id, kind: 'announcements', name: 'Announcements', display_order: 3 }], { onConflict: 'workspace_id,kind' }));
        break;
      }
      case 'organization':
        ({ error } = await auth.supabase.from('organizer_profiles').update({ organization_name: text(fields, 'organizationName', 2, 120), description: fields.description?.trim() || null, website_url: fields.website?.trim() || null }).eq('profile_id', auth.user.id));
        break;
    }
    if (error) throw error;
    return NextResponse.json({ ok: true, message });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to save this workflow.' }, { status: 400 });
  }
}
