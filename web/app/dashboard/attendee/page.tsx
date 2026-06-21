import { DashboardPage } from '@/components/DashboardPage';
import { ModuleTable } from '@/components/ModuleTable';

export default function AttendeeDashboardPage() {
  return (
    <DashboardPage
      title="Attendee Dashboard"
      description="Ticket wallet, Foodo orders, Triplink passes, merchandise, rewards, referrals, announcements, and event-day maps."
      tiles={[
        { label: 'Tickets', value: '2' },
        { label: 'Food Orders', value: '3' },
        { label: 'Transport Passes', value: '1' },
        { label: 'Rewards', value: '1,240' },
      ]}
    >
      <ModuleTable
        title="Unified Purchase Path"
        columns={['Step', 'Table', 'Realtime']}
        rows={[
          ['Ticket', 'ticket_orders', 'Yes'],
          ['Food', 'food_orders', 'Yes'],
          ['Transport', 'transport_bookings', 'Yes'],
          ['Merchandise', 'merchandise_orders', 'Yes'],
        ]}
      />
    </DashboardPage>
  );
}
