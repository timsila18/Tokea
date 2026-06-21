import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSignedInUser } from '@/lib/authz';

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

export async function POST(request: NextRequest) {
  const auth = await requireSignedInUser(request);
  if ('error' in auth) return auth.error;

  const parsed = actionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid workflow request.' }, { status: 400 });
  const { action, eventId, fields } = parsed.data;

  let organizerId: string | undefined;
  if (eventActions.has(action)) {
    if (!eventId) return NextResponse.json({ error: 'Choose an event first.' }, { status: 400 });
    const { data: event } = await auth.supabase.from('events').select('organizer_id').eq('id', eventId).maybeSingle();
    if (!event) return NextResponse.json({ error: 'That event is not available to your organization.' }, { status: 403 });
    organizerId = event.organizer_id;
  }

  try {
    let error: { message: string } | null = null;
    switch (action) {
      case 'ticket_type':
        ({ error } = await auth.supabase.from('ticket_types').insert({ event_id: eventId!, name: text(fields, 'name', 2, 80), description: fields.description?.trim() || null, price_cents: amount(fields, 'priceKes'), quantity_total: Number(text(fields, 'quantity', 1, 7)), sales_start_at: fields.salesStart ? new Date(fields.salesStart).toISOString() : null, is_active: true }));
        break;
      case 'campaign':
        ({ error } = await auth.supabase.from('marketing_campaigns').insert({ event_id: eventId!, name: text(fields, 'name', 2, 120), channel: text(fields, 'channel', 2, 40), message: text(fields, 'message', 2, 1000), status: 'draft', created_by: auth.user.id }));
        break;
      case 'task':
        ({ error } = await auth.supabase.from('event_tasks').insert({ event_id: eventId!, title: text(fields, 'title', 2, 160), description: fields.description?.trim() || null, priority: fields.priority === 'critical' || fields.priority === 'high' || fields.priority === 'low' ? fields.priority : 'medium', due_at: fields.dueAt ? new Date(fields.dueAt).toISOString() : null, created_by: auth.user.id }));
        break;
      case 'staff_invite':
        ({ error } = await auth.supabase.from('staff_invitations').insert({ event_id: eventId!, organizer_id: organizerId!, email: text(fields, 'email', 5, 254).toLowerCase(), role_title: text(fields, 'roleTitle', 2, 120), department: fields.department || null, created_by: auth.user.id }));
        break;
      case 'volunteer_opportunity':
        ({ error } = await auth.supabase.from('volunteer_opportunities').insert({ event_id: eventId!, title: text(fields, 'title', 2, 120), description: fields.description?.trim() || null, required_count: Number(text(fields, 'requiredCount', 1, 5)), created_by: auth.user.id }));
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
        ({ error } = await auth.supabase.from('workspace_channels').upsert([{ workspace_id: workspace.id, kind: 'general', name: 'General', display_order: 1 }, { workspace_id: workspace.id, kind: 'operations', name: 'Operations', display_order: 2 }, { workspace_id: workspace.id, kind: 'announcements', name: 'Announcements', display_order: 3 }], { onConflict: 'workspace_id,kind' }));
        break;
      }
      case 'organization':
        ({ error } = await auth.supabase.from('organizer_profiles').update({ organization_name: text(fields, 'organizationName', 2, 120), description: fields.description?.trim() || null, website_url: fields.website?.trim() || null }).eq('profile_id', auth.user.id));
        break;
    }
    if (error) throw error;
    return NextResponse.json({ ok: true, message: 'Saved to your organizer workspace.' });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to save this workflow.' }, { status: 400 });
  }
}
