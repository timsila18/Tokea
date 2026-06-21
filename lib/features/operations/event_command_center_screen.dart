import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/tokea_theme.dart';

class EventCommandCenterScreen extends StatelessWidget {
  const EventCommandCenterScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Event Command Center'),
        actions: [
          IconButton(
            onPressed: () => context.go('/operations/emergency'),
            icon: const Icon(Icons.emergency_share_outlined),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text('Operations Room', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w900)),
          const SizedBox(height: 14),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: const [
              _StatusTile(label: 'Event Status', value: 'Live Ready', icon: Icons.radio_button_checked),
              _StatusTile(label: 'Ticket Sales', value: '214 sold', icon: Icons.confirmation_number_outlined),
              _StatusTile(label: 'Live Attendance', value: '0 checked in', icon: Icons.qr_code_scanner),
              _StatusTile(label: 'Staff Status', value: '18 ready', icon: Icons.badge_outlined),
              _StatusTile(label: 'Volunteer Status', value: '42 assigned', icon: Icons.volunteer_activism_outlined),
              _StatusTile(label: 'Vendor Status', value: '5 confirmed', icon: Icons.storefront_outlined),
              _StatusTile(label: 'Sponsor Status', value: '3 active', icon: Icons.handshake_outlined),
              _StatusTile(label: 'Food Status', value: '9 orders', icon: Icons.restaurant_outlined),
              _StatusTile(label: 'Transport Status', value: '4 routes', icon: Icons.directions_bus_outlined),
              _StatusTile(label: 'Incident Reports', value: '0 critical', icon: Icons.report_outlined),
              _StatusTile(label: 'Task Completion', value: '68%', icon: Icons.task_alt),
              _StatusTile(label: 'Weather', value: 'Placeholder', icon: Icons.cloud_outlined),
            ],
          ),
          const SizedBox(height: 18),
          Card(
            color: TokeaColors.gold.withOpacity(0.08),
            child: const ListTile(
              leading: Icon(Icons.notifications_active_outlined, color: TokeaColors.gold),
              title: Text('Emergency Alerts'),
              subtitle: Text('Broadcast to management, security, medical, and operations teams.'),
            ),
          ),
          const SizedBox(height: 10),
          OutlinedButton.icon(
            onPressed: () => context.go('/operations/workspace'),
            icon: const Icon(Icons.forum_outlined),
            label: const Text('Open Solco Workspace'),
          ),
          OutlinedButton.icon(
            onPressed: () => context.go('/operations/workforce'),
            icon: const Icon(Icons.groups_outlined),
            label: const Text('Open Workforce Module'),
          ),
          OutlinedButton.icon(
            onPressed: () => context.go('/operations/incidents'),
            icon: const Icon(Icons.warning_amber_outlined),
            label: const Text('Incident Center'),
          ),
        ],
      ),
    );
  }
}

class _StatusTile extends StatelessWidget {
  const _StatusTile({required this.label, required this.value, required this.icon});

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
            Text(value, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
            const SizedBox(height: 4),
            Text(label),
          ],
        ),
      ),
    );
  }
}
