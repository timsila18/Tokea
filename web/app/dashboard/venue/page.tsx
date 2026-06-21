import { DashboardPage } from '@/components/DashboardPage';
import { ModuleTable } from '@/components/ModuleTable';
import { RoleGate } from '@/components/RoleGate';

export default function VenueDashboardPage() {
  return (
    <RoleGate allowedRoles={['venue_owner', 'super_admin']}>
      <DashboardPage
        title="Venue Owner Dashboard"
        description="Venue profile, availability calendar, booking requests, event pipeline, map details, ratings, and reviews."
        tiles={[
          { label: 'Venues', value: '2' },
          { label: 'Booking Requests', value: '8' },
          { label: 'Upcoming Events', value: '11' },
          { label: 'Rating', value: '4.6' },
        ]}
      >
        <ModuleTable
          title="Venue Workspace"
          columns={['Module', 'Permission', 'Realtime']}
          rows={[
            ['Venue Profile', 'Manage own venue pages', 'No'],
            ['Calendar', 'Manage availability', 'Yes'],
            ['Bookings', 'Approve own booking requests', 'Yes'],
            ['Reviews', 'Reply to own venue reviews', 'Yes'],
          ]}
        />
      </DashboardPage>
    </RoleGate>
  );
}
