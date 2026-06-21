import { DashboardPage } from '@/components/DashboardPage';
import { ModuleTable } from '@/components/ModuleTable';
import { RoleGate } from '@/components/RoleGate';

export default function FoodVendorDashboardPage() {
  return (
    <RoleGate allowedRoles={['food_vendor', 'super_admin']}>
      <DashboardPage
        title="Food Vendor Dashboard"
        description="Food vendor profile, event applications, menus, stall approvals, orders, redemption, settlement, and reviews."
        tiles={[
          { label: 'Applications', value: '5' },
          { label: 'Approved Events', value: '2' },
          { label: 'Orders', value: '146' },
          { label: 'Settlement', value: 'KES 78K' },
        ]}
      >
        <ModuleTable
          title="Foodo Vendor Modules"
          columns={['Module', 'Permission', 'Table']}
          rows={[
            ['Menus', 'Manage own menu items', 'food_menus'],
            ['Orders', 'View own food orders', 'food_orders'],
            ['Redemption', 'Confirm pickup codes', 'food_redemptions'],
            ['Payouts', 'Request settlement review', 'payout_requests'],
          ]}
        />
      </DashboardPage>
    </RoleGate>
  );
}
