import 'package:flutter/material.dart';

class DiscoverScreen extends StatelessWidget {
  const DiscoverScreen({super.key});

  static const categories = [
    'Music',
    'Gospel',
    'Sports',
    'Business',
    'Technology',
    'Fashion',
    'Comedy',
    'Festivals',
    'Conferences',
    'Nightlife',
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Discover')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const TextField(
            decoration: InputDecoration(
              prefixIcon: Icon(Icons.search),
              labelText: 'Search events, artists, venues, organizers, categories',
            ),
          ),
          const SizedBox(height: 20),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              for (final category in categories) FilterChip(
                label: Text(category),
                selected: false,
                onSelected: (_) {},
              ),
            ],
          ),
          const SizedBox(height: 28),
          _Section(title: 'For You'),
          _Section(title: 'Trending Events'),
          _Section(title: 'Upcoming Events'),
          _Section(title: 'Popular Organizers'),
          _Section(title: 'Venue Spotlight'),
        ],
      ),
    );
  }
}

class _Section extends StatelessWidget {
  const _Section({required this.title});

  final String title;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 28),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 12),
          SizedBox(
            height: 148,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: 4,
              separatorBuilder: (_, __) => const SizedBox(width: 12),
              itemBuilder: (context, index) => Container(
                width: 220,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.surface,
                  borderRadius: BorderRadius.circular(18),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.auto_awesome, color: Colors.amber),
                    const Spacer(),
                    Text(title, style: const TextStyle(fontWeight: FontWeight.w800)),
                    const SizedBox(height: 4),
                    const Text('Recommendation engine ready'),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
