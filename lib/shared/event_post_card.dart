import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../core/theme/tokea_theme.dart';

class EventPostCard extends StatelessWidget {
  const EventPostCard({required this.event, super.key});

  final Map<String, dynamic> event;

  @override
  Widget build(BuildContext context) {
    final title = event['title']?.toString() ?? 'Untitled Event';
    final location = event['location_name']?.toString() ?? 'Kenya';
    final caption = event['caption']?.toString() ?? event['description']?.toString() ?? '';
    final dateValue = event['starts_at']?.toString();
    final date = dateValue == null || dateValue.isEmpty ? 'Coming soon' : dateValue.split('T').first;
    final price = event['ticket_starting_price_cents'];
    final priceText = price is int && price > 0 ? 'From KES ${(price / 100).round()}' : 'Ticket info soon';
    final organizer = event['organizer_name']?.toString() ?? 'Tokea Organizer';
    final eventId = event['id']?.toString() ?? title.toLowerCase().replaceAll(RegExp(r'[^a-z0-9]+'), '-');

    return InkWell(
      borderRadius: BorderRadius.circular(22),
      onTap: () => context.go('/events/$eventId', extra: event),
      child: Container(
        decoration: BoxDecoration(
          color: TokeaColors.surface,
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: Colors.white.withOpacity(0.08)),
        ),
        child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ListTile(
            leading: CircleAvatar(
              backgroundColor: TokeaColors.gold.withOpacity(0.16),
              child: const Icon(Icons.verified_outlined, color: TokeaColors.gold),
            ),
            title: Text(organizer, style: const TextStyle(fontWeight: FontWeight.w900)),
            subtitle: Text('$location • $date'),
            trailing: IconButton(
              onPressed: () {},
              icon: const Icon(Icons.more_horiz),
            ),
          ),
          AspectRatio(
            aspectRatio: 0.92,
            child: PageView(
              children: const [
                _MediaFrame(icon: Icons.image_outlined, label: 'Event Poster'),
                _MediaFrame(icon: Icons.collections_outlined, label: 'Gallery'),
                _MediaFrame(icon: Icons.play_circle_outline, label: 'Promo Video'),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w900)),
                const SizedBox(height: 8),
                Text(caption),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    Chip(label: Text(priceText)),
                    const Chip(label: Text('128 interested')),
                    const Chip(label: Text('46 going')),
                  ],
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(8, 0, 8, 12),
            child: Wrap(
              spacing: 4,
              runSpacing: 4,
              children: [
                _Action(icon: Icons.favorite_border, label: 'Like', onPressed: () => _show(context, 'Liked $title')),
                _Action(icon: Icons.mode_comment_outlined, label: 'Comment', onPressed: () => context.go('/events/$eventId', extra: event)),
                _Action(icon: Icons.ios_share, label: 'Share', onPressed: () => _show(context, 'Share link copied')),
                _Action(icon: Icons.star_border, label: 'Interested', onPressed: () => _show(context, 'Marked interested')),
                _Action(icon: Icons.check_circle_outline, label: 'Going', onPressed: () => _show(context, 'Marked going')),
                _Action(icon: Icons.confirmation_number_outlined, label: 'Buy Ticket', onPressed: () => context.go('/app', extra: {'tab': 4})),
              ],
            ),
          ),
        ],
        ),
      ),
    );
  }

  void _show(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
  }
}

class _MediaFrame extends StatelessWidget {
  const _MediaFrame({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      alignment: Alignment.center,
      color: Colors.black,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 62, color: TokeaColors.gold),
          const SizedBox(height: 10),
          Text(label),
        ],
      ),
    );
  }
}

class _Action extends StatelessWidget {
  const _Action({required this.icon, required this.label, required this.onPressed});

  final IconData icon;
  final String label;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return TextButton.icon(
      onPressed: onPressed,
      icon: Icon(icon, size: 18),
      label: Text(label),
    );
  }
}
