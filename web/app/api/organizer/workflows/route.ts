import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSignedInUser } from '@/lib/authz';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

const actionSchema = z.object({
  action: z.enum(['ticket_type', 'campaign', 'task', 'staff_invite', 'volunteer_opportunity', 'vendor_request', 'foodo', 'triplink_route', 'sponsorship_package', 'budget', 'workspace', 'organization']),
  eventId: z.string().uuid().optional(),
  fields: z.record(z.string()).default({}),
});

const eventActions = new Set(['ticket_type', 'campaign', 'task', 'staff_invite', 'volunteer_opportunity', 'vendor_request', 'foodo', 'triplink_route', 'sponsorship_package', 'budget', 'workspace']);

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
        ({ error } = await auth.supabase.from('ticket_types').insert({ event_id: eventId!, name: text(fields, 'name', 2, 80), description: fields.description?.trim() || null, price_cents: amount(fields, 'priceKes'), quantity_total: Number(text(fields, 'quantity', 1, 7)), sales_start_at: fields.salesStart ? new Date(fields.salesStart).toISOString() : null, is_active: true }));
        break;
      case 'campaign':
        ({ error } = await auth.supabase.from('marketing_campaigns').insert({ event_id: eventId!, name: text(fields, 'name', 2, 120), channel: text(fields, 'channel', 2, 40), message: text(fields, 'message', 2, 1000), status: 'draft', created_by: auth.user.id }));
        break;
      case 'task':
        {
          let assignedTo: string | null = null;
          const email = optionalEmail(fields, 'assignedEmail');
          if (email) {
            const user = await findAuthUserByEmail(email);
            assignedTo = user?.id ?? null;
            if (!user) message = 'Task saved. The assignee email is not a Tokea account yet, so it will appear unassigned until they sign up.';
          }
          ({ error } = await auth.supabase.from('event_tasks').insert({ event_id: eventId!, title: text(fields, 'title', 2, 160), description: fields.description?.trim() || null, assigned_to: assignedTo, priority: fields.priority === 'critical' || fields.priority === 'high' || fields.priority === 'low' ? fields.priority : 'medium', due_at: fields.dueAt ? new Date(fields.dueAt).toISOString() : null, created_by: auth.user.id }));
          await ensureWorkspace(eventId!, organizerId!, eventTitle);
        }
        break;
      case 'staff_invite':
        {
          const email = text(fields, 'email', 5, 254).toLowerCase();
          const roleTitle = text(fields, 'roleTitle', 2, 120);
          ({ error } = await auth.supabase.from('staff_invitations').upsert({ event_id: eventId!, organizer_id: organizerId!, email, role_title: roleTitle, department: normalizeDepartment(fields.department), created_by: auth.user.id }, { onConflict: 'event_id,email' }));
          if (!error) {
            const assignment = await assignStaffToEvent({ email, eventId: eventId!, organizerId: organizerId!, eventTitle, roleTitle, department: fields.department, startsAt: eventStartsAt, fields });
            message = assignment.assigned ? 'Staff invited, assigned, and shift created.' : `Staff invitation saved. ${assignment.reason}`;
          }
        }
        break;
      case 'volunteer_opportunity':
        {
          ({ error } = await auth.supabase.from('volunteer_opportunities').insert({ event_id: eventId!, title: text(fields, 'title', 2, 120), description: fields.description?.trim() || null, required_count: Number(text(fields, 'requiredCount', 1, 5)), created_by: auth.user.id }));
          if (!error) {
            await ensureWorkspace(eventId!, organizerId!, eventTitle);
            const email = optionalEmail(fields, 'volunteerEmail');
            if (email) {
              const assignment = await assignVolunteerToEvent({ email, eventId: eventId!, organizerId: organizerId!, eventTitle, startsAt: eventStartsAt, fields });
              message = assignment.assigned ? 'Volunteer opportunity published, volunteer assigned, and shift created.' : `Volunteer opportunity published. ${assignment.reason}`;
            }
          }
        }
        break;
      case 'vendor_request':
        ({ error } = await auth.supabase.from('vendor_requests').insert({ event_id: eventId!, service_category: text(fields, 'category', 2, 80), requirements: text(fields, 'requirements', 2, 1000), budget_cents: fields.budgetKes ? amount(fields, 'budgetKes') : null, requested_by: auth.user.id }));
        break;
      case 'foodo':
        ({ error } = await auth.supabase.from('event_feature_settings').upsert({ event_id: eventId!, foodo_active: true }));
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
        ({ error } = await auth.supabase.from('transport_routes').insert({ event_id: eventId!, transport_provider_id: providerId, route_name: text(fields, 'routeName', 2, 120), pickup_points: text(fields, 'pickupPoints', 2, 500).split(',').map((point) => point.trim()).filter(Boolean), dropoff_points: [text(fields, 'dropoffPoint', 2, 160)], price_cents: amount(fields, 'priceKes'), capacity: Number(text(fields, 'capacity', 1, 6)) }));
        break;
      }
      case 'sponsorship_package':
        ({ error } = await auth.supabase.from('sponsorship_packages').insert({ event_id: eventId!, name: text(fields, 'name', 2, 100), price_cents: amount(fields, 'priceKes'), benefits: text(fields, 'benefits', 2, 1000).split('\n').map((item) => item.trim()).filter(Boolean), inventory_count: Number(text(fields, 'inventory', 1, 5)), created_by: auth.user.id }));
        break;
      case 'budget':
        ({ error } = await auth.supabase.from('event_budgets').upsert({ event_id: eventId!, category: text(fields, 'category', 2, 80), budgeted_cents: amount(fields, 'budgetKes'), notes: fields.notes?.trim() || null }, { onConflict: 'event_id,category' }));
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
