import { DashboardPage } from '@/components/DashboardPage';

export default function SponsorDashboardPage() {
  return (
    <DashboardPage
      title="Sponsor Dashboard"
      description="Sponsor profile, event matching, applications, proposals, contracts, deliverables, and payments."
      tiles={[
        { label: 'Matches', value: '24' },
        { label: 'Applications', value: '6' },
        { label: 'Contracts', value: '3' },
        { label: 'Deliverables', value: '12' },
      ]}
    />
  );
}
