import { DashboardPage } from '@/components/DashboardPage';
import { ModuleTable } from '@/components/ModuleTable';
import { RoleGate } from '@/components/RoleGate';

export default function SponsorDashboardPage() {
  return (
    <RoleGate allowedRoles={['sponsor', 'super_admin']}>
      <DashboardPage
        title="Sponsor Dashboard"
        description="Sponsor profile, event matching, applications, proposals, contracts, deliverables, and payments."
        tiles={[
          { label: 'Matches', value: '24' },
          { label: 'Applications', value: '6' },
          { label: 'Contracts', value: '3' },
          { label: 'Deliverables', value: '12' },
        ]}
      >
        <ModuleTable
          title="Sponsor Workspace"
          columns={['Module', 'Permission', 'Status']}
          rows={[
            ['Opportunity Matchmaking', 'View public sponsor packages', 'Ready'],
            ['Applications', 'Create and track own applications', 'Ready'],
            ['Deliverables', 'View assigned campaign tasks', 'Ready'],
            ['Reporting', 'Read campaign analytics', 'Ready'],
          ]}
        />
      </DashboardPage>
    </RoleGate>
  );
}
