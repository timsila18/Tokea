import { DashboardPage } from '@/components/DashboardPage';
import { ModuleTable } from '@/components/ModuleTable';
import { RoleGate } from '@/components/RoleGate';

export default function TransportDashboardPage() {
  return (
    <RoleGate allowedRoles={['transport_provider', 'super_admin']}>
      <DashboardPage
        title="Transport Dashboard"
        description="Triplink operator workspace for routes, vehicles, seat inventory, passenger manifests, boarding, and settlements."
        tiles={[
          { label: 'Routes', value: '7' },
          { label: 'Vehicles', value: '12' },
          { label: 'Passengers', value: '342' },
          { label: 'Revenue', value: 'KES 188K' },
        ]}
      >
        <ModuleTable
          title="Triplink Modules"
          columns={['Module', 'Permission', 'Realtime']}
          rows={[
            ['Routes', 'Manage own routes', 'Yes'],
            ['Vehicles', 'Manage own fleet', 'No'],
            ['Passengers', 'Assigned manifests only', 'Yes'],
            ['Boarding', 'Scan and confirm boarding', 'Yes'],
          ]}
        />
      </DashboardPage>
    </RoleGate>
  );
}
