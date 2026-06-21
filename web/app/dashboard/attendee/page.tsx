import { DashboardPage } from '@/components/DashboardPage';
import { ModuleTable } from '@/components/ModuleTable';
import { RoleGate } from '@/components/RoleGate';

export default function AttendeeDashboardPage() {
  return (
    <RoleGate allowedRoles={['attendee', 'super_admin']}>
      <DashboardPage
        title="Attendee Dashboard"
        description="Personal feed, ticket wallet, saved events, communities, event-day maps, rewards, and notifications."
        tiles={[
          { label: 'Tickets', value: '2' },
          { label: 'Saved Events', value: '9' },
          { label: 'Communities', value: '4' },
          { label: 'Rewards', value: '1,240' },
        ]}
      >
        <ModuleTable
          title="Attendee Experience"
          columns={['Area', 'Access', 'Realtime']}
          rows={[
            ['Tickets', 'Own ticket_orders only', 'Yes'],
            ['Communities', 'Joined event channels', 'Yes'],
            ['Saved Events', 'Own saved_events only', 'Yes'],
            ['Notifications', 'Own notifications only', 'Yes'],
          ]}
        />
      </DashboardPage>
    </RoleGate>
  );
}
