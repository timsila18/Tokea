import 'package:flutter/material.dart';

class VenueProfileScreen extends StatelessWidget {
  const VenueProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Venue')),
      body: ListView(
        padding: const EdgeInsets.all(18),
        children: const [
          _VenueTile(title: 'Venue Images', icon: Icons.photo_library_outlined),
          _VenueTile(title: 'Capacity', icon: Icons.groups_outlined),
          _VenueTile(title: 'Location & Map', icon: Icons.map_outlined),
          _VenueTile(title: 'Upcoming Events', icon: Icons.event_outlined),
          _VenueTile(title: 'Past Events', icon: Icons.history),
          _VenueTile(title: 'Ratings & Reviews', icon: Icons.star_border),
        ],
      ),
    );
  }
}

class _VenueTile extends StatelessWidget {
  const _VenueTile({required this.title, required this.icon});

  final String title;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: Icon(icon),
        title: Text(title),
        subtitle: const Text('Profile module ready for Supabase data.'),
      ),
    );
  }
}
