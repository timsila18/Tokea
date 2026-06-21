import { DashboardPage } from '@/components/DashboardPage';
import { ModuleTable } from '@/components/ModuleTable';

export default function OrganizerDashboardPage() {
  return (
    <DashboardPage
      title="Organizer Dashboard"
      description="Command center for tickets, operations, Solco workspace, workforce, Foodo, Triplink, sponsors, vendors, finance, analytics, and approvals."
      tiles={[
        { label: 'Revenue', value: 'KES 642K' },
        { label: 'Tasks Open', value: '12' },
        { label: 'Staff Ready', value: '18' },
        { label: 'Vendor Requests', value: '5' },
      ]}
    >
      <ModuleTable
        title="Organizer Modules"
        columns={['Module', 'Table', 'Security']}
        rows={[
          ['Ticketing', 'organizer_ticket_dashboard', 'RLS view'],
          ['Tasks', 'event_tasks', 'Event manager only'],
          ['Workspace', 'workspace_messages', 'Event team only'],
          ['Finance', 'event_finances', 'Event manager only'],
          ['Withdrawals', 'payout_requests', '/dashboard/organizer/withdrawals'],
        ]}
      />
    </DashboardPage>
  );
}
