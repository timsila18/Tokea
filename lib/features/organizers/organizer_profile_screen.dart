import 'package:flutter/material.dart';
import '../../core/theme/tokea_theme.dart';

class OrganizerProfileScreen extends StatelessWidget {
  const OrganizerProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: ListView(
        children: [
          Container(
            height: 190,
            alignment: Alignment.bottomLeft,
            padding: const EdgeInsets.all(20),
            color: Colors.black,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                const CircleAvatar(radius: 38, backgroundColor: TokeaColors.gold, child: Icon(Icons.apartment, color: Colors.black)),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: const [
                          Flexible(child: Text('Organizer Name', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900))),
                          SizedBox(width: 6),
                          Icon(Icons.verified, color: TokeaColors.gold, size: 20),
                        ],
                      ),
                      const Text('Followers • Upcoming Events • Reviews'),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const _ProfileSection(title: 'Description'),
          const _ProfileSection(title: 'Upcoming Events'),
          const _ProfileSection(title: 'Past Events'),
          const _ProfileSection(title: 'Videos'),
          const _ProfileSection(title: 'Photos'),
          const _ProfileSection(title: 'Reviews'),
        ],
      ),
    );
  }
}

class _ProfileSection extends StatelessWidget {
  const _ProfileSection({required this.title});

  final String title;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 12),
          Container(
            height: 94,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surface,
              borderRadius: BorderRadius.circular(18),
            ),
            child: const Text('Live data foundation'),
          ),
        ],
      ),
    );
  }
}
