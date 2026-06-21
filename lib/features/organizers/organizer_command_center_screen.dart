import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../core/theme/tokea_theme.dart';

class OrganizerCommandCenterScreen extends StatelessWidget {
  const OrganizerCommandCenterScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final commandCenter = Supabase.instance.client
        .from('organizer_command_center')
        .select()
        .limit(1)
        .then((rows) => rows.cast<Map<String, dynamic>>());

    return Scaffold(
      appBar: AppBar(
        title: const Text('Command Center'),
        actions: [
          IconButton(
            onPressed: () => context.go('/organizer/ai'),
            icon: const Icon(Icons.auto_awesome),
          ),
        ],
      ),
      body: FutureBuilder<List<Map<String, dynamic>>>(
        future: commandCenter,
        builder: (context, snapshot) {
          final row = (snapshot.data?.isNotEmpty ?? false) ? snapshot.data!.first : _demoCommandCenter;
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Text('Run your event company', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w900)),
              const SizedBox(height: 14),
              Wrap(
                spacing: 10,
                runSpacing: 10,
                children: [
                  _Metric(label: "Today's Events", value: row['todays_events'].toString(), icon: Icons.today),
                  _Metric(label: 'Upcoming Events', value: row['upcoming_events'].toString(), icon: Icons.event),
                  _Metric(label: 'Ticket Revenue', value: 'KES ${row['ticket_revenue_kes']}', icon: Icons.payments_outlined),
                  _Metric(label: 'Check-In Status', value: '${row['checkin_rate']}%', icon: Icons.qr_code_scanner),
                  _Metric(label: 'Attendee Growth', value: '+${row['attendee_growth']}%', icon: Icons.trending_up),
                  _Metric(label: 'Community Activity', value: row['community_activity'].toString(), icon: Icons.forum_outlined),
                ],
              ),
              const SizedBox(height: 18),
              _ActionGrid(
                actions: [
                  _CommandAction('Operations', Icons.dashboard_customize_outlined, () => context.go('/organizer/event-ops')),
                  _CommandAction('Command', Icons.monitor_heart_outlined, () => context.go('/operations/command')),
                  _CommandAction('Tickets', Icons.confirmation_number_outlined, () => context.go('/organizer/ticket-dashboard')),
                  _CommandAction('Sponsors', Icons.handshake_outlined, () => context.go('/organizer/sponsors')),
                  _CommandAction('Vendors', Icons.storefront_outlined, () => context.go('/organizer/vendors')),
                  _CommandAction('Finance', Icons.account_balance_wallet_outlined, () => context.go('/organizer/finance')),
                  _CommandAction('Analytics', Icons.insights_outlined, () => context.go('/organizer/analytics')),
                  _CommandAction('Teams', Icons.groups_outlined, () => context.go('/organizer/teams')),
                  _CommandAction('Documents', Icons.folder_outlined, () => context.go('/organizer/documents')),
                ],
              ),
              const SizedBox(height: 18),
              _TaskStrip(title: 'Pending Tasks', value: row['pending_tasks'].toString()),
              _TaskStrip(title: 'Pending Sponsorship Requests', value: row['pending_sponsorship_requests'].toString()),
              _TaskStrip(title: 'Vendor Requests', value: row['vendor_requests'].toString()),
              _TaskStrip(title: 'Staff Status', value: row['staff_status'].toString()),
              _TaskStrip(title: 'Food Orders', value: row['food_orders'].toString()),
              _TaskStrip(title: 'Transport Bookings', value: row['transport_bookings'].toString()),
            ],
          );
        },
      ),
    );
  }
}

class _Metric extends StatelessWidget {
  const _Metric({required this.label, required this.value, required this.icon});

  final String label;
  final String value;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 166,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: TokeaColors.surface,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: Colors.white.withOpacity(0.08)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: TokeaColors.gold),
            const SizedBox(height: 14),
            Text(value, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900)),
            const SizedBox(height: 4),
            Text(label),
          ],
        ),
      ),
    );
  }
}

class _ActionGrid extends StatelessWidget {
  const _ActionGrid({required this.actions});

  final List<_CommandAction> actions;

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: actions.length,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 2.55,
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
      ),
      itemBuilder: (context, index) {
        final action = actions[index];
        return OutlinedButton.icon(
          onPressed: action.onTap,
          icon: Icon(action.icon),
          label: Text(action.label),
        );
      },
    );
  }
}

class _CommandAction {
  const _CommandAction(this.label, this.icon, this.onTap);

  final String label;
  final IconData icon;
  final VoidCallback onTap;
}

class _TaskStrip extends StatelessWidget {
  const _TaskStrip({required this.title, required this.value});

  final String title;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        title: Text(title),
        trailing: Chip(label: Text(value)),
      ),
    );
  }
}

const Map<String, dynamic> _demoCommandCenter = {
  'organizer_id': 'demo',
  'todays_events': 1,
  'upcoming_events': 7,
  'ticket_revenue_kes': '642,000',
  'checkin_rate': 0,
  'attendee_growth': 18,
  'community_activity': 314,
  'pending_tasks': 12,
  'pending_sponsorship_requests': 3,
  'vendor_requests': 5,
  'staff_status': '18 ready',
  'food_orders': 9,
  'transport_bookings': 4,
};
