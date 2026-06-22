import { AttendeeWorkspace } from '@/components/AttendeeWorkspace';
import { RoleGate } from '@/components/RoleGate';

type Props = { params: Promise<{ module: string }> };

export default async function AttendeeModulePage({ params }: Props) {
  const { module } = await params;
  return <RoleGate allowedRoles={['attendee', 'super_admin']}><AttendeeWorkspace module={module} /></RoleGate>;
}
