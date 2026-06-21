import 'package:flutter/material.dart';

class ModerationScreen extends StatelessWidget {
  const ModerationScreen({super.key});

  static const queues = ['Comments', 'Posts', 'Communities', 'Reviews', 'Media', 'Reported Content'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Moderation')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          for (final queue in queues) Card(
            child: ListTile(
              leading: const Icon(Icons.shield_outlined),
              title: Text(queue),
              subtitle: const Text('Admin review queue foundation'),
              trailing: const Icon(Icons.chevron_right),
            ),
          ),
        ],
      ),
    );
  }
}
