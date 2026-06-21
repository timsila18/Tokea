import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final userId = Supabase.instance.client.auth.currentUser?.id;
    final stream = userId == null
        ? const Stream<List<Map<String, dynamic>>>.empty()
        : Supabase.instance.client
            .from('notifications')
            .stream(primaryKey: ['id'])
            .eq('profile_id', userId)
            .order('created_at');

    return Scaffold(
      appBar: AppBar(title: const Text('Notifications')),
      body: StreamBuilder<List<Map<String, dynamic>>>(
        stream: stream,
        builder: (context, snapshot) {
          final notifications = snapshot.data ?? const [];
          if (notifications.isEmpty) {
            return const Center(child: Text('Event updates will appear here.'));
          }
          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: notifications.length,
            separatorBuilder: (_, __) => const SizedBox(height: 10),
            itemBuilder: (context, index) {
              final notification = notifications[index];
              return Card(
                child: ListTile(
                  leading: const Icon(Icons.notifications_active_outlined),
                  title: Text(notification['title']?.toString() ?? 'Tokea update'),
                  subtitle: Text(notification['body']?.toString() ?? ''),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
