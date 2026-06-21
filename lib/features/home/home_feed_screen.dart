import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../shared/event_post_card.dart';

class HomeFeedScreen extends StatelessWidget {
  const HomeFeedScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final stream = Supabase.instance.client
        .from('events')
        .stream(primaryKey: ['id'])
        .order('created_at');

    return Scaffold(
      appBar: AppBar(
        title: const Text('Tokea'),
        actions: [
          IconButton(
            onPressed: () => context.go('/notifications'),
            icon: const Icon(Icons.notifications_outlined),
          ),
        ],
      ),
      body: StreamBuilder<List<Map<String, dynamic>>>(
        stream: stream,
        builder: (context, snapshot) {
          final events = (snapshot.data?.isNotEmpty ?? false) ? snapshot.data! : _demoEvents;
          if (events.isEmpty) {
            return const Center(child: Text('Fresh events will appear here.'));
          }
          return ListView.separated(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
            itemCount: events.length,
            separatorBuilder: (_, __) => const SizedBox(height: 16),
            itemBuilder: (context, index) => EventPostCard(event: events[index]),
          );
        },
      ),
    );
  }
}

const List<Map<String, dynamic>> _demoEvents = [
  {
    'title': 'Nairobi Gold Weekend',
    'organizer_name': 'Tokea Curated',
    'caption': 'A premium social feed where events feel alive before tickets go on sale.',
    'location_name': 'Westlands, Nairobi',
    'starts_at': '2026-07-18T18:00:00Z',
    'ticket_starting_price_cents': 250000,
  },
  {
    'title': 'Gospel Sundown Live',
    'organizer_name': 'KeLive Events',
    'caption': 'Follow organizers, discover reels, join communities, and decide who you are going with.',
    'location_name': 'KICC',
    'starts_at': '2026-08-02T15:00:00Z',
    'ticket_starting_price_cents': 150000,
  },
];
