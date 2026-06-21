import { DashboardPage } from '@/components/DashboardPage';
import { RoleGate } from '@/components/RoleGate';

export default function StaffDashboardPage() {
  return (
    <RoleGate allowedRoles={['event_staff', 'super_admin']}>
      <DashboardPage
        title="Staff & Volunteer Dashboard"
        description="Assignments, shifts, GPS attendance, tasks, performance, certificates, incidents, and emergency alerts."
        tiles={[
          { label: 'Assignments', value: '4' },
          { label: 'Next Shift', value: '18:00' },
          { label: 'Hours', value: '26' },
          { label: 'Certificates', value: '2' },
        ]}
      />
    </RoleGate>
  );
}
