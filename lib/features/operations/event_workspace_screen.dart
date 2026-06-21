import 'package:flutter/material.dart';
import '../../core/theme/tokea_theme.dart';

class EventWorkspaceScreen extends StatelessWidget {
  const EventWorkspaceScreen({super.key});

  static const channels = [
    'General',
    'Announcements',
    'Operations',
    'Ticketing',
    'Security',
    'VIP',
    'Sponsors',
    'Vendors',
    'Food Vendors',
    'Transport',
    'Media',
    'Emergency',
    'Lost & Found',
    'Support',
    'Staff',
    'Volunteers',
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Solco Workspace')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text('Event Communication Hub', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w900)),
          const SizedBox(height: 8),
          const Text('Workspace chat, file sharing, meetings, notes, pinned messages, reactions, typing indicators, and read receipts.'),
          const SizedBox(height: 18),
          for (final channel in channels) Card(
            child: ListTile(
              leading: const Icon(Icons.tag, color: TokeaColors.gold),
              title: Text(channel),
              subtitle: const Text('Realtime workspace channel'),
              trailing: const Icon(Icons.chevron_right),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: null,
        icon: const Icon(Icons.video_call_outlined),
        label: const Text('Start Meeting'),
      ),
    );
  }
}
