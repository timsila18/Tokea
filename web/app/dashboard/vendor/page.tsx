import { DashboardPage } from '@/components/DashboardPage';
import { RoleGate } from '@/components/RoleGate';

export default function VendorDashboardPage() {
  return (
    <RoleGate allowedRoles={['service_vendor', 'super_admin']}>
      <DashboardPage
        title="Service Vendor Dashboard"
        description="Vendor quotations, bookings, performance, finance, event services, documents, and reviews."
        tiles={[
          { label: 'Bookings', value: '8' },
          { label: 'Rating', value: '4.8' },
          { label: 'Revenue', value: 'KES 96K' },
          { label: 'Payouts', value: '2 pending' },
        ]}
      />
    </RoleGate>
  );
}
