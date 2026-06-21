import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/tokea_theme.dart';

class EventDetailScreen extends StatelessWidget {
  const EventDetailScreen({required this.event, super.key});

  final Map<String, dynamic> event;

  @override
  Widget build(BuildContext context) {
    final title = event['title']?.toString() ?? 'Tokea Event';
    final organizer = event['organizer_name']?.toString() ?? 'Tokea Organizer';
    final location = event['location_name']?.toString() ?? 'Kenya';
    final caption = event['caption']?.toString() ?? event['description']?.toString() ?? 'Premium event experience on Tokea.';
    final dateValue = event['starts_at']?.toString();
    final date = dateValue == null || dateValue.isEmpty ? 'Coming soon' : dateValue.split('T').first;
    final price = event['ticket_starting_price_cents'];
    final priceText = price is int && price > 0 ? 'From KES ${(price / 100).round()}' : 'Ticket info soon';

    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          Container(
            height: 280,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: Colors.black,
              borderRadius: BorderRadius.circular(26),
              border: Border.all(color: TokeaColors.gold.withOpacity(0.24)),
            ),
            child: const Icon(Icons.event, color: TokeaColors.gold, size: 82),
          ),
          const SizedBox(height: 18),
          Text(title, style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w900)),
          const SizedBox(height: 8),
          Text(organizer, style: const TextStyle(color: TokeaColors.gold, fontWeight: FontWeight.w800)),
          const SizedBox(height: 14),
          Text(caption),
          const SizedBox(height: 16),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              Chip(label: Text(priceText)),
              Chip(label: Text(location)),
              Chip(label: Text(date)),
            ],
          ),
          const SizedBox(height: 18),
          ElevatedButton.icon(
            onPressed: () => context.go('/app', extra: {'tab': 4}),
            icon: const Icon(Icons.confirmation_number_outlined),
            label: const Text('Buy Ticket'),
          ),
          const SizedBox(height: 10),
          OutlinedButton.icon(
            onPressed: () => context.go('/experience'),
            icon: const Icon(Icons.local_activity_outlined),
            label: const Text('Food, transport and event experience'),
          ),
        ],
      ),
    );
  }
}
