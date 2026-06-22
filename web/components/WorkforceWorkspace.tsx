'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AlertTriangle, Bell, BookOpen, CalendarClock, Camera, CheckCircle2, Clock, Download, FileBadge, HeartHandshake, LifeBuoy, MapPin, MessageCircle, Navigation, Phone, ShieldAlert, Star, Upload, UserCheck, Users } from 'lucide-react';

type WorkforceKind = 'staff' | 'volunteer';

const staffTasks = [
  { title: 'Verify VIP entrance scanners', priority: 'Critical', due: '4:30 PM', owner: 'Operations Lead', status: 'Open' },
  { title: 'Brief ushers at Gate B', priority: 'High', due: '5:00 PM', owner: 'Supervisor', status: 'Accepted' },
  { title: 'Upload crowd flow photos', priority: 'Medium', due: '7:00 PM', owner: 'Command Center', status: 'In progress' },
];

const volunteerTasks = [
  { title: 'Welcome guests at information desk', priority: 'High', due: '12:30 PM', owner: 'Volunteer Lead', status: 'Accepted' },
  { title: 'Guide guests to Foodo pickup', priority: 'Medium', due: '2:00 PM', owner: 'Guest Experience', status: 'Open' },
  { title: 'Collect lost and found forms', priority: 'Medium', due: '5:30 PM', owner: 'Support Desk', status: 'Open' },
];

const solcoChannels = ['General', 'Operations', 'Security', 'VIP', 'Emergency', 'Staff', 'Volunteer', 'Announcements'];
const knowledgeBase = ['Event SOPs', 'Volunteer Guide', 'Staff Guide', 'Emergency Procedures', 'Venue Rules', 'Safety Procedures'];

export function WorkforceWorkspace({ kind, module = 'dashboard' }: { kind: WorkforceKind; module?: string }) {
  const isStaff = kind === 'staff';
  const [attendance, setAttendance] = useState<'Not checked in' | 'Checked in' | 'Checked out'>('Not checked in');
  const [taskStatus, setTaskStatus] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState('');
  const [incidentOpen, setIncidentOpen] = useState(false);
  const [activeChannel, setActiveChannel] = useState('Operations');
  const tasks = isStaff ? staffTasks : volunteerTasks;
  const basePath = isStaff ? '/dashboard/staff' : '/dashboard/volunteer';

  const updateTask = (title: string, status: string) => {
    setTaskStatus((current) => ({ ...current, [title]: status }));
    setNotice(`${title} marked as ${status.toLowerCase()}.`);
  };

  const checkIn = () => {
    setAttendance('Checked in');
    setNotice('GPS check-in captured at Uhuru Gardens, Gate B.');
  };

  const checkOut = () => {
    setAttendance('Checked out');
    setNotice('GPS check-out captured. Supervisor approval pending.');
  };

  const emergency = () => {
    setIncidentOpen(true);
    setNotice('Emergency alert prepared for Operations, Security, Medical, and Organizer command.');
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

      {notice ? <p className="wallet-action-notice" role="status"><CheckCircle2 size={16} />{notice}</p> : null}

      {module === 'dashboard' ? <DashboardPanel isStaff={isStaff} attendance={attendance} checkIn={checkIn} emergency={emergency} basePath={basePath} /> : null}
      {module === 'tasks' ? <TasksPanel tasks={tasks} taskStatus={taskStatus} updateTask={updateTask} isStaff={isStaff} /> : null}
      {(module === 'attendance' || module === 'hours') ? <AttendancePanel isStaff={isStaff} attendance={attendance} checkIn={checkIn} checkOut={checkOut} /> : null}
      {module === 'solco' ? <SolcoPanel activeChannel={activeChannel} setActiveChannel={setActiveChannel} isStaff={isStaff} /> : null}
      {module === 'profile' ? <ProfilePanel isStaff={isStaff} setNotice={setNotice} /> : null}

      <section className="workforce-grid two">
        <article className="workforce-card">
          <div className="workforce-card-head"><div><span>Announcements</span><h2>Latest updates</h2></div><Bell size={20} /></div>
          <div className="workforce-list">
            <p><strong>Shift change</strong><span>Gate B team reports 30 minutes earlier.</span></p>
            <p><strong>Safety briefing</strong><span>Emergency procedure review at command tent.</span></p>
            <p><strong>Venue update</strong><span>VIP holding area moved near the media wall.</span></p>
          </div>
        </article>
        <article className="workforce-card">
          <div className="workforce-card-head"><div><span>Knowledge base</span><h2>Guides and SOPs</h2></div><BookOpen size={20} /></div>
          <div className="kb-list">
            {knowledgeBase.map((item) => <button type="button" key={item} onClick={() => setNotice(`${item} opened for review.`)}>{item}</button>)}
          </div>
        </article>
      </section>

      {incidentOpen ? <IncidentDialog close={() => setIncidentOpen(false)} setNotice={setNotice} /> : null}
    </div>
  );
}

function DashboardPanel({ isStaff, attendance, checkIn, emergency, basePath }: { isStaff: boolean; attendance: string; checkIn: () => void; emergency: () => void; basePath: string }) {
  return (
    <>
      <section className="today-event-card">
        <div>
          <span>Today's event</span>
          <h2>Blankets & Wine Nairobi</h2>
          <p><CalendarClock size={15} />4 Jul 2026, report 11:30 AM</p>
          <p><MapPin size={15} />Uhuru Gardens, Gate B</p>
          <p><Users size={15} />Supervisor: Amina Otieno, Operations Lead</p>
        </div>
        <div className="today-actions">
          <button type="button" onClick={() => window.open('https://maps.google.com/?q=Uhuru+Gardens+Nairobi', '_blank', 'noopener,noreferrer')}><Navigation size={16} />Open map</button>
          <button type="button" onClick={checkIn}><UserCheck size={16} />{attendance === 'Checked in' ? 'Checked in' : 'Check-in'}</button>
          <Link href={`${basePath}/tasks`}>View tasks</Link>
          <a href="tel:+254700000001"><Phone size={16} />Call supervisor</a>
        </div>
      </section>

      <section className="workforce-metrics">
        {(isStaff ? [['Current shift', '12:00-20:00'], ['Attendance', attendance], ['Open tasks', '3'], ['Pending incidents', '2']] : [['Assigned events', '2'], ['Volunteer hours', '34'], ['Applications', '2'], ['Certificates', '1']]).map(([label, value]) => <article key={label}><span>{label}</span><strong>{value}</strong></article>)}
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

function TasksPanel({ tasks, taskStatus, updateTask, isStaff }: { tasks: typeof staffTasks; taskStatus: Record<string, string>; updateTask: (title: string, status: string) => void; isStaff: boolean }) {
  return <section className="workforce-card"><div className="workforce-card-head"><div><span>{isStaff ? 'Task management' : 'Volunteer tasks'}</span><h2>Assignments you can act on</h2></div><Upload size={20} /></div><div className="task-stack">{tasks.map((task) => <article key={task.title} className="workforce-task"><div><span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span><h3>{task.title}</h3><p>Due {task.due} - Assigned by {task.owner}</p><p>Related event: Blankets & Wine Nairobi</p></div><div className="task-actions"><button type="button" onClick={() => updateTask(task.title, 'Accepted')}>Accept</button><button type="button" onClick={() => updateTask(task.title, 'In progress')}>Progress</button><button type="button" onClick={() => updateTask(task.title, 'Complete')}>Complete</button><button type="button" onClick={() => updateTask(task.title, 'Help requested')}>Request help</button><button type="button" onClick={() => updateTask(task.title, 'Photo attached')}><Camera size={15} />Photo</button></div><strong>{taskStatus[task.title] ?? task.status}</strong></article>)}</div></section>;
}

function AttendancePanel({ isStaff, attendance, checkIn, checkOut }: { isStaff: boolean; attendance: string; checkIn: () => void; checkOut: () => void }) {
  const labels = isStaff ? ['GPS attendance', 'Supervisor approval', 'Selfie verification', 'Incident availability'] : ['Hours tracking', 'Supervisor sign-off', 'Opportunity status', 'Certificate eligibility'];
  return <section className="workforce-grid two"><article className="workforce-card attendance-card"><div className="workforce-card-head"><div><span>{isStaff ? 'GPS attendance' : 'Volunteer hours'}</span><h2>{attendance}</h2></div><MapPin size={20} /></div><p>Location verification: Uhuru Gardens perimeter. Timestamp capture is ready for supervisor approval.</p><div className="attendance-actions"><button type="button" onClick={checkIn}>GPS Check-In</button><button type="button" onClick={checkOut}>GPS Check-Out</button></div></article><article className="workforce-card"><div className="workforce-card-head"><div><span>Audit trail</span><h2>Statuses</h2></div><CheckCircle2 size={20} /></div><div className="status-grid">{labels.map((label, index) => <span key={label} className={index < 2 ? 'good' : 'warn'}>{label}</span>)}<span>On Time</span><span>Approved</span><span>Late</span><span>Rejected</span></div></article></section>;
}

function SolcoPanel({ activeChannel, setActiveChannel, isStaff }: { activeChannel: string; setActiveChannel: (channel: string) => void; isStaff: boolean }) {
  return <section className="workforce-grid solco-layout"><article className="workforce-card"><div className="workforce-card-head"><div><span>Solco workspace</span><h2>Channels</h2></div><MessageCircle size={20} /></div><div className="channel-list">{solcoChannels.map((channel) => <button type="button" className={activeChannel === channel ? 'active' : ''} key={channel} onClick={() => setActiveChannel(channel)}>{channel}</button>)}</div></article><article className="workforce-card channel-thread"><div className="workforce-card-head"><div><span>{activeChannel}</span><h2>{isStaff ? 'Event operations thread' : 'Volunteer coordination thread'}</h2></div><MessageCircle size={20} /></div><p><strong>Command:</strong> Confirm your location and radio status.</p><p><strong>{isStaff ? 'Security Lead' : 'Volunteer Lead'}:</strong> Gate B handover starts at 11:45 AM.</p><p><strong>You:</strong> Acknowledged. I am on my way to the checkpoint.</p><label>Add update<textarea placeholder="Write a Solco update..." /></label><button type="button" className="button">Post update</button></article></section>;
}

function ProfilePanel({ isStaff, setNotice }: { isStaff: boolean; setNotice: (message: string) => void }) {
  return <section className="workforce-grid two"><article className="workforce-card profile-workforce"><div className="profile-avatar"><Users size={28} /></div><div><span>{isStaff ? 'Event Staff' : 'Volunteer'}</span><h2>{isStaff ? 'Tokea Staff' : 'Tokea Volunteer'}</h2><p>{isStaff ? '0700 000 003' : '0700 000 004'} - Nairobi</p><p>Skills: crowd flow, guest support, emergency response, event communications.</p></div><button type="button" className="button secondary" onClick={() => setNotice('Profile update saved for this session.')}>Save profile</button></article><article className="workforce-card"><div className="workforce-card-head"><div><span>Certificates</span><h2>Download foundation</h2></div><FileBadge size={20} /></div><div className="certificate-list"><button type="button" onClick={() => setNotice('Participation certificate PDF is being prepared.')}><Download size={16} />Participation Certificate</button><button type="button" onClick={() => setNotice('Excellence certificate PDF is being prepared.')}><Download size={16} />Excellence Certificate</button><button type="button" onClick={() => setNotice('Event support certificate PDF is being prepared.')}><Download size={16} />Event Support Certificate</button></div></article></section>;
}

function IncidentDialog({ close, setNotice }: { close: () => void; setNotice: (message: string) => void }) {
  return <div className="workflow-backdrop"><div className="workflow-dialog"><div className="workflow-head"><div><h2>Report incident</h2><p>Send structured incident details to the event command center.</p></div><button type="button" className="icon-button" onClick={close}>x</button></div><form className="workflow-form" onSubmit={(event) => { event.preventDefault(); setNotice('Incident submitted to command center for triage.'); close(); }}><div className="workflow-grid"><label>Incident type<select defaultValue="security"><option value="security">Security Incident</option><option value="medical">Medical Incident</option><option value="lost_item">Lost Item</option><option value="crowd">Crowd Control Issue</option><option value="equipment">Equipment Failure</option><option value="vendor">Vendor Issue</option><option value="emergency">Emergency</option></select></label><label>Severity<select defaultValue="medium"><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select></label><label>Location<input defaultValue="Gate B" /></label><label>Assigned team<input defaultValue="Operations and Security" /></label><label className="wide">Resolution notes<textarea defaultValue="Initial report created. Awaiting command center response." /></label></div><div className="workflow-actions"><button type="button" className="button secondary" onClick={close}>Cancel</button><button type="submit" className="button"><LifeBuoy size={16} />Submit incident</button></div></form></div></div>;
}
