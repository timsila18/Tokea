import { OrganizerWorkspace } from '@/components/OrganizerWorkspace';
import { RoleGate } from '@/components/RoleGate';

type Props = { params: Promise<{ module: string }> };

export default async function OrganizerModulePage({ params }: Props) {
  const { module } = await params;
  return <RoleGate allowedRoles={['organizer', 'super_admin']}><OrganizerWorkspace module={module} /></RoleGate>;
}
