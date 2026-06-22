import { AttendeeHome } from '@/components/AttendeeHome';
import { RoleGate } from '@/components/RoleGate';

export default function AttendeeDashboardPage() {
  return (
    <RoleGate allowedRoles={['attendee', 'super_admin']}>
      <AttendeeHome />
    </RoleGate>
  );
}
