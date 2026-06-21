import { DashboardPage } from '@/components/DashboardPage';
import { ModuleTable } from '@/components/ModuleTable';
import { RoleGate } from '@/components/RoleGate';

export default function OrganizerTeamDashboardPage() {
  return (
    <RoleGate allowedRoles={['organizer_team_member', 'super_admin']}>
      <DashboardPage
        title="Organizer Team Dashboard"
        description="Assigned event operations, ticketing tasks, team messages, approvals, and event-day execution."
        tiles={[
          { label: 'Assigned Events', value: '3' },
          { label: 'Tasks Due', value: '11' },
          { label: 'Approvals', value: '4' },
          { label: 'Messages', value: '18' },
        ]}
      >
        <ModuleTable
          title="Team Permissions"
          columns={['Area', 'Access', 'Table']}
          rows={[
            ['Events', 'Assigned events only', 'event_team_members'],
            ['Tasks', 'Assigned tasks only', 'event_tasks'],
            ['Workspace', 'Team channels only', 'workspace_messages'],
            ['Finance', 'Hidden unless granted', 'event_finances'],
          ]}
        />
      </DashboardPage>
    </RoleGate>
  );
}
