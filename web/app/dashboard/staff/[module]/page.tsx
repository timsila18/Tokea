import { RoleGate } from '@/components/RoleGate';
import { WorkforceWorkspace } from '@/components/WorkforceWorkspace';

type Props = { params: Promise<{ module: string }> };

export default async function StaffModulePage({ params }: Props) {
  const { module } = await params;
  return (
    <RoleGate allowedRoles={['event_staff', 'super_admin']}>
      <WorkforceWorkspace kind="staff" module={module} />
    </RoleGate>
  );
}
