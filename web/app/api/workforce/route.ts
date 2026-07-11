import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSignedInUser } from '@/lib/authz';
import { demoWorkforceSnapshot, type WorkforceChannel, type WorkforceKind, type WorkforceSnapshot, type WorkforceTask } from '@/lib/workforce';
import { normalizeRole, type AppRole } from '@/lib/roles';

const kindSchema = z.enum(['staff', 'volunteer']);
const actionSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('task_status'), taskId: z.string(), status: z.enum(['Accepted', 'In progress', 'Complete', 'Help requested', 'Photo attached']) }),
  z.object({ action: z.literal('attendance'), kind: z.enum(['check_in', 'check_out']) }),
  z.object({ action: z.literal('solco_message'), channelId: z.string(), body: z.string().min(1).max(1200) }),
  z.object({
    action: z.literal('incident'),
    eventId: z.string(),
    incidentType: z.string().min(2).max(80),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    location: z.string().min(2).max(120),
    assignedTeam: z.enum(['security', 'ushers', 'ticket_scanners', 'parking_staff', 'cleaners', 'media_team', 'photographers', 'videographers', 'mc_team', 'vip_coordinators', 'customer_support', 'backstage_staff', 'operations_team']),
    notes: z.string().min(2).max(1200),
  }),
]);

function canUseWorkforce(role: AppRole, kind: WorkforceKind) {
  return role === 'super_admin' || (kind === 'staff' ? role === 'event_staff' : role === 'volunteer');
}

function roleForStatus(status: string) {
  if (status === 'Complete') return 'done';
  if (status === 'In progress' || status === 'Photo attached') return 'in_progress';
  if (status === 'Help requested') return 'blocked';
  return 'todo';
}

function uiStatus(status?: string | null) {
  if (status === 'done') return 'Complete';
  if (status === 'in_progress') return 'In progress';
  if (status === 'blocked') return 'Help requested';
  return 'Open';
}

function shortTime(value?: string | null) {
  if (!value) return 'Today';
  return new Intl.DateTimeFormat('en-KE', { hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

async function getRole(auth: Awaited<ReturnType<typeof requireSignedInUser>>) {
  if ('error' in auth) return 'attendee' as AppRole;
  const { data } = await auth.supabase.from('users').select('role').eq('id', auth.user.id).maybeSingle();
  return normalizeRole(data?.role ?? auth.user.app_metadata?.role);
}

export async function GET(request: NextRequest) {
  const auth = await requireSignedInUser(request);
  if ('error' in auth) return auth.error;

  const kind = kindSchema.safeParse(request.nextUrl.searchParams.get('kind')).data ?? 'staff';
  const role = await getRole(auth);
  if (!canUseWorkforce(role, kind)) {
    return NextResponse.json({ error: 'This workforce area is not available for your account.' }, { status: 403 });
  }

  const snapshot = await buildSnapshot(auth, kind);
  return NextResponse.json(snapshot);
}

export async function POST(request: NextRequest) {
  const auth = await requireSignedInUser(request);
  if ('error' in auth) return auth.error;

  const kind = kindSchema.safeParse(request.nextUrl.searchParams.get('kind')).data ?? 'staff';
  const role = await getRole(auth);
  if (!canUseWorkforce(role, kind)) {
    return NextResponse.json({ error: 'This workforce area is not available for your account.' }, { status: 403 });
  }

  const parsed = actionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid workforce action.' }, { status: 400 });

  if (parsed.data.action === 'task_status') {
    if (parsed.data.taskId.startsWith('demo-')) return NextResponse.json({ ok: true, message: 'Demo task updated for this session.' });
    const { error } = await auth.supabase
      .from('event_tasks')
      .update({ status: roleForStatus(parsed.data.status), completion_percent: parsed.data.status === 'Complete' ? 100 : undefined, updated_at: new Date().toISOString() })
      .eq('id', parsed.data.taskId);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, message: 'Task saved to Supabase.' });
  }

  const snapshot = await buildSnapshot(auth, kind);
  if (parsed.data.action === 'attendance') {
    if (snapshot.shift.isDemo) return NextResponse.json({ ok: true, message: 'Demo attendance updated for this session.' });
    const now = new Date().toISOString();
    const status = parsed.data.kind === 'check_in' ? 'checked_in' : 'checked_out';
    const update = parsed.data.kind === 'check_in' ? { check_in_at: now, status } : { check_out_at: now, status };
    const [{ error: shiftError }, { error: logError }] = await Promise.all([
      auth.supabase.from('staff_shifts').update(update).eq('id', snapshot.shift.id),
      auth.supabase.from('attendance_logs').insert({ shift_id: snapshot.shift.id, profile_id: auth.user.id, action: parsed.data.kind, notes: 'Captured from Tokea workforce dashboard.' }),
    ]);
    const error = shiftError ?? logError;
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, message: parsed.data.kind === 'check_in' ? 'GPS check-in saved.' : 'GPS check-out saved.' });
  }

  if (parsed.data.action === 'solco_message') {
    if (parsed.data.channelId.startsWith('demo-')) return NextResponse.json({ ok: true, message: 'Demo Solco update posted for this session.' });
    const { error } = await auth.supabase.from('workspace_messages').insert({ channel_id: parsed.data.channelId, sender_id: auth.user.id, body: parsed.data.body.trim() });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, message: 'Solco message posted.' });
  }

  if (parsed.data.action === 'incident') {
    const eventId = parsed.data.eventId === 'demo-event' ? snapshot.event.id : parsed.data.eventId;
    if (eventId === 'demo-event') return NextResponse.json({ ok: true, message: 'Demo incident submitted for this session.' });
    const { error } = await auth.supabase.from('incident_reports').insert({
      event_id: eventId,
      reporter_id: auth.user.id,
      incident_type: parsed.data.incidentType,
      severity: parsed.data.severity,
      assigned_team: parsed.data.assignedTeam,
      title: `${parsed.data.incidentType} at ${parsed.data.location}`,
      description: parsed.data.notes,
      resolution: 'Initial report created. Awaiting command center response.',
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, message: 'Incident saved to Supabase.' });
  }

  return NextResponse.json({ error: 'Unsupported workforce action.' }, { status: 400 });
}

async function buildSnapshot(auth: Exclude<Awaited<ReturnType<typeof requireSignedInUser>>, { error: NextResponse }>, kind: WorkforceKind): Promise<WorkforceSnapshot> {
  const demo = demoWorkforceSnapshot(kind);
  const [{ data: profile }, { data: staffProfile }, { data: volunteerProfile }] = await Promise.all([
    auth.supabase.from('profiles').select('full_name, phone').eq('id', auth.user.id).maybeSingle(),
    auth.supabase.from('staff_profiles').select('id, staff_category, skills, rating_average, past_event_count').eq('profile_id', auth.user.id).maybeSingle(),
    auth.supabase.from('volunteer_profiles').select('id, skills, hours_completed, certificate_count, rating_average').eq('profile_id', auth.user.id).maybeSingle(),
  ]);

  const selectedEvent = await findWorkforceEvent(auth, kind, staffProfile?.id, volunteerProfile?.id);
  if (!selectedEvent) {
    return {
      ...demo,
      profile: {
        ...demo.profile,
        name: profile?.full_name ?? demo.profile.name,
        phone: profile?.phone ?? demo.profile.phone,
        skills: kind === 'staff' ? staffProfile?.skills ?? demo.profile.skills : volunteerProfile?.skills ?? demo.profile.skills,
      },
    };
  }

  const [{ data: tasks }, { data: shifts }, channels] = await Promise.all([
    auth.supabase.from('event_tasks').select('id,title,priority,status,due_at,created_by').eq('event_id', selectedEvent.id).order('due_at', { ascending: true }).limit(8),
    auth.supabase.from('staff_shifts').select('id,name,starts_at,ends_at,status,check_in_at,check_out_at,hours_worked').eq('event_id', selectedEvent.id).order('starts_at', { ascending: true }).limit(4),
    loadChannels(auth, selectedEvent.id),
  ]);

  const taskList: WorkforceTask[] = (tasks ?? []).map((task) => ({
    id: task.id,
    title: task.title,
    priority: task.priority?.[0]?.toUpperCase() + task.priority?.slice(1),
    due: shortTime(task.due_at),
    owner: 'Command Center',
    status: uiStatus(task.status),
    eventTitle: selectedEvent.title,
  }));
  const firstShift = shifts?.[0];
  const attendanceLabel = firstShift?.check_out_at ? 'Checked out' : firstShift?.check_in_at ? 'Checked in' : 'Not checked in';
  const metrics = kind === 'staff'
    ? [
        { label: 'Current shift', value: firstShift ? `${shortTime(firstShift.starts_at)}-${shortTime(firstShift.ends_at)}` : 'Not assigned' },
        { label: 'Attendance', value: attendanceLabel },
        { label: 'Open tasks', value: String(taskList.filter((task) => task.status !== 'Complete').length || demo.tasks.length) },
        { label: 'Pending incidents', value: '0' },
      ]
    : [
        { label: 'Assigned events', value: selectedEvent.isAssigned ? '1' : '0' },
        { label: 'Volunteer hours', value: String(volunteerProfile?.hours_completed ?? 0) },
        { label: 'Applications', value: selectedEvent.isAssigned ? '1' : '0' },
        { label: 'Certificates', value: String(volunteerProfile?.certificate_count ?? 0) },
      ];

  return {
    ...demo,
    profile: {
      ...demo.profile,
      name: profile?.full_name ?? demo.profile.name,
      phone: profile?.phone ?? demo.profile.phone,
      skills: kind === 'staff' ? staffProfile?.skills ?? demo.profile.skills : volunteerProfile?.skills ?? demo.profile.skills,
      rating: String((kind === 'staff' ? staffProfile?.rating_average : volunteerProfile?.rating_average) ?? demo.profile.rating),
      certificates: volunteerProfile?.certificate_count ?? demo.profile.certificates,
      completedEvents: staffProfile?.past_event_count ?? demo.profile.completedEvents,
    },
    event: {
      id: selectedEvent.id,
      title: selectedEvent.title,
      location: selectedEvent.location_name,
      reportTime: new Intl.DateTimeFormat('en-KE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(selectedEvent.starts_at)),
      supervisor: 'Operations Lead',
      startsAt: selectedEvent.starts_at,
    },
    shift: firstShift
      ? { id: firstShift.id, name: firstShift.name, startsAt: shortTime(firstShift.starts_at), endsAt: shortTime(firstShift.ends_at), status: firstShift.status, attendanceLabel }
      : demo.shift,
    tasks: taskList.length ? taskList : demo.tasks,
    metrics,
    channels: channels.length ? channels : demo.channels,
  };
}

async function findWorkforceEvent(auth: Exclude<Awaited<ReturnType<typeof requireSignedInUser>>, { error: NextResponse }>, kind: WorkforceKind, staffProfileId?: string, volunteerProfileId?: string) {
  if (kind === 'staff' && staffProfileId) {
    const { data: assignment } = await auth.supabase.from('staff_assignments').select('event_id').eq('staff_profile_id', staffProfileId).limit(1).maybeSingle();
    if (assignment?.event_id) {
      const { data: event } = await auth.supabase.from('events').select('id,title,location_name,starts_at').eq('id', assignment.event_id).maybeSingle();
      if (event) return { ...event, isAssigned: true };
    }
  }

  if (kind === 'volunteer' && volunteerProfileId) {
    const { data: application } = await auth.supabase.from('volunteer_applications').select('event_id').eq('volunteer_profile_id', volunteerProfileId).in('status', ['approved', 'assigned']).limit(1).maybeSingle();
    if (application?.event_id) {
      const { data: event } = await auth.supabase.from('events').select('id,title,location_name,starts_at').eq('id', application.event_id).maybeSingle();
      if (event) return { ...event, isAssigned: true };
    }
  }

  const { data: event } = await auth.supabase.from('events').select('id,title,location_name,starts_at').eq('status', 'published').order('starts_at', { ascending: true }).limit(1).maybeSingle();
  return event ? { ...event, isAssigned: false } : null;
}

async function loadChannels(auth: Exclude<Awaited<ReturnType<typeof requireSignedInUser>>, { error: NextResponse }>, eventId: string): Promise<WorkforceChannel[]> {
  const { data: workspace } = await auth.supabase.from('event_workspaces').select('id').eq('event_id', eventId).maybeSingle();
  if (!workspace) return [];
  const { data: channels } = await auth.supabase.from('workspace_channels').select('id,name,kind').eq('workspace_id', workspace.id).order('display_order', { ascending: true });
  if (!channels?.length) return [];
  const { data: messages } = await auth.supabase
    .from('workspace_messages')
    .select('id,channel_id,body,created_at,sender:profiles(full_name)')
    .in('channel_id', channels.map((channel) => channel.id))
    .order('created_at', { ascending: true })
    .limit(50);

  return channels.map((channel) => ({
    id: channel.id,
    name: channel.name,
    kind: channel.kind,
    messages: (messages ?? [])
      .filter((message) => message.channel_id === channel.id)
      .map((message) => ({
        id: message.id,
        sender: Array.isArray(message.sender) ? (message.sender[0] as { full_name?: string } | undefined)?.full_name ?? 'Team' : (message.sender as { full_name?: string } | null)?.full_name ?? 'Team',
        body: message.body ?? '',
        createdAt: message.created_at,
      })),
  }));
}
