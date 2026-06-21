import { ShieldAlert } from 'lucide-react';
import { AdminMetrics } from '@/components/AdminMetrics';
import { ModuleTable } from '@/components/ModuleTable';

export default function AdminPage() {
  return (
    <>
      <div className="topbar">
        <div>
          <h1 style={{ fontSize: 42 }}>Admin Command Center</h1>
          <p>Enterprise control plane for users, events, organizers, sponsors, vendors, food, transport, staff, payments, payouts, tickets, incidents, settings, and audit trails.</p>
        </div>
        <span className="status warn"><ShieldAlert size={14} /> Manual Review</span>
      </div>
      <AdminMetrics />
      <ModuleTable
        title="Moderation & Risk Queues"
        columns={['Queue', 'Action', 'Table']}
        rows={[
          ['Payout Approvals', 'Review / Freeze / Approve', 'payout_requests'],
          ['Organizer Verification', 'Approve / Reject', 'organizer_verification'],
          ['Suspicious Activity', 'Investigate', 'security_events'],
          ['Content Reports', 'Moderate', 'content_reports'],
          ['Ticket Fraud', 'Review duplicate signals', 'ticket_checkins'],
          ['Platform Settings', 'Audit changes', 'platform_settings'],
        ]}
      />
    </>
  );
}
