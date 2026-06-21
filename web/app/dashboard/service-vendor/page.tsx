import { DashboardPage } from '@/components/DashboardPage';
import { ModuleTable } from '@/components/ModuleTable';
import { RoleGate } from '@/components/RoleGate';

export default function ServiceVendorDashboardPage() {
  return (
    <RoleGate allowedRoles={['service_vendor', 'super_admin']}>
      <DashboardPage
        title="Service Vendor Dashboard"
        description="Marketplace profile, event service listings, quote requests, bookings, reviews, documents, and payouts."
        tiles={[
          { label: 'Quote Requests', value: '14' },
          { label: 'Bookings', value: '6' },
          { label: 'Rating', value: '4.7' },
          { label: 'Payouts', value: '1 pending' },
        ]}
      >
        <ModuleTable
          title="Service Vendor Modules"
          columns={['Module', 'Permission', 'Table']}
          rows={[
            ['Services', 'Manage own listings', 'vendor_services'],
            ['Quotes', 'Respond to own requests', 'vendor_quotes'],
            ['Bookings', 'View own bookings', 'vendor_bookings'],
            ['Reviews', 'Reply to own reviews', 'vendor_reviews'],
          ]}
        />
      </DashboardPage>
    </RoleGate>
  );
}
