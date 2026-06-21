import { DashboardPage } from '@/components/DashboardPage';
import { RoleGate } from '@/components/RoleGate';

export default function VendorDashboardPage() {
  return (
    <RoleGate allowedRoles={['vendor', 'super_admin']}>
      <DashboardPage
        title="Vendor Dashboard"
        description="Vendor quotations, bookings, performance, finance, food applications, and event logistics."
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
