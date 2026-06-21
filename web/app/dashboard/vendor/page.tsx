import { DashboardPage } from '@/components/DashboardPage';

export default function VendorDashboardPage() {
  return (
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
  );
}
