'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Bell, BookOpen, CalendarClock, Camera, CheckCircle2, Clock, Download, FileBadge, HeartHandshake, LifeBuoy, MapPin, MessageCircle, Navigation, Phone, ShieldAlert, Star, Upload, UserCheck, Users } from 'lucide-react';
import { demoWorkforceSnapshot, type WorkforceChannel, type WorkforceKind, type WorkforceSnapshot, type WorkforceTask } from '@/lib/workforce';

export function WorkforceWorkspace({ kind, module = 'dashboard' }: { kind: WorkforceKind; module?: string }) {
  const isStaff = kind === 'staff';
  const [snapshot, setSnapshot] = useState<WorkforceSnapshot>(() => demoWorkforceSnapshot(kind));
  const [attendance, setAttendance] = useState<'Not checked in' | 'Checked in' | 'Checked out'>(snapshot.shift.attendanceLabel as 'Not checked in' | 'Checked in' | 'Checked out');
  const [taskStatus, setTaskStatus] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [incidentOpen, setIncidentOpen] = useState(false);
  const [activeChannel, setActiveChannel] = useState('Operations');
  const activeChannelRecord = useMemo(() => snapshot.channels.find((channel) => channel.name === activeChannel) ?? snapshot.channels[0], [activeChannel, snapshot.channels]);
  const tasks = snapshot.tasks;
  const basePath = isStaff ? '/dashboard/staff' : '/dashboard/volunteer';

  async function refresh() {
    setLoading(true);
    try {
      const response = await fetch(`/api/workforce?kind=${kind}`, { cache: 'no-store' });
      if (!response.ok) throw new Error('Unable to load workforce data.');
      const data = await response.json() as WorkforceSnapshot;
      setSnapshot(data);
      setAttendance(data.shift.attendanceLabel as 'Not checked in' | 'Checked in' | 'Checked out');
      setActiveChannel((current) => data.channels.some((channel) => channel.name === current) ? current : data.channels[0]?.name ?? 'Operations');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to load workforce data.');
    } finally {
      setLoading(false);
    }
  }

  async function postAction(payload: Record<string, unknown>) {
    const response = await fetch(`/api/workforce?kind=${kind}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error ?? 'Unable to save this action.');
    return body.message as string | undefined;
  }

  useEffect(() => {
    void refresh();
  }, [kind]);

  const updateTask = async (task: WorkforceTask, status: string) => {
    setTaskStatus((current) => ({ ...current, [task.id]: status }));
    try {
      const message = await postAction({ action: 'task_status', taskId: task.id, status });
      setNotice(message ?? `${task.title} marked as ${status.toLowerCase()}.`);
      if (!task.isDemo) void refresh();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to update task.');
    }
  };

  const checkIn = async () => {
    setAttendance('Checked in');
    try {
      const message = await postAction({ action: 'attendance', kind: 'check_in' });
      setNotice(message ?? 'GPS check-in captured.');
      if (!snapshot.shift.isDemo) void refresh();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to save check-in.');
    }
  };

  const checkOut = async () => {
    setAttendance('Checked out');
    try {
      const message = await postAction({ action: 'attendance', kind: 'check_out' });
      setNotice(message ?? 'GPS check-out captured. Supervisor approval pending.');
      if (!snapshot.shift.isDemo) void refresh();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to save check-out.');
    }
  };

  const emergency = () => {
    setIncidentOpen(true);
    setNotice('Emergency alert prepared for Operations, Security, Medical, and Organizer command.');
  };

  const postSolcoMessage = async (body: string) => {
    if (!activeChannelRecord) return;
    try {
      const message = await postAction({ action: 'solco_message', channelId: activeChannelRecord.id, body });
      setNotice(message ?? 'Solco update posted.');
      if (!activeChannelRecord.isDemo) void refresh();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to post Solco update.');
    }
  };

  const submitIncident = async (fields: { incidentType: string; severity: string; location: string; assignedTeam: string; notes: string }) => {
    try {
      const message = await postAction({ action: 'incident', eventId: snapshot.event.id, ...fields });
      setNotice(message ?? 'Incident submitted to command center for triage.');
      if (!snapshot.event.isDemo) void refresh();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to submit incident.');
    }
  };

  return (
    <div className="workforce-page">
      <header className="workforce-hero">
        <div>
          <p className="section-kicker">{isStaff ? 'Staff operations' : 'Volunteer command'}</p>
          <h1>{isStaff ? 'Run the event floor with confidence.' : 'Know where to help, when, and why.'}</h1>
          <p>{isStaff ? 'Assignments, shifts, attendance, incidents, Solco, and performance in one clean command surface.' : 'Assigned events, applications, hours, certificates, opportunities, Solco, and growth in one workspace.'}</p>
        </div>
        <button type="button" className="emergency-button" onClick={emergency}><ShieldAlert size={18} />Emergency</button>
      </header>

      <nav className="workforce-tabs" aria-label={`${kind} workspace sections`}>
        {(isStaff ? [['Dashboard', basePath], ['Tasks', `${basePath}/tasks`], ['Attendance', `${basePath}/attendance`], ['Solco', `${basePath}/solco`], ['Profile', `${basePath}/profile`]] : [['Dashboard', basePath], ['Tasks', `${basePath}/tasks`], ['Hours', `${basePath}/hours`], ['Solco', `${basePath}/solco`], ['Profile', `${basePath}/profile`]]).map(([label, href]) => (
          <Link key={href} className={(module === 'dashboard' && href === basePath) || href.endsWith(module) ? 'active' : undefined} href={href}>{label}</Link>
        ))}
      </nav>

      {loading ? <p className="wallet-action-notice" role="status"><Clock size={16} />Loading live workforce data...</p> : null}
      {notice ? <p className="wallet-action-notice" role="status"><CheckCircle2 size={16} />{notice}</p> : null}

      {module === 'dashboard' ? <DashboardPanel snapshot={snapshot} isStaff={isStaff} attendance={attendance} checkIn={checkIn} emergency={emergency} basePath={basePath} /> : null}
      {module === 'tasks' ? <TasksPanel tasks={tasks} taskStatus={taskStatus} updateTask={updateTask} isStaff={isStaff} /> : null}
      {(module === 'attendance' || module === 'hours') ? <AttendancePanel isStaff={isStaff} attendance={attendance} checkIn={checkIn} checkOut={checkOut} /> : null}
      {module === 'solco' ? <SolcoPanel channels={snapshot.channels} activeChannel={activeChannel} setActiveChannel={setActiveChannel} isStaff={isStaff} postSolcoMessage={postSolcoMessage} /> : null}
      {module === 'profile' ? <ProfilePanel snapshot={snapshot} isStaff={isStaff} setNotice={setNotice} /> : null}

      <section className="workforce-grid two">
        <article className="workforce-card">
          <div className="workforce-card-head"><div><span>Announcements</span><h2>Latest updates</h2></div><Bell size={20} /></div>
          <div className="workforce-list">
            {snapshot.announcements.map((item) => <p key={item.title}><strong>{item.title}</strong><span>{item.body}</span></p>)}
          </div>
        </article>
        <article className="workforce-card">
          <div className="workforce-card-head"><div><span>Knowledge base</span><h2>Guides and SOPs</h2></div><BookOpen size={20} /></div>
          <div className="kb-list">
            {snapshot.knowledgeBase.map((item) => <button type="button" key={item} onClick={() => setNotice(`${item} opened for review.`)}>{item}</button>)}
          </div>
        </article>
      </section>

      {incidentOpen ? <IncidentDialog close={() => setIncidentOpen(false)} submitIncident={submitIncident} /> : null}
    </div>
  );
}

function DashboardPanel({ snapshot, isStaff, attendance, checkIn, emergency, basePath }: { snapshot: WorkforceSnapshot; isStaff: boolean; attendance: string; checkIn: () => void; emergency: () => void; basePath: string }) {
  return (
    <>
      <section className="today-event-card">
        <div>
          <span>Today's event</span>
          <h2>{snapshot.event.title}</h2>
          <p><CalendarClock size={15} />{snapshot.event.reportTime}</p>
          <p><MapPin size={15} />{snapshot.event.location}</p>
          <p><Users size={15} />Supervisor: {snapshot.event.supervisor}</p>
        </div>
        <div className="today-actions">
          <button type="button" onClick={() => window.open('https://maps.google.com/?q=Uhuru+Gardens+Nairobi', '_blank', 'noopener,noreferrer')}><Navigation size={16} />Open map</button>
          <button type="button" onClick={checkIn}><UserCheck size={16} />{attendance === 'Checked in' ? 'Checked in' : 'Check-in'}</button>
          <Link href={`${basePath}/tasks`}>View tasks</Link>
          <a href="tel:+254700000001"><Phone size={16} />Call supervisor</a>
        </div>
      </section>

      <section className="workforce-metrics">
        {snapshot.metrics.map(({ label, value }) => <article key={label}><span>{label}</span><strong>{label === 'Attendance' ? attendance : value}</strong></article>)}
      </section>

      <section className="workforce-grid three">
        <ShiftCard />
        <PerformanceCard isStaff={isStaff} />
        <article className="workforce-card emergency-panel">
          <div className="workforce-card-head"><div><span>Emergency response</span><h2>One-tap escalation</h2></div><AlertTriangle size={20} /></div>
          <p>Notify Operations Lead, Security Lead, Medical Team, Organizer, and Event Command Center.</p>
          <button type="button" className="button" onClick={emergency}>Prepare emergency report</button>
        </article>
      </section>
    </>
  );
}

function ShiftCard() {
  return <article className="workforce-card"><div className="workforce-card-head"><div><span>Shift management</span><h2>Coverage today</h2></div><Clock size={20} /></div><dl className="workforce-dl"><div><dt>Upcoming</dt><dd>2</dd></div><div><dt>Completed</dt><dd>5</dd></div><div><dt>Hours worked</dt><dd>26</dd></div><div><dt>Attendance</dt><dd>96%</dd></div><div><dt>Late arrivals</dt><dd>1</dd></div><div><dt>Missed shifts</dt><dd>0</dd></div></dl></article>;
}

function PerformanceCard({ isStaff }: { isStaff: boolean }) {
  return <article className="workforce-card"><div className="workforce-card-head"><div><span>{isStaff ? 'Staff performance' : 'Volunteer growth'}</span><h2>{isStaff ? 'Execution score' : 'Impact score'}</h2></div><Star size={20} /></div><dl className="workforce-dl"><div><dt>Attendance</dt><dd>96%</dd></div><div><dt>Tasks done</dt><dd>18</dd></div><div><dt>Rating</dt><dd>4.8</dd></div><div><dt>Certificates</dt><dd>2</dd></div></dl></article>;
}

function TasksPanel({ tasks, taskStatus, updateTask, isStaff }: { tasks: WorkforceTask[]; taskStatus: Record<string, string>; updateTask: (task: WorkforceTask, status: string) => void; isStaff: boolean }) {
  return <section className="workforce-card"><div className="workforce-card-head"><div><span>{isStaff ? 'Task management' : 'Volunteer tasks'}</span><h2>Assignments you can act on</h2></div><Upload size={20} /></div><div className="task-stack">{tasks.map((task) => <article key={task.id} className="workforce-task"><div><span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span><h3>{task.title}</h3><p>Due {task.due} - Assigned by {task.owner}</p><p>Related event: {task.eventTitle}</p></div><div className="task-actions"><button type="button" onClick={() => updateTask(task, 'Accepted')}>Accept</button><button type="button" onClick={() => updateTask(task, 'In progress')}>Progress</button><button type="button" onClick={() => updateTask(task, 'Complete')}>Complete</button><button type="button" onClick={() => updateTask(task, 'Help requested')}>Request help</button><button type="button" onClick={() => updateTask(task, 'Photo attached')}><Camera size={15} />Photo</button></div><strong>{taskStatus[task.id] ?? task.status}</strong></article>)}</div></section>;
}

function AttendancePanel({ isStaff, attendance, checkIn, checkOut }: { isStaff: boolean; attendance: string; checkIn: () => void; checkOut: () => void }) {
  const labels = isStaff ? ['GPS attendance', 'Supervisor approval', 'Selfie verification', 'Incident availability'] : ['Hours tracking', 'Supervisor sign-off', 'Opportunity status', 'Certificate eligibility'];
  return <section className="workforce-grid two"><article className="workforce-card attendance-card"><div className="workforce-card-head"><div><span>{isStaff ? 'GPS attendance' : 'Volunteer hours'}</span><h2>{attendance}</h2></div><MapPin size={20} /></div><p>Location verification: Uhuru Gardens perimeter. Timestamp capture is ready for supervisor approval.</p><div className="attendance-actions"><button type="button" onClick={checkIn}>GPS Check-In</button><button type="button" onClick={checkOut}>GPS Check-Out</button></div></article><article className="workforce-card"><div className="workforce-card-head"><div><span>Audit trail</span><h2>Statuses</h2></div><CheckCircle2 size={20} /></div><div className="status-grid">{labels.map((label, index) => <span key={label} className={index < 2 ? 'good' : 'warn'}>{label}</span>)}<span>On Time</span><span>Approved</span><span>Late</span><span>Rejected</span></div></article></section>;
}

function SolcoPanel({ channels, activeChannel, setActiveChannel, isStaff, postSolcoMessage }: { channels: WorkforceChannel[]; activeChannel: string; setActiveChannel: (channel: string) => void; isStaff: boolean; postSolcoMessage: (body: string) => void }) {
  const channel = channels.find((item) => item.name === activeChannel) ?? channels[0];
  const [message, setMessage] = useState('');
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!message.trim()) return;
    postSolcoMessage(message.trim());
    setMessage('');
  };
  return <section className="workforce-grid solco-layout"><article className="workforce-card"><div className="workforce-card-head"><div><span>Solco workspace</span><h2>Channels</h2></div><MessageCircle size={20} /></div><div className="channel-list">{channels.map((item) => <button type="button" className={activeChannel === item.name ? 'active' : ''} key={item.id} onClick={() => setActiveChannel(item.name)}>{item.name}</button>)}</div></article><article className="workforce-card channel-thread"><div className="workforce-card-head"><div><span>{channel?.name ?? activeChannel}</span><h2>{isStaff ? 'Event operations thread' : 'Volunteer coordination thread'}</h2></div><MessageCircle size={20} /></div>{channel?.messages.length ? channel.messages.map((item) => <p key={item.id}><strong>{item.sender}:</strong> {item.body}</p>) : <p>No messages yet. Start the channel update.</p>}<form onSubmit={submit}><label>Add update<textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Write a Solco update..." /></label><button type="submit" className="button">Post update</button></form></article></section>;
}

function ProfilePanel({ snapshot, isStaff, setNotice }: { snapshot: WorkforceSnapshot; isStaff: boolean; setNotice: (message: string) => void }) {
  return <section className="workforce-grid two"><article className="workforce-card profile-workforce"><div className="profile-avatar"><Users size={28} /></div><div><span>{snapshot.profile.roleLabel}</span><h2>{snapshot.profile.name}</h2><p>{snapshot.profile.phone} - {snapshot.profile.city}</p><p>Skills: {snapshot.profile.skills.join(', ') || 'event operations'}</p></div><button type="button" className="button secondary" onClick={() => setNotice('Profile update saved for this session.')}>Save profile</button></article><article className="workforce-card"><div className="workforce-card-head"><div><span>Certificates</span><h2>{snapshot.profile.certificates} available</h2></div><FileBadge size={20} /></div><div className="certificate-list"><button type="button" onClick={() => setNotice('Participation certificate PDF is being prepared.')}><Download size={16} />Participation Certificate</button><button type="button" onClick={() => setNotice('Excellence certificate PDF is being prepared.')}><Download size={16} />Excellence Certificate</button><button type="button" onClick={() => setNotice('Event support certificate PDF is being prepared.')}><Download size={16} />Event Support Certificate</button></div></article></section>;
}

function IncidentDialog({ close, submitIncident }: { close: () => void; submitIncident: (fields: { incidentType: string; severity: string; location: string; assignedTeam: string; notes: string }) => void }) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    submitIncident({
      incidentType: String(form.get('incidentType') ?? 'security'),
      severity: String(form.get('severity') ?? 'medium'),
      location: String(form.get('location') ?? 'Gate B'),
      assignedTeam: String(form.get('assignedTeam') ?? 'operations_team'),
      notes: String(form.get('notes') ?? 'Initial report created. Awaiting command center response.'),
    });
    close();
  };
  return <div className="workflow-backdrop"><div className="workflow-dialog"><div className="workflow-head"><div><h2>Report incident</h2><p>Send structured incident details to the event command center.</p></div><button type="button" className="icon-button" onClick={close}>x</button></div><form className="workflow-form" onSubmit={submit}><div className="workflow-grid"><label>Incident type<select name="incidentType" defaultValue="security"><option value="security">Security Incident</option><option value="medical">Medical Incident</option><option value="lost_item">Lost Item</option><option value="crowd">Crowd Control Issue</option><option value="equipment">Equipment Failure</option><option value="vendor">Vendor Issue</option><option value="emergency">Emergency</option></select></label><label>Severity<select name="severity" defaultValue="medium"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></label><label>Location<input name="location" defaultValue="Gate B" /></label><label>Assigned team<select name="assignedTeam" defaultValue="operations_team"><option value="operations_team">Operations Team</option><option value="security">Security</option><option value="customer_support">Customer Support</option><option value="vip_coordinators">VIP Coordinators</option><option value="ushers">Ushers</option></select></label><label className="wide">Resolution notes<textarea name="notes" defaultValue="Initial report created. Awaiting command center response." /></label></div><div className="workflow-actions"><button type="button" className="button secondary" onClick={close}>Cancel</button><button type="submit" className="button"><LifeBuoy size={16} />Submit incident</button></div></form></div></div>;
}
