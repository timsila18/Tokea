import { OrganizerCommandCenter } from '@/components/OrganizerCommandCenter';
import { RoleGate } from '@/components/RoleGate';

export default function OrganizerDashboardPage() {
  return (
    <RoleGate allowedRoles={['organizer', 'super_admin']}>
      <OrganizerCommandCenter />
    </RoleGate>
  );
}
