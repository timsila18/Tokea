import {
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  HandHeart,
  MapPinned,
  Megaphone,
  Mic2,
  Plane,
  Shield,
  Store,
  Ticket,
  UserCheck,
  Users,
  Utensils,
  WalletCards,
  type LucideIcon,
} from 'lucide-react';

export type AppRole =
  | 'attendee'
  | 'organizer'
  | 'organizer_team_member'
  | 'event_staff'
  | 'volunteer'
  | 'food_vendor'
  | 'transport_provider'
  | 'service_vendor'
  | 'sponsor'
  | 'artist_speaker'
  | 'venue_owner'
  | 'super_admin';

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  roles?: AppRole[];
};

export const appRoles: { value: AppRole; label: string }[] = [
  { value: 'attendee', label: 'Attendee' },
  { value: 'organizer', label: 'Organizer' },
  { value: 'organizer_team_member', label: 'Organizer Team Member' },
  { value: 'event_staff', label: 'Event Staff' },
  { value: 'volunteer', label: 'Volunteer' },
  { value: 'food_vendor', label: 'Food Vendor' },
  { value: 'transport_provider', label: 'Transport Provider' },
  { value: 'service_vendor', label: 'Service Vendor' },
  { value: 'sponsor', label: 'Sponsor' },
  { value: 'artist_speaker', label: 'Artist / Speaker' },
  { value: 'venue_owner', label: 'Venue Owner' },
  { value: 'super_admin', label: 'Super Admin' },
];

export const roleLabels: Record<AppRole, string> = Object.fromEntries(
  appRoles.map((role) => [role.value, role.label]),
) as Record<AppRole, string>;

export const roleDashboards: Record<AppRole, string> = {
  attendee: '/dashboard/attendee',
  organizer: '/dashboard/organizer',
  organizer_team_member: '/dashboard/team',
  event_staff: '/dashboard/staff',
  volunteer: '/dashboard/volunteer',
  food_vendor: '/dashboard/food-vendor',
  transport_provider: '/dashboard/transport',
  service_vendor: '/dashboard/service-vendor',
  sponsor: '/dashboard/sponsor',
  artist_speaker: '/dashboard/artist',
  venue_owner: '/dashboard/venue',
  super_admin: '/admin',
};

export function normalizeRole(role?: string | null): AppRole {
  if (role === 'vendor') return 'service_vendor';
  return appRoles.some((item) => item.value === role) ? (role as AppRole) : 'attendee';
}

export function dashboardForRole(role?: string | null) {
  return roleDashboards[normalizeRole(role)];
}

export const navItems: NavItem[] = [
  { label: 'Public', href: '/', icon: WalletCards },
  { label: 'Events', href: '/events/blankets-and-wine-nairobi', icon: CalendarDays },
  { label: 'Discover', href: '/search', icon: MapPinned },
  { label: 'Tickets', href: '/dashboard/attendee', icon: Ticket, roles: ['attendee', 'super_admin'] },
  { label: 'Organizer', href: '/dashboard/organizer', icon: Users, roles: ['organizer', 'super_admin'] },
  { label: 'Team', href: '/dashboard/team', icon: UserCheck, roles: ['organizer_team_member', 'super_admin'] },
  { label: 'Staff', href: '/dashboard/staff', icon: BadgeCheck, roles: ['event_staff', 'super_admin'] },
  { label: 'Volunteer', href: '/dashboard/volunteer', icon: HandHeart, roles: ['volunteer', 'super_admin'] },
  { label: 'Food Vendor', href: '/dashboard/food-vendor', icon: Utensils, roles: ['food_vendor', 'super_admin'] },
  { label: 'Transport', href: '/dashboard/transport', icon: Plane, roles: ['transport_provider', 'super_admin'] },
  { label: 'Services', href: '/dashboard/service-vendor', icon: Store, roles: ['service_vendor', 'super_admin'] },
  { label: 'Sponsor', href: '/dashboard/sponsor', icon: Megaphone, roles: ['sponsor', 'super_admin'] },
  { label: 'Artist', href: '/dashboard/artist', icon: Mic2, roles: ['artist_speaker', 'super_admin'] },
  { label: 'Venue', href: '/dashboard/venue', icon: BriefcaseBusiness, roles: ['venue_owner', 'super_admin'] },
  { label: 'Admin', href: '/admin', icon: Shield, roles: ['super_admin'] },
];
