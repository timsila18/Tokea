export type WorkforceKind = 'staff' | 'volunteer';

export type WorkforceTask = {
  id: string;
  title: string;
  priority: string;
  due: string;
  owner: string;
  status: string;
  eventTitle: string;
  isDemo?: boolean;
};

export type WorkforceChannel = {
  id: string;
  name: string;
  kind: string;
  messages: { id: string; sender: string; body: string; createdAt: string; isDemo?: boolean }[];
  isDemo?: boolean;
};

export type WorkforceSnapshot = {
  kind: WorkforceKind;
  profile: {
    name: string;
    phone: string;
    roleLabel: string;
    city: string;
    skills: string[];
    rating: string;
    certificates: number;
    completedEvents: number;
  };
  event: {
    id: string;
    title: string;
    location: string;
    reportTime: string;
    supervisor: string;
    startsAt: string;
    isDemo?: boolean;
  };
  shift: {
    id: string;
    name: string;
    startsAt: string;
    endsAt: string;
    status: string;
    attendanceLabel: string;
    isDemo?: boolean;
  };
  tasks: WorkforceTask[];
  metrics: { label: string; value: string }[];
  channels: WorkforceChannel[];
  announcements: { title: string; body: string }[];
  knowledgeBase: string[];
};

export const demoStaffTasks: WorkforceTask[] = [
  { id: 'demo-staff-task-1', title: 'Verify VIP entrance scanners', priority: 'Critical', due: '4:30 PM', owner: 'Operations Lead', status: 'Open', eventTitle: 'Blankets & Wine Nairobi', isDemo: true },
  { id: 'demo-staff-task-2', title: 'Brief ushers at Gate B', priority: 'High', due: '5:00 PM', owner: 'Supervisor', status: 'Accepted', eventTitle: 'Blankets & Wine Nairobi', isDemo: true },
  { id: 'demo-staff-task-3', title: 'Upload crowd flow photos', priority: 'Medium', due: '7:00 PM', owner: 'Command Center', status: 'In progress', eventTitle: 'Blankets & Wine Nairobi', isDemo: true },
];

export const demoVolunteerTasks: WorkforceTask[] = [
  { id: 'demo-volunteer-task-1', title: 'Welcome guests at information desk', priority: 'High', due: '12:30 PM', owner: 'Volunteer Lead', status: 'Accepted', eventTitle: 'Blankets & Wine Nairobi', isDemo: true },
  { id: 'demo-volunteer-task-2', title: 'Guide guests to Foodo pickup', priority: 'Medium', due: '2:00 PM', owner: 'Guest Experience', status: 'Open', eventTitle: 'Blankets & Wine Nairobi', isDemo: true },
  { id: 'demo-volunteer-task-3', title: 'Collect lost and found forms', priority: 'Medium', due: '5:30 PM', owner: 'Support Desk', status: 'Open', eventTitle: 'Blankets & Wine Nairobi', isDemo: true },
];

export const demoChannels: WorkforceChannel[] = [
  {
    id: 'demo-operations',
    name: 'Operations',
    kind: 'operations',
    isDemo: true,
    messages: [
      { id: 'demo-message-1', sender: 'Command', body: 'Confirm your location and radio status.', createdAt: new Date().toISOString(), isDemo: true },
      { id: 'demo-message-2', sender: 'Team Lead', body: 'Gate B handover starts at 11:45 AM.', createdAt: new Date().toISOString(), isDemo: true },
      { id: 'demo-message-3', sender: 'You', body: 'Acknowledged. I am on my way to the checkpoint.', createdAt: new Date().toISOString(), isDemo: true },
    ],
  },
  ...['General', 'Security', 'VIP', 'Emergency', 'Staff', 'Volunteer', 'Announcements'].map((name) => ({
    id: `demo-${name.toLowerCase()}`,
    name,
    kind: name.toLowerCase(),
    isDemo: true,
    messages: [],
  })),
];

export function demoWorkforceSnapshot(kind: WorkforceKind): WorkforceSnapshot {
  const isStaff = kind === 'staff';
  return {
    kind,
    profile: {
      name: isStaff ? 'Tokea Staff' : 'Tokea Volunteer',
      phone: isStaff ? '0700 000 003' : '0700 000 004',
      roleLabel: isStaff ? 'Event Staff' : 'Volunteer',
      city: 'Nairobi',
      skills: ['crowd flow', 'guest support', 'emergency response', 'event communications'],
      rating: '4.8',
      certificates: isStaff ? 2 : 1,
      completedEvents: isStaff ? 5 : 2,
    },
    event: {
      id: 'demo-event',
      title: 'Blankets & Wine Nairobi',
      location: 'Uhuru Gardens, Gate B',
      reportTime: '4 Jul 2026, report 11:30 AM',
      supervisor: 'Amina Otieno, Operations Lead',
      startsAt: '2026-07-04T09:00:00+03:00',
      isDemo: true,
    },
    shift: {
      id: 'demo-shift',
      name: 'Event day shift',
      startsAt: '12:00',
      endsAt: '20:00',
      status: 'scheduled',
      attendanceLabel: 'Not checked in',
      isDemo: true,
    },
    tasks: isStaff ? demoStaffTasks : demoVolunteerTasks,
    metrics: isStaff
      ? [['Current shift', '12:00-20:00'], ['Attendance', 'Not checked in'], ['Open tasks', '3'], ['Pending incidents', '2']].map(([label, value]) => ({ label, value }))
      : [['Assigned events', '2'], ['Volunteer hours', '34'], ['Applications', '2'], ['Certificates', '1']].map(([label, value]) => ({ label, value })),
    channels: demoChannels,
    announcements: [
      { title: 'Shift change', body: 'Gate B team reports 30 minutes earlier.' },
      { title: 'Safety briefing', body: 'Emergency procedure review at command tent.' },
      { title: 'Venue update', body: 'VIP holding area moved near the media wall.' },
    ],
    knowledgeBase: ['Event SOPs', 'Volunteer Guide', 'Staff Guide', 'Emergency Procedures', 'Venue Rules', 'Safety Procedures'],
  };
}
