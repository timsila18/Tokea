import { RoleGate } from '@/components/RoleGate';
import { WorkforceWorkspace } from '@/components/WorkforceWorkspace';

export default function VolunteerDashboardPage() {
  return (
    <RoleGate allowedRoles={['volunteer', 'super_admin']}>
      <WorkforceWorkspace kind="volunteer" module="dashboard" />
    </RoleGate>
  );
}
