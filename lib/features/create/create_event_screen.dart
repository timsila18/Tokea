import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../core/theme/tokea_theme.dart';

enum EventVisibility { public, private, inviteOnly }

class CreateEventScreen extends StatefulWidget {
  const CreateEventScreen({super.key});

  @override
  State<CreateEventScreen> createState() => _CreateEventScreenState();
}

class _CreateEventScreenState extends State<CreateEventScreen> {
  final _title = TextEditingController();
  final _category = TextEditingController(text: 'Music');
  final _description = TextEditingController();
  final _venue = TextEditingController();
  final _date = TextEditingController();
  final _startTime = TextEditingController();
  final _endTime = TextEditingController();
  final _poster = TextEditingController();
  final _gallery = TextEditingController();
  final _videos = TextEditingController();
  final _organizerName = TextEditingController();
  final _organizerLogo = TextEditingController();
  final _organizerContacts = TextEditingController();
  var _visibility = EventVisibility.public;
  var _saving = false;

  Future<void> _save({required bool publish}) async {
    setState(() => _saving = true);
    try {
      final client = Supabase.instance.client;
      final profileId = client.auth.currentUser?.id;
      if (profileId == null) return;

      final organizer = await client
          .from('organizer_profiles')
          .select('id')
          .eq('profile_id', profileId)
          .maybeSingle();

      if (organizer == null) {
        _show('Organizer profile required before creating events.');
        return;
      }

      await client.from('events').insert({
        'organizer_id': organizer['id'],
        'title': _title.text.trim(),
        'description': _description.text.trim(),
        'caption': _description.text.trim(),
        'location_name': _venue.text.trim(),
        'venue': _venue.text.trim(),
        'starts_at': DateTime.now().toUtc().toIso8601String(),
        'ends_at': DateTime.now().add(const Duration(hours: 3)).toUtc().toIso8601String(),
        'visibility': _visibility.name == 'inviteOnly' ? 'invite_only' : _visibility.name,
        'status': publish ? 'published' : 'draft',
      });

      _show(publish ? 'Event published.' : 'Draft saved.');
    } on PostgrestException catch (error) {
      _show(error.message);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  void _show(String message) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 5,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Create Event'),
          bottom: const TabBar(
            isScrollable: true,
            tabs: [
              Tab(text: 'Details'),
              Tab(text: 'Media'),
              Tab(text: 'Organizer'),
              Tab(text: 'Visibility'),
              Tab(text: 'Publish'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            _StepScaffold(
              children: [
                _Field(controller: _title, label: 'Event Name'),
                _Field(controller: _category, label: 'Category'),
                _Field(controller: _description, label: 'Description', maxLines: 4),
                _Field(controller: _venue, label: 'Venue'),
                _Field(controller: _date, label: 'Date'),
                Row(
                  children: [
                    Expanded(child: _Field(controller: _startTime, label: 'Start Time')),
                    const SizedBox(width: 12),
                    Expanded(child: _Field(controller: _endTime, label: 'End Time')),
                  ],
                ),
              ],
            ),
            _StepScaffold(
              children: [
                _Field(controller: _poster, label: 'Event Poster URL'),
                _Field(controller: _gallery, label: 'Gallery Images URLs', maxLines: 3),
                _Field(controller: _videos, label: 'Event Videos URLs', maxLines: 3),
                const _PremiumHint(text: 'Storage upload hooks will connect here for posters, galleries, and promo videos.'),
              ],
            ),
            _StepScaffold(
              children: [
                _Field(controller: _organizerName, label: 'Organizer Name'),
                _Field(controller: _organizerLogo, label: 'Organizer Logo URL'),
                _Field(controller: _organizerContacts, label: 'Organizer Contacts', maxLines: 3),
              ],
            ),
            _StepScaffold(
              children: [
                SegmentedButton<EventVisibility>(
                  segments: const [
                    ButtonSegment(value: EventVisibility.public, label: Text('Public'), icon: Icon(Icons.public)),
                    ButtonSegment(value: EventVisibility.private, label: Text('Private'), icon: Icon(Icons.lock_outline)),
                    ButtonSegment(value: EventVisibility.inviteOnly, label: Text('Invite'), icon: Icon(Icons.mail_outline)),
                  ],
                  selected: {_visibility},
                  onSelectionChanged: (value) => setState(() => _visibility = value.first),
                ),
                const _PremiumHint(text: 'Public events appear in discovery. Private and invite-only events stay hidden from broad recommendations.'),
              ],
            ),
            _StepScaffold(
              children: [
                _PreviewCard(
                  title: _title.text,
                  venue: _venue.text,
                  description: _description.text,
                  visibility: _visibility,
                ),
                ElevatedButton.icon(
                  onPressed: _saving ? null : () => _save(publish: true),
                  icon: const Icon(Icons.rocket_launch_outlined),
                  label: Text(_saving ? 'Publishing...' : 'Publish Event'),
                ),
                OutlinedButton.icon(
                  onPressed: _saving ? null : () => _save(publish: false),
                  icon: const Icon(Icons.drafts_outlined),
                  label: const Text('Save Draft'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _StepScaffold extends StatelessWidget {
  const _StepScaffold({required this.children});

  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(18),
      children: [
        for (final child in children) Padding(
          padding: const EdgeInsets.only(bottom: 16),
          child: child,
        ),
      ],
    );
  }
}

class _Field extends StatelessWidget {
  const _Field({required this.controller, required this.label, this.maxLines = 1});

  final TextEditingController controller;
  final String label;
  final int maxLines;

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      maxLines: maxLines,
      decoration: InputDecoration(labelText: label),
    );
  }
}

class _PreviewCard extends StatelessWidget {
  const _PreviewCard({
    required this.title,
    required this.venue,
    required this.description,
    required this.visibility,
  });

  final String title;
  final String venue;
  final String description;
  final EventVisibility visibility;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: TokeaColors.surface,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: TokeaColors.gold.withOpacity(0.28)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const AspectRatio(
            aspectRatio: 1.55,
            child: DecoratedBox(
              decoration: BoxDecoration(color: Colors.black),
              child: Center(child: Icon(Icons.image_outlined, size: 64, color: TokeaColors.gold)),
            ),
          ),
          const SizedBox(height: 16),
          Text(title.isEmpty ? 'Preview Event' : title, style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w900)),
          const SizedBox(height: 6),
          Text(venue.isEmpty ? 'Venue' : venue),
          const SizedBox(height: 10),
          Text(description.isEmpty ? 'Your event caption and description will appear here.' : description),
          const SizedBox(height: 12),
          Chip(label: Text(visibility.name)),
        ],
      ),
    );
  }
}

class _PremiumHint extends StatelessWidget {
  const _PremiumHint({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: TokeaColors.gold.withOpacity(0.08),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Text(text),
    );
  }
}
