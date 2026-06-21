import { DashboardPage } from '@/components/DashboardPage';
import { ModuleTable } from '@/components/ModuleTable';
import { RoleGate } from '@/components/RoleGate';

export default function VolunteerDashboardPage() {
  return (
    <RoleGate allowedRoles={['volunteer', 'super_admin']}>
      <DashboardPage
        title="Volunteer Dashboard"
        description="Volunteer opportunities, applications, shifts, check-ins, hours, certificates, and event announcements."
        tiles={[
          { label: 'Applications', value: '2' },
          { label: 'Upcoming Shifts', value: '3' },
          { label: 'Hours Logged', value: '34' },
          { label: 'Certificates', value: '1' },
        ]}
      >
        <ModuleTable
          title="Volunteer Flow"
          columns={['Step', 'Permission', 'Realtime']}
          rows={[
            ['Apply', 'Submit own applications', 'Yes'],
            ['Assignments', 'View assigned event duties', 'Yes'],
            ['Attendance', 'Check in and check out', 'Yes'],
            ['Certificates', 'Download issued certificates', 'No'],
          ]}
        />
      </DashboardPage>
    </RoleGate>
  );
}
