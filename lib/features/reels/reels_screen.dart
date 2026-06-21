import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../core/theme/tokea_theme.dart';

class ReelsScreen extends StatelessWidget {
  const ReelsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final stream = Supabase.instance.client
        .from('reels')
        .stream(primaryKey: ['id'])
        .order('created_at');

    return Scaffold(
      body: StreamBuilder<List<Map<String, dynamic>>>(
        stream: stream,
        builder: (context, snapshot) {
          final reels = snapshot.data ?? _demoReels;
          return PageView.builder(
            scrollDirection: Axis.vertical,
            itemCount: reels.length,
            itemBuilder: (context, index) => _ReelPage(reel: reels[index]),
          );
        },
      ),
    );
  }
}

class _ReelPage extends StatelessWidget {
  const _ReelPage({required this.reel});

  final Map<String, dynamic> reel;

  @override
  Widget build(BuildContext context) {
    final title = reel['title']?.toString() ?? 'Event reel';
    final caption = reel['caption']?.toString() ?? 'The next night out starts here.';

    return Stack(
      fit: StackFit.expand,
      children: [
        Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [Colors.black, TokeaColors.surface, Colors.black],
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
            ),
          ),
          child: const Center(
            child: Icon(Icons.play_circle_fill, size: 82, color: TokeaColors.gold),
          ),
        ),
        Positioned(
          left: 20,
          right: 86,
          bottom: 36,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w900)),
              const SizedBox(height: 8),
              Text(caption, maxLines: 3, overflow: TextOverflow.ellipsis),
              const SizedBox(height: 14),
              OutlinedButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.person_add_alt_1),
                label: const Text('Follow Organizer'),
              ),
            ],
          ),
        ),
        Positioned(
          right: 14,
          bottom: 42,
          child: Column(
            children: const [
              _ReelAction(icon: Icons.favorite_border, label: 'Like'),
              _ReelAction(icon: Icons.mode_comment_outlined, label: 'Comment'),
              _ReelAction(icon: Icons.ios_share, label: 'Share'),
              _ReelAction(icon: Icons.bookmark_border, label: 'Save'),
            ],
          ),
        ),
      ],
    );
  }
}

class _ReelAction extends StatelessWidget {
  const _ReelAction({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 16),
      child: Column(
        children: [
          IconButton.filledTonal(onPressed: () {}, icon: Icon(icon)),
          Text(label, style: Theme.of(context).textTheme.labelSmall),
        ],
      ),
    );
  }
}

const List<Map<String, dynamic>> _demoReels = [
  {
    'title': 'Blankets & Wine Weekend',
    'caption': 'Festival trailers, venue previews, and the moments people share before they buy.',
  },
  {
    'title': 'Nairobi Nightlife Drop',
    'caption': 'Organizer announcements and promo videos flow vertically, fast and addictive.',
  },
];
