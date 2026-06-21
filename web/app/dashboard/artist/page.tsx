import { DashboardPage } from '@/components/DashboardPage';
import { ModuleTable } from '@/components/ModuleTable';
import { RoleGate } from '@/components/RoleGate';

export default function ArtistDashboardPage() {
  return (
    <RoleGate allowedRoles={['artist_speaker', 'super_admin']}>
      <DashboardPage
        title="Artist & Speaker Dashboard"
        description="Professional profile, bookings, event appearances, media kit, followers, reviews, and performance calendar."
        tiles={[
          { label: 'Booking Leads', value: '9' },
          { label: 'Upcoming Events', value: '4' },
          { label: 'Followers', value: '12.8K' },
          { label: 'Media Assets', value: '23' },
        ]}
      >
        <ModuleTable
          title="Artist / Speaker Workspace"
          columns={['Module', 'Permission', 'Status']}
          rows={[
            ['Profile', 'Manage own public profile', 'Ready'],
            ['Bookings', 'Respond to own booking requests', 'Ready'],
            ['Media Kit', 'Upload photos and videos', 'Ready'],
            ['Reviews', 'Reply to post-event reviews', 'Ready'],
          ]}
        />
      </DashboardPage>
    </RoleGate>
  );
}
