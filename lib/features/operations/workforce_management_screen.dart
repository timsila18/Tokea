import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class WorkforceManagementScreen extends StatelessWidget {
  const WorkforceManagementScreen({super.key});

  static const categories = [
    'Security',
    'Ushers',
    'Ticket Scanners',
    'Parking Staff',
    'Cleaners',
    'Media Team',
    'Photographers',
    'Videographers',
    'MC Team',
    'VIP Coordinators',
    'Customer Support',
    'Backstage Staff',
    'Operations Team',
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Event Workforce')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text('SolvaHR Workforce Engine', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w900)),
          const SizedBox(height: 14),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              OutlinedButton.icon(onPressed: () => context.go('/operations/volunteers'), icon: const Icon(Icons.volunteer_activism_outlined), label: const Text('Volunteers')),
              OutlinedButton.icon(onPressed: () => context.go('/operations/shifts'), icon: const Icon(Icons.schedule_outlined), label: const Text('Shifts')),
              OutlinedButton.icon(onPressed: () => context.go('/operations/org-chart'), icon: const Icon(Icons.account_tree_outlined), label: const Text('Org Chart')),
              OutlinedButton.icon(onPressed: () => context.go('/operations/approvals'), icon: const Icon(Icons.approval_outlined), label: const Text('Approvals')),
            ],
          ),
          const SizedBox(height: 18),
          for (final category in categories) Card(
            child: ListTile(
              leading: const Icon(Icons.badge_outlined),
              title: Text(category),
              subtitle: const Text('Profiles, skills, availability, assignments, ratings, and history.'),
            ),
          ),
        ],
      ),
    );
  }
}
