import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../core/theme/tokea_theme.dart';

class TicketSalesDashboardScreen extends StatelessWidget {
  const TicketSalesDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final dashboard = Supabase.instance.client
        .from('organizer_ticket_dashboard')
        .select()
        .then((rows) => rows.cast<Map<String, dynamic>>());

    return Scaffold(
      appBar: AppBar(title: const Text('Ticket Sales')),
      body: FutureBuilder<List<Map<String, dynamic>>>(
        future: dashboard,
        builder: (context, snapshot) {
          final rows = (snapshot.data?.isNotEmpty ?? false) ? snapshot.data! : _demoDashboard;
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              for (final row in rows) _DashboardCard(row: row),
              const SizedBox(height: 14),
              const _RevenuePanel(),
              const SizedBox(height: 14),
              const _PromoterPanel(),
            ],
          );
        },
      ),
    );
  }
}

class _DashboardCard extends StatelessWidget {
  const _DashboardCard({required this.row});

  final Map<String, dynamic> row;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: TokeaColors.surface,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(row['title']?.toString() ?? 'Event', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w900)),
          const SizedBox(height: 14),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              _Metric(label: 'Available', value: row['tickets_available']?.toString() ?? '0'),
              _Metric(label: 'Sold', value: row['tickets_sold']?.toString() ?? '0'),
              _Metric(label: 'Revenue', value: 'KES ${((row['gross_revenue_cents'] ?? 0) / 100).round()}'),
              _Metric(label: 'Pending', value: 'KES ${((row['pending_payments_cents'] ?? 0) / 100).round()}'),
              _Metric(label: 'Checked In', value: row['checked_in_attendees']?.toString() ?? '0'),
              _Metric(label: 'Attendance', value: '${row['attendance_percentage'] ?? 0}%'),
            ],
          ),
        ],
      ),
    );
  }
}

class _Metric extends StatelessWidget {
  const _Metric({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 150,
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(value, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18)),
              const SizedBox(height: 4),
              Text(label),
            ],
          ),
        ),
      ),
    );
  }
}

class _RevenuePanel extends StatelessWidget {
  const _RevenuePanel();

  @override
  Widget build(BuildContext context) {
    return const Card(
      child: ListTile(
        leading: Icon(Icons.account_balance_wallet_outlined),
        title: Text('Revenue & Payouts'),
        subtitle: Text('Gross, net, platform fees, refunds, pending payouts, completed payouts.'),
      ),
    );
  }
}

class _PromoterPanel extends StatelessWidget {
  const _PromoterPanel();

  @override
  Widget build(BuildContext context) {
    return const Card(
      child: ListTile(
        leading: Icon(Icons.leaderboard_outlined),
        title: Text('Affiliate Promoters'),
        subtitle: Text('Promoter codes, sales, revenue, commission, conversion leaderboard.'),
      ),
    );
  }
}

const List<Map<String, dynamic>> _demoDashboard = [
  {
    'title': 'Nairobi Gold Weekend',
    'tickets_available': 800,
    'tickets_sold': 214,
    'gross_revenue_cents': 64200000,
    'pending_payments_cents': 1180000,
    'checked_in_attendees': 0,
    'attendance_percentage': 0,
  },
];
