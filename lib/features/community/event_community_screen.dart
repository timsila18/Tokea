import 'package:flutter/material.dart';

class EventCommunityScreen extends StatelessWidget {
  const EventCommunityScreen({super.key});

  static const channels = [
    'General',
    'Announcements',
    'Questions',
    'Photos',
    'Networking',
    'Transport',
    'Food',
    'Support',
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Event Community')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text('Community Rules', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 10),
          const Text('Keep it useful, respectful, event-focused, and safe for attendees.'),
          const SizedBox(height: 22),
          for (final channel in channels) Card(
            child: ListTile(
              leading: const Icon(Icons.tag),
              title: Text(channel),
              subtitle: const Text('Realtime discussion, questions, photos, and planning.'),
              trailing: const Icon(Icons.chevron_right),
            ),
          ),
        ],
      ),
    );
  }
}
