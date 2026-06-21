import 'package:flutter/material.dart';
import '../../core/theme/tokea_theme.dart';

class EventOperationsWorkspaceScreen extends StatelessWidget {
  const EventOperationsWorkspaceScreen({super.key});

  static const tabs = [
    'Overview',
    'Tickets',
    'Attendees',
    'Community',
    'Sponsors',
    'Vendors',
    'Food',
    'Transport',
    'Staff',
    'Tasks',
    'Analytics',
    'Finance',
    'Settings',
  ];

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: tabs.length,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Event Operations'),
          bottom: const TabBar(
            isScrollable: true,
            tabs: [for (final tab in tabs) Tab(text: tab)],
          ),
        ),
        body: TabBarView(
          children: [
            for (final tab in tabs) _OperationsTab(title: tab),
          ],
        ),
      ),
    );
  }
}

class _OperationsTab extends StatelessWidget {
  const _OperationsTab({required this.title});

  final String title;

  @override
  Widget build(BuildContext context) {
    final items = _itemsByTab[title] ?? const ['Realtime workspace ready'];
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(title, style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w900)),
        const SizedBox(height: 14),
        for (final item in items) Card(
          child: ListTile(
            leading: const Icon(Icons.auto_awesome, color: TokeaColors.gold),
            title: Text(item),
            subtitle: const Text('Connected to the event operating system foundation.'),
          ),
        ),
      ],
    );
  }
}

const _itemsByTab = {
  'Overview': ['Run sheet', 'Event health', 'Critical alerts', 'Pending approvals'],
  'Tickets': ['Sales timeline', 'Ticket breakdown', 'Live sales feed', 'Promo codes'],
  'Attendees': ['Attendee list', 'Check-in status', 'Exports', 'Support notes'],
  'Community': ['Announcements', 'Questions', 'Photos', 'Networking'],
  'Sponsors': ['Applications', 'Proposals', 'Contracts', 'Deliverables'],
  'Vendors': ['Quotations', 'Bookings', 'Messages', 'Performance'],
  'Food': ['Food vendors', 'Pre-orders', 'Inventory', 'Revenue'],
  'Transport': ['Shuttles', 'Routes', 'Bookings', 'Pickup points'],
  'Staff': ['Roster', 'Roles', 'Status', 'Incidents'],
  'Tasks': ['Checklist', 'Assignments', 'Priority', 'Completion'],
  'Analytics': ['Sales velocity', 'Revenue trends', 'Community growth', 'Top promoters'],
  'Finance': ['Budget', 'Expenses', 'Profit forecast', 'Payouts'],
  'Settings': ['Visibility', 'Refunds', 'Permissions', 'Documents'],
};
