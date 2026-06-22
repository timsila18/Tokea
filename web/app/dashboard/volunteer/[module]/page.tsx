import { RoleGate } from '@/components/RoleGate';
import { WorkforceWorkspace } from '@/components/WorkforceWorkspace';

type Props = { params: Promise<{ module: string }> };

export default async function VolunteerModulePage({ params }: Props) {
  const { module } = await params;
  return (
    <RoleGate allowedRoles={['volunteer', 'super_admin']}>
      <WorkforceWorkspace kind="volunteer" module={module} />
    </RoleGate>
  );
}
